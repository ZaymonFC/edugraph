import { atom, useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";
import { Subject } from "rxjs";
import { keyAtom } from "./Configuration";
import { Graph, NodeId, explainSkill, makeLearningGraph } from "./Prompts";
import { useSubscription } from "./useSubscription";
import { versionsAtom } from "./useVersions";

type RequestStatus = "loading" | "success" | "error";
type RequestId = string;

export type Db = {
  // Version
  version: number;

  // Goals and the graph
  goal?: string;
  graph?: Graph;

  // Explanations
  explanations?: Record<string, string>;
  currentExplanation?: string;

  // Machinery
  requests?: Record<RequestId, RequestStatus>;
};

export const initialDbState: Db = { version: 0 };

export const dbAtom = atom<Db>(initialDbState);

// Slice atoms
export const goalAtom = atom((get) => get(dbAtom).goal);
export const graphAtom = atom((get) => get(dbAtom).graph);
export const explanationsAtom = atom((get) => get(dbAtom).explanations);
export const requestsAtom = atom((get) => get(dbAtom).requests);

export type Intention =
  | { type: "supply-goal"; goal: string }
  | { type: "build-graph"; goal: string }
  | { type: "explode-skill"; skill: NodeId }
  | { type: "explain-skill"; skill: NodeId };

export type Effect =
  | { type: "goal-supplied"; goal: string }
  | { type: "graph-built"; graph: Graph }
  | { type: "skill-exploded"; skill: NodeId }
  | { type: "skill-explained"; skill: NodeId; explanation: string }
  | {
      type: "request-status-updated";
      requestId: RequestId;
      status: RequestStatus;
    };

export const intentions$Atom = atom<Subject<Intention>>(
  new Subject<Intention>()
);
export const effects$Atom = atom<Subject<Effect>>(new Subject<Effect>());
