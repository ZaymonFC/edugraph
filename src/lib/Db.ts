import { atom, useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";
import { Subject } from "rxjs";
import { useSubscription } from "./useSubscription";
import { makeLearningGraph } from "./GraphGen";
import { keyAtom } from "./Configuration";

export type Db = {
  goal?: string;
  graph?: any;
};

export const dbAtom = atom<Db>({});

export const goalAtom = atom((get) => get(dbAtom).goal);

export const graphAtom = atom((get) => get(dbAtom).graph);

type AppEvent =
  | { type: "supply-goal"; goal: string }
  | { type: "build-graph"; goal: string };

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
  const setDb = useSetAtom(dbAtom);
  const appDispatch = useAppDispatch();

  const key = useAtomValue(keyAtom);

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

                  console.log(parsedGraph);

                  return {
                    ...db,
                    graph: parsedGraph,
                  };
                });
              })
              .catch((e) => console.error(e));

            break;
          }
        }
      }),

    [bus$, setDb, appDispatch, key]
  );
};
