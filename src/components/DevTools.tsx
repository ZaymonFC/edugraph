import * as Dialog from "@radix-ui/react-dialog";
import React, { ComponentProps } from "react";
import ReactDiffViewer, { DiffMethod } from "react-diff-viewer";
import ReactJson from "react-json-view";
import { styled } from "../Stitches";
import { Version, versionsAtom } from "../lib/useVersions";
import { Button } from "./BasicButton";
import { DialogContent, DialogOverlay, DialogTitle } from "./UI";
import { useAtomValue } from "jotai";

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
  name: null,
};

// Using CSS Grid, add a side bar
const GridContainer = styled("div", {
  display: "grid",
  gridTemplateColumns: "5fr 2fr",

  gridGap: "$4",

  height: "100%",
});

const ScrollFlex = styled("div", {
  paddingRight: "$5",
  overflow: "scroll",

  display: "flex",
  flexDirection: "column",

  scrollSnapType: "y mandatory",

  gap: "$4",
});

const prettyStringifyJson = (json: any) => JSON.stringify(json, null, 2);

const HoverContainer = styled("div", {
  borderRadius: 4,
  padding: "$4",

  scrollSnapAlign: "start",

  border: "2px solid rgba(255, 255, 255, 0.2)",
  transition: "all 0.1s ease-in-out",
  "&:hover": {
    cursor: "pointer",
    border: "2px solid rgb(241, 200, 146)",
  },
});

export const VersionExplorer = ({ versions }: { versions: Version[] }) => {
  const [diff, setDiff] = React.useState<{ old: string; new: string } | undefined>();

  const selectDiff = (idx: number) => {
    const old = versions[idx - 1][0];
    const newDb = versions[idx][0];

    if (!old || !newDb) return;

    setDiff({ old: prettyStringifyJson(old), new: prettyStringifyJson(newDb) });
  };

  return (
    <GridContainer>
      {diff ? (
        <ScrollFlex>
          <ReactDiffViewer
            oldValue={diff.old}
            newValue={diff.new}
            hideLineNumbers={true}
            splitView={false}
            useDarkTheme={true}
            compareMethod={DiffMethod.CHARS}
          />
        </ScrollFlex>
      ) : (
        versions.map(([db, _], idx) => {
          if (idx === 0) {
            return <ReactJson key={idx} src={db} {...jsonOptions} />;
          }
        })
      )}

      <ScrollFlex>
        {versions
          .map(([_, effect], idx) => {
            if (!effect) return null;

            const { type, ...rest } = effect;

            return (
              <div key={idx} onMouseEnter={() => selectDiff(idx)}>
                <HoverContainer>
                  <p>{type}</p>
                  <ReactJson src={rest} {...jsonOptions} />
                </HoverContainer>
              </div>
            );
          })
          .reverse()}
      </ScrollFlex>
    </GridContainer>
  );
};

export const DevTools = () => {
  const versions = useAtomValue(versionsAtom);

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
            <VersionExplorer versions={versions} />
          </CodeWindow>
          <Dialog.DialogClose asChild>
            <Button size="sm">Close</Button>
          </Dialog.DialogClose>
        </DialogContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
