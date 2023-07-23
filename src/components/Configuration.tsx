import * as Dialog from "@radix-ui/react-dialog";
import { useSetAtom } from "jotai/react";
import { useState } from "react";
import { styled } from "../Stitches";
import { keyAtom } from "../lib/Configuration";
import { Button } from "./BasicButton";
import { TextInput } from "./TextInput";
import {
  DialogContent,
  DialogOverlay,
  DialogTitle,
  Fieldset,
  Label,
} from "./UI"; // import your styled components from the correct file

export const FieldSet = styled("fieldset", {
  padding: "$5",

  margin: "0 auto",

  backgroundColor: "rgba(0, 0, 0, 0.2)",
  borderRadius: "$2",
  border: "2px solid rgb(241, 200, 146)",
});

export const ConfigurationDialog = () => {
  const setKey = useSetAtom(keyAtom);
  const [value, setValue] = useState("");

  const onUpdate = () => {
    console.log("Setting Key", value);
    setKey(value);
    setValue("");
  };

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button>Open Configuration</Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <DialogOverlay />
        <DialogContent>
          <DialogTitle>Configuration</DialogTitle>
          <Fieldset>
            <Label htmlFor="apiKey">API Key</Label>
            <TextInput
              placeholder="xxx-xxx-xxx-xxx-xxx-xxx-xxx-xxx"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </Fieldset>
          <Dialog.DialogClose asChild>
            <Button size="sm" onClick={onUpdate}>
              Update API Key
            </Button>
          </Dialog.DialogClose>
        </DialogContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ConfigurationDialog;
