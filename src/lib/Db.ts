import { atom, useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";
import { Subject } from "rxjs";
import { keyAtom } from "./Configuration";
import { Graph, NodeId, explainSkill, makeLearningGraph } from "./Prompts";
import { useSubscription } from "./useSubscription";

export type Db = {
  goal?: string;
  graph?: Graph;

  explanations?: Record<string, string>;
  currentExplanation?: string;
};

export const dbAtom = atom<Db>({});

export const goalAtom = atom((get) => get(dbAtom).goal);
export const graphAtom = atom((get) => get(dbAtom).graph);

type Intention =
  | { type: "supply-goal"; goal: string }
  | { type: "build-graph"; goal: string }
  | { type: "explode-skill"; skill: NodeId }
  | { type: "explain-skill"; skill: NodeId };

type Effect =
  | { type: "goal-supplied"; goal: string }
  | { type: "graph-built"; graph: Graph }
  | { type: "skill-exploded"; skill: NodeId }
  | { type: "skill-explained"; skill: NodeId; explanation: string };

const intentions$Atom = atom<Subject<Intention>>(new Subject<Intention>());
const effects$Atom = atom<Subject<Effect>>(new Subject<Effect>());

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

  useSubscription(
    () =>
      intentions$.subscribe((intention) => {
        switch (intention.type) {
          case "supply-goal": {
            dispatch({ type: "goal-supplied", goal: intention.goal });
            break;
          }
          case "build-graph": {
            if (!key) {
              console.error("No key");
              return;
            }
            makeLearningGraph(key, intention.goal)
              .then((graph) => {
                const parsedGraph = JSON.parse(
                  graph.choices[0].message.content as unknown as string
                );
                dispatch({ type: "graph-built", graph: parsedGraph });
              })
              .catch((e) => console.error(e));
            break;
          }
          case "explode-skill": {
            // Logic for exploding a skill goes here
            break;
          }
          case "explain-skill": {
            if (!key || !db.graph || !db.goal) {
              console.error("No key, graph, or goal found to explain skill.");
              return;
            }

            explainSkill(key, db.graph, intention.skill, db.goal)
              .then((response) => {
                const explanation = response.choices[0].message.content;
                dispatch({
                  type: "skill-explained",
                  skill: intention.skill,
                  explanation,
                });
              })
              .catch((e) => console.error(e));
            break;
          }
        }
      }),
    [intentions$, dispatch, key, db]
  );
};

export const useHandleEffects = () => {
  const effects$ = useAtomValue(effects$Atom);
  const setDb = useSetAtom(dbAtom);

  const dispatch = useAppDispatch();

  useSubscription(
    () =>
      effects$.subscribe((effect) => {
        switch (effect.type) {
          case "goal-supplied": {
            const { goal } = effect;
            setDb((db) => ({ ...db, goal }));
            dispatch({ type: "build-graph", goal });
            break;
          }
          case "graph-built": {
            setDb((db) => ({ ...db, graph: effect.graph }));
            break;
          }
          case "skill-exploded": {
            // Logic for handling exploded skill goes here
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
        }
      }),
    [effects$, dispatch, setDb]
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
