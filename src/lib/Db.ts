import { atom } from "jotai";
import { Subject } from "rxjs";
import { Graph, NodeId } from "./GraphGeneration";

type RequestStatus = "loading" | "success" | "error";
type RequestId = string;

export type Db = {
  // Version
  version: number;

  // concept and the graph
  concept?: string;
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
export const conceptAtom = atom((get) => get(dbAtom).concept);
export const graphAtom = atom((get) => get(dbAtom).graph);
export const explanationsAtom = atom((get) => get(dbAtom).explanations);
export const requestsAtom = atom((get) => get(dbAtom).requests);

export type Intention =
  | { type: "supply-concept"; concept: string }
  | { type: "build-graph"; concept: string }
  | { type: "explode-skill"; skill: NodeId }
  | { type: "explain-skill"; skill: NodeId };

export type Effect =
  | { type: "concept-supplied"; concept: string }
  | { type: "graph-built"; graph: Graph }
  | { type: "skill-exploded"; skill: NodeId }
  | { type: "skill-explained"; skill: NodeId; explanation: string }
  | {
      type: "request-status-updated";
      requestId: RequestId;
      status: RequestStatus;
    };

export const intentions$Atom = atom<Subject<Intention>>(new Subject<Intention>());

export const effects$Atom = atom<Subject<Effect>>(new Subject<Effect>());
