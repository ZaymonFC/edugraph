import { useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";
import { keyAtom } from "./Configuration";
import {
  effects$Atom,
  dbAtom,
  Db,
  requestsAtom,
  intentions$Atom,
  Intention,
  Effect,
} from "./Db";
import { explainSkill } from "./Prompts";
import { useSubscription } from "./useSubscription";
import { versionsAtom } from "./useVersions";
import { useBuildGraph } from "./GraphGeneration";

export const useAppDispatch = () => {
  const intentions$ = useAtomValue(intentions$Atom);
  return useCallback(
    (intention: Intention) => {
      intentions$.next(intention);
    },
    [intentions$]
  );
};

const useEffectDispatch = () => {
  const effects$ = useAtomValue(effects$Atom);

  return useCallback(
    (effect: Effect) => {
      effects$.next(effect);
    },
    [effects$]
  );
};

export const useHandleIntentions = () => {
  const intentions$ = useAtomValue(intentions$Atom);
  const dispatch = useEffectDispatch();
  const key = useAtomValue(keyAtom);

  const db = useAtomValue(dbAtom);

  const buildGraph = useBuildGraph();

  useSubscription(
    () =>
      intentions$.subscribe((intention) => {
        switch (intention.type) {
          case "supply-concept": {
            dispatch({ type: "concept-supplied", concept: intention.concept });
            break;
          }
          case "build-graph": {
            if (!key) {
              console.error("No key");
              return;
            }
            dispatch({
              type: "request-status-updated",
              requestId: "make-graph",
              status: "loading",
            });

            buildGraph(intention.concept)
              .then((graph) => {
                if (!graph) return;

                dispatch({
                  type: "request-status-updated",
                  requestId: "make-graph",
                  status: "success",
                });
                dispatch({ type: "graph-built", graph });
              })
              .catch((e) => console.error(e));

            break;
          }
          case "explode-skill": {
            // Logic for exploding a skill goes here
            break;
          }
          case "explain-skill": {
            if (!key || !db.graph || !db.concept) {
              console.error("No key, graph, or concept found to explain skill.");
              return;
            }

            const requestId = `explain-skill-${intention.skill}`;

            dispatch({
              type: "request-status-updated",
              requestId,
              status: "loading",
            });

            explainSkill(key, db.graph, intention.skill, db.concept)
              .then((response) => {
                const explanation = response.choices[0].message.content;
                dispatch({
                  type: "skill-explained",
                  skill: intention.skill,
                  explanation,
                });
                dispatch({
                  type: "request-status-updated",
                  requestId,
                  status: "success",
                });
              })
              .catch((e) => {
                dispatch({
                  type: "request-status-updated",
                  requestId,
                  status: "error",
                });
                console.error(e);
              });
            break;
          }
          default: {
            console.error("Unknown intention", intention);
            console.warn('You forgot to handle it in "useHandleIntentions".');

            break;
          }
        }
      }),
    [intentions$, dispatch, key, db, buildGraph]
  );
};

export const useHandleEffects = () => {
  const effects$ = useAtomValue(effects$Atom);
  const set = useSetAtom(dbAtom);

  const setVersions = useSetAtom(versionsAtom);

  const mkSetDb = useCallback(
    (causalityEffect: Effect) => (stateUpdate: (db: Db) => Db) => {
      set((db) => {
        const updatedDb = stateUpdate(db);
        const updatedDbWithVersion = {
          ...updatedDb,
          version: updatedDb.version + 1,
        };

        setVersions((versions) => [
          ...versions,
          [updatedDbWithVersion, causalityEffect],
        ]);

        return updatedDbWithVersion;
      });
    },
    [set, setVersions]
  );

  const dispatch = useAppDispatch();

  useSubscription(
    () =>
      effects$.subscribe((effect) => {
        const setDb = mkSetDb(effect);

        switch (effect.type) {
          case "concept-supplied": {
            const { concept } = effect;
            setDb((db) => ({ ...db, concept }));
            dispatch({ type: "build-graph", concept });
            break;
          }
          case "graph-built": {
            setDb((db) => ({ ...db, graph: effect.graph }));
            break;
          }
          case "skill-exploded": {
            console.error("Skill exploded not implemented");
            break;
          }
          case "skill-explained": {
            setDb((db) => ({
              ...db,
              explanations: {
                ...db.explanations,
                [effect.skill]: effect.explanation,
              },
            }));
            break;
          }
          case "request-status-updated": {
            setDb((db) => ({
              ...db,
              requests: {
                ...db.requests,
                [effect.requestId]: effect.status,
              },
            }));
            break;
          }
          default: {
            console.error("Unknown effect", effect);
            console.warn('You forgot to handle it in "useHandleEffects".');

            break;
          }
        }
      }),
    [effects$, dispatch, mkSetDb]
  );
};

export const useAppLogging = () => {
  const effects$ = useAtomValue(effects$Atom);
  const intentions$ = useAtomValue(intentions$Atom);

  useSubscription(
    () =>
      effects$.subscribe((effect) => {
        console.log("Effect", effect);
      }),
    [effects$]
  );

  useSubscription(
    () =>
      intentions$.subscribe((intention) => {
        console.log("Intention", intention);
      }),
    [intentions$]
  );
};

export const useThinkingIndicator = (): "thinking" | "idle" => {
  const requests = useAtomValue(requestsAtom);

  if (requests === undefined) return "idle";

  const loading = Object.values(requests).some(
    (requestStatus) => requestStatus === "loading"
  );

  return loading ? "thinking" : "idle";
};
