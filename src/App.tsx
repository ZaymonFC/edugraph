/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useAtomValue } from "jotai";
import { useState } from "react";
import { styled } from "./Stitches";
import { Button } from "./components/BasicButton";
import { Configuration, FieldSet } from "./components/Configuration";
import { TextInput } from "./components/TextInput";
import {
  goalAtom,
  graphAtom,
  useAppDispatch,
  useHandleAppEvents,
} from "./lib/Db";

const Page = styled("div", {
  margin: 0,
  padding: "$4",

  backgroundColor: "$background",

  minHeight: "100vh",
});

function GetStarted() {
  const [goal, setGoal] = useState("");

  const dispatch = useAppDispatch();

  const handleGetStarted = () => {
    dispatch({ type: "supply-goal", goal });
    setGoal("");
  };

  const handleOnEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleGetStarted();
    }
  };

  return (
    <FieldSet>
      <legend>Goal</legend>
      <TextInput
        value={goal}
        onChange={(v) => setGoal(v.target.value)}
        onKeyDown={handleOnEnter}
        placeholder="What do you want to learn?"
      />
      <Button onClick={handleGetStarted}>Get started</Button>
    </FieldSet>
  );
}

const Goal = () => {
  const goal = useAtomValue(goalAtom);

  if (!goal) return null;

  return <div>Current goal: {goal}</div>;
};

function Graph() {
  const graph = useAtomValue(graphAtom);

  if (!graph) return null;

  return (
    <FieldSet>
      <legend>Graph</legend>
      <p>Nodes</p>
      {graph.nodes.map((node: any) => (
        <div key={node}>{node}</div>
      ))}
      <p>Edges</p>
      {graph.edges.map((edge: { source: string; target: string }) => (
        <div key={edge.source + edge.target}>
          {edge.source} -{">"} {edge.target}
        </div>
      ))}
    </FieldSet>
  );
}

function App() {
  useHandleAppEvents();

  return (
    <Page>
      <h2>Edugraph</h2>
      <Configuration />

      <br />
      <GetStarted />

      <Goal></Goal>

      <Graph />
    </Page>
  );
}

export default App;
