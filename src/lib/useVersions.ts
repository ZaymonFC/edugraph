import { useAtomValue } from "jotai";
import { Db, Effect, dbAtom, effects$Atom } from "./Db";
import { useEffect, useState } from "react";
import { useSubscription } from "./useSubscription";

export type Version = [Db, Effect | undefined];

/// Effect comes in, db get's updated.
// We want to track this change of state, correlating to the effect that caused it.
export const useVersions = () => {
  const db = useAtomValue(dbAtom);
  const effects$ = useAtomValue(effects$Atom);

  const [versions, setVersions] = useState<Version[]>([[db, undefined]]);
  const [lastEffect, setLastEffect] = useState<Effect | undefined>(undefined);

  useEffect(() => {
    console.log("Last Effect", lastEffect);
  }, [lastEffect]);

  useSubscription(
    () =>
      effects$.subscribe((effect) => {
        setLastEffect(effect);
      }),
    [effects$, setLastEffect]
  );

  useEffect(() => {
    if (lastEffect === undefined) return;
    setVersions((snapshots) => [...snapshots, [db, lastEffect]]);
  }, [db, lastEffect]);

  return versions;
};
