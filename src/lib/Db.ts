import { atom, useAtom, useAtomValue } from "jotai";
import { useCallback } from "react";
import { Subject } from "rxjs";
import { keyAtom } from "./Configuration";
import { Graph, NodeId, explainSkill, makeLearningGraph } from "./Prompts";
import { useSubscription } from "./useSubscription";

export type Db = {
  goal?: string;
  graph?: Graph;
  explanations?: Record<string, string>;
};

export const dbAtom = atom<Db>({});

export const goalAtom = atom((get) => get(dbAtom).goal);
export const graphAtom = atom((get) => get(dbAtom).graph);

type AppEvent =
  | { type: "supply-goal"; goal: string }
  | { type: "build-graph"; goal: string }
  | { type: "explode-skill"; skill: NodeId }
  | { type: "explain-skill"; skill: NodeId }
  | { type: "present-explanation"; skill: NodeId };

const bus$Atom = atom<Subject<AppEvent>>(new Subject<AppEvent>());

export const useAppDispatch = () => {
  const bus$ = useAtomValue(bus$Atom);

  return useCallback(
    (event: AppEvent) => {
      bus$.next(event);
    },
    [bus$]
  );
};

export const useHandleAppEvents = () => {
  // Mechanical
  const bus$ = useAtomValue(bus$Atom);
  const [db, setDb] = useAtom(dbAtom);
  const appDispatch = useAppDispatch();

  const key = useAtomValue(keyAtom);

  useSubscription(
    () =>
      bus$.subscribe((event) => {
        console.log("EVENT: ", event);
      }),

    [bus$]
  );

  useSubscription(
    () =>
      bus$.subscribe((event) => {
        switch (event.type) {
          case "supply-goal": {
            setDb((db) => ({ ...db, goal: event.goal }));
            appDispatch({ type: "build-graph", goal: event.goal });
            break;
          }
          case "build-graph": {
            if (!key) {
              console.error("No key");
              return;
            }

            makeLearningGraph(key, event.goal)
              .then((graph) => {
                setDb((db) => {
                  const parsedGraph = JSON.parse(
                    graph.choices[0].message.content as unknown as string
                  );
                  return { ...db, graph: parsedGraph };
                });
              })
              .catch((e) => console.error(e));

            break;
          }
          case "explode-skill": {
            // Take the current graph

            // For a particular skill, decompose it into its subskills

            // Add those subskills to the graph

            break;
          }

          case "explain-skill": {
            if (!key || !db.graph || !db.goal) {
              console.error("No key, graph, or goal found to explain skill.");
              return;
            }

            // TODO: Check the cache first!

            explainSkill(key, db.graph, event.skill, db.goal)
              .then((response) => {
                const explanation = response.choices[0].message.content;

                console.log(response, explanation);

                setDb({
                  ...db,
                  explanations: {
                    ...db.explanations,
                    [event.skill]: explanation,
                  },
                });
              })
              .then(() => {
                appDispatch({
                  type: "present-explanation",
                  skill: event.skill,
                });
              })
              .catch((e) => console.error(e));

            break;
          }

          case "present-explanation": {
            if (!db.explanations) {
              console.error("No explanations found.");
              return;
            }

            const explanation = db.explanations[event.skill];
            console.log(explanation);

            // TODO: Present the explanation to the user
            break;
          }
        }
      }),

    [bus$, setDb, appDispatch, key, db.goal, db.graph, db.explanations]
  );
};
