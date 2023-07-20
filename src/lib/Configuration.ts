import { atomWithStorage } from "jotai/utils";

export const keyAtom = atomWithStorage<string | undefined>(
  "open-ai-api-key",
  undefined
);
