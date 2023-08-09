import { atom } from "jotai";
import { Db, Effect, initialDbState } from "./Db";

export type Version = [Db, Effect | undefined];

export const versionsAtom = atom([[initialDbState, undefined]] as Version[]);
