import { useAtomValue } from "jotai";
import { dbAtom } from "../lib/Db";
import ReactJson from "react-json-view";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "./BasicButton";
import { DialogOverlay, DialogContent, DialogTitle } from "./UI";

import { styled } from "../Stitches";
import { ComponentProps } from "react";

const BottomRight = styled("div", {
  position: "fixed",
  bottom: "$4",
  right: "$4",
  zIndex: 1000,

  "&:hover": {
    cursor: "pointer",
  },
});

const CodeWindow = styled("div", {
  paddingBlock: "$4",
  borderRadius: "$2",

  overflow: "scroll",
  height: "45vh",
});

const jsonOptions: Partial<ComponentProps<typeof ReactJson>> = {
  theme: "ocean",
  collapsed: 2,
  enableClipboard: false,
  indentWidth: 2,
};

export const DevTools = () => {
  const db = useAtomValue(dbAtom);

  return (
    <Dialog.Root>
      <BottomRight>
        <Dialog.Trigger asChild>
          <Button size="sm">☯️</Button>
        </Dialog.Trigger>
      </BottomRight>
      <Dialog.Portal>
        <DialogOverlay />
        <DialogContent width="wide">
          <DialogTitle>App DB</DialogTitle>
          <CodeWindow>
            <ReactJson src={db} {...jsonOptions} />
          </CodeWindow>
          <Dialog.DialogClose asChild>
            <Button size="sm">Close</Button>
          </Dialog.DialogClose>
        </DialogContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
