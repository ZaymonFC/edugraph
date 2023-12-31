import { useAtomValue } from "jotai";
import { useState } from "react";
import { styled } from "./Stitches";
import { Button } from "./components/BasicButton";
import ConfigurationDialog, { FieldSet } from "./components/Configuration";
import { TextInput } from "./components/TextInput";
import {
  useAppDispatch,
  useHandleIntentions,
  useHandleEffects,
  useAppLogging,
  useThinkingIndicator,
} from "./lib/useDb";
import { conceptAtom, graphAtom } from "./lib/Db";
import { motion } from "framer-motion";

import "reactflow/dist/style.css";
import LayoutFlow from "./components/LayoutFlow";
import { ReactFlowProvider } from "reactflow";
import { DevTools } from "./components/DevTools";

const Page = styled("div", {
  margin: 0,
  padding: "$4",

  backgroundColor: "$background",

  minHeight: "100vh",
});

function GetStarted() {
  const [concept, setConcept] = useState("");

  const dispatch = useAppDispatch();

  const handleGetStarted = () => {
    dispatch({ type: "supply-concept", concept });
    setConcept("");
  };

  const handleOnEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleGetStarted();
    }
  };

  return (
    <FieldSet>
      <legend>Concept</legend>
      <TextInput
        value={concept}
        onChange={(v) => setConcept(v.target.value)}
        onKeyDown={handleOnEnter}
        placeholder="What do you want to learn?"
      />
      <Button onClick={handleGetStarted}>Get started</Button>
    </FieldSet>
  );
}

const CurrentConcept = () => {
  const concept = useAtomValue(conceptAtom);

  if (!concept) return null;

  return <div>Current concept: {concept}</div>;
};

const ThinkingIndicator = () => {
  const thinking = useThinkingIndicator();

  if (thinking !== "thinking") return null;

  const radius = 5;
  const strokeWidth = 2;
  const dimension = radius * 2 + strokeWidth;
  const viewBox = `0 0 ${dimension} ${dimension}`;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        flexDirection: "row",
        gap: 4,
      }}
    >
      <p>Thinking...</p>
      <motion.svg width={dimension} height={dimension} viewBox={viewBox}>
        <motion.circle
          cx={radius + strokeWidth / 2}
          cy={radius + strokeWidth / 2}
          r={radius}
          strokeLinecap={"round"}
          stroke="#fff"
          strokeWidth={strokeWidth}
          fillOpacity={0}
          animate={{ pathLength: [3, 1, 0], pathOffset: [1, 0, 0] }}
          transition={{
            duration: 0.8, // duration in seconds
            ease: "easeInOut",
            repeat: Infinity, // infinitely repeating
            repeatType: "mirror", // alternates between animation states
          }}
        />
      </motion.svg>
    </div>
  );
};

function NodeGraph() {
  const graph = useAtomValue(graphAtom);

  if (!graph) return null;

  const initialNodes = graph.nodes.map((node: string, idx: number) => ({
    id: node,
    position: { x: 0, y: idx * 100 },
    data: { label: node },
    type: "SkillNode",
  }));

  const initialEdges = graph.edges.map(([source, target]) => ({
    id: source + target,
    source: source,
    target: target,
  }));

  return (
    <div style={{ width: "100vw", height: 800 }}>
      <LayoutFlow initialNodes={initialNodes} initialEdges={initialEdges} />
    </div>
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

      <CurrentConcept />
      <ThinkingIndicator />

      <DevTools />

      <ReactFlowProvider>
        <NodeGraph />
      </ReactFlowProvider>
    </Page>
  );
}

export default App;
