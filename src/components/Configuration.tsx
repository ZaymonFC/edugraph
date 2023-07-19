import { useSetAtom } from "jotai/react";
import { atomWithStorage } from "jotai/utils";
import { useState } from "react";
import { Button } from "./BasicButton";
import { styled } from "../Stitches";
import { TextInput } from "./TextInput";

const keyAtom = atomWithStorage<string | undefined>(
  "open-ai-api-key",
  undefined
);

const Stack = styled("div", {
  padding: "$3",
  display: "flex",
  flexDirection: "column",

  gap: "$3",
});

const CaptureContainer = styled("div", {
  padding: "$5",

  maxWidth: "400px",
  margin: "0 auto",

  backgroundColor: "rgba(0, 0, 0, 0.2)",
  borderRadius: "$2",
  border: "2px solid rgb(241, 200, 146)",
});

export function CaptureApiKey() {
  const setKey = useSetAtom(keyAtom);

  const [value, setValue] = useState("");

  const onUpdate = () => {
    setKey(value);
    setValue("");
  };

  return (
    <CaptureContainer>
      <Stack>
        <p>Configuration</p>
        <TextInput value={value} onChange={(e) => setValue(e.target.value)} />
        <Button size="sm" onClick={onUpdate}>
          Update API Key
        </Button>
      </Stack>
    </CaptureContainer>
  );
}
