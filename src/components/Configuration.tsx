import { useSetAtom } from "jotai/react";
import { useState } from "react";
import { Button } from "./BasicButton";
import { styled } from "../Stitches";
import { TextInput } from "./TextInput";
import { keyAtom } from "../lib/Configuration";

export const FieldSet = styled("fieldset", {
  padding: "$5",

  margin: "0 auto",

  backgroundColor: "rgba(0, 0, 0, 0.2)",
  borderRadius: "$2",
  border: "2px solid rgb(241, 200, 146)",
});

export function Configuration() {
  const setKey = useSetAtom(keyAtom);

  const [value, setValue] = useState("");

  const onUpdate = () => {
    setKey(value);
    setValue("");
  };

  return (
    <FieldSet>
      <legend>Configuration</legend>
      <TextInput
        placeholder="xxx-xxx-xxx-xxx-xxx-xxx-xxx-xxx"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <Button size="sm" onClick={onUpdate}>
        Update API Key
      </Button>
    </FieldSet>
  );
}
