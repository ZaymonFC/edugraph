import { useAtomValue } from "jotai";
import { useState } from "react";
import { styled } from "./Stitches";
import { Button } from "./components/BasicButton";
import ConfigurationDialog, { FieldSet } from "./components/Configuration";
import { TextInput } from "./components/TextInput";
import {
  goalAtom,
  graphAtom,
  useAppDispatch,
  useHandleIntentions,
  useHandleEffects,
  useAppLogging,
} from "./lib/Db";

import "reactflow/dist/style.css";
import LayoutFlow from "./components/LayoutFlow";
import { ReactFlowProvider } from "reactflow";

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

function NodeGraph() {
  const graph = useAtomValue(graphAtom);

  if (!graph) return null;

  const initialNodes = graph.nodes.map((node: string, idx: number) => ({
    id: node,
    position: { x: 0, y: idx * 100 },
    data: { label: node },
    type: "CustomNode",
  }));

  const initialEdges = graph.edges.map(
    (edge: { source: string; target: string }) => ({
      id: edge.source + edge.target,
      source: edge.source,
      target: edge.target,
    })
  );

  return (
    <div style={{ width: "100vw", height: 800 }}>
      <LayoutFlow initialNodes={initialNodes} initialEdges={initialEdges} />
    </div>
  );
}

function Skills() {
  const graph = useAtomValue(graphAtom);

  if (!graph) return null;

  return (
    <FieldSet>
      <legend>Skills</legend>

      {graph.edges.map((edge: { source: string; target: string }) => (
        <div key={edge.source + edge.target}>
          {edge.source} -{">"} {edge.target}
        </div>
      ))}
    </FieldSet>
  );
}

const HStack = styled("div", {
  display: "flex",
  flexDirection: "row",

  alignItems: "center",

  gap: "$4",
});

function App() {
  useHandleIntentions();
  useHandleEffects();

  useAppLogging();

  return (
    <Page>
      <HStack>
        <h2>Edugraph</h2>

        <ConfigurationDialog />
      </HStack>

      <br />
      <GetStarted />

      <Goal />

      <ReactFlowProvider>
        <NodeGraph />
        <Skills />
      </ReactFlowProvider>
    </Page>
  );
}

export default App;
