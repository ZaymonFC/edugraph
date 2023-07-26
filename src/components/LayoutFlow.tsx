/* eslint-disable @typescript-eslint/no-unsafe-argument */
import Dagre from "@dagrejs/dagre";
import ReactFlow, { Handle, Position } from "reactflow";
import "reactflow/dist/style.css";
import { styled } from "../Stitches";
import { useEffect, useMemo, useState } from "react";
import { Button } from "./BasicButton";
import { Subject, pipe, throttle, throttleTime } from "rxjs";

const getLayoutedElements = (nodes: any, edges: any, options: any) => {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

  g.setGraph({ rankdir: options.direction, ...options });

  edges.forEach((edge: any) => g.setEdge(edge.source, edge.target));
  nodes.forEach((node: any) => g.setNode(node.id, node));

  Dagre.layout(g);

  return {
    nodes: nodes.map((node: any) => {
      const { x, y } = g.node(node.id);

      return { ...node, position: { x, y } };
    }),
    edges,
  };
};

const NodeContainer = styled("div", {
  maxWidth: "180px",

  margin: 0,
  marginTop: -4,
  marginBottom: -1,

  paddingBlock: "$2",
  paddingInline: "$3",

  textAlign: "center",

  border: "1px solid rgb(241, 200, 146)",
  boxShadow: "0px 3px 1px 0px rgb(241, 200, 146)",

  fontFamily: "Jetbrains Mono",
  fontSize: "$1",

  borderRadius: "$2",

  transition: "all 0.1s ease-in-out",

  "&:hover": {
    border: "1px solid rgb(255, 222, 179)",
    boxShadow: "0px 3.5px 1px 0px rgb(241, 200, 146)",
    transform: "translate(0, -1px)",
  },
});

const ButtonStack = styled("div", {
  position: "absolute",

  top: -40,

  display: "flex",
  flexDirection: "row",

  alignItems: "center",

  gap: "$4",
});

// Hook that immediately updates the state and then throttles any further updates
const useThrottledState = (initialValue: boolean, delay: number) => {
  const [value, setValue] = useState(initialValue);
  const [throttledValue, setThrottledValue] = useState(initialValue);

  const s$ = useMemo(() => new Subject<boolean>(), []);

  useEffect(() => s$.next(value), [value, s$]);

  useEffect(() => {
    const sub = s$
      .pipe(throttleTime(delay, undefined, { leading: true, trailing: true }))
      .subscribe((v) => {
        setThrottledValue(v);
      });

    return () => sub.unsubscribe();
  }, [s$, delay]);

  return [throttledValue, setValue] as const;
};

const HideShow = styled("div", {
  opacity: 0,
  transition: "all 0.1s ease-in-out",
  variants: { show: { true: { opacity: 1 }, false: { opacity: 0 } } },
});

const CustomNode = ({ data, ...other }: any) => {
  console.log(data, other);

  const [isHovered, setIsHovered] = useThrottledState(false, 300);

  return (
    <div
      onMouseOver={() => setIsHovered(true)}
      onMouseOut={() => setIsHovered(false)}
    >
      <HideShow show={isHovered}>
        <ButtonStack>
          <Button size="xs">Explain</Button>
          <Button size="xs">Explode</Button>
        </ButtonStack>
      </HideShow>
      <Handle style={{ opacity: 0 }} type="target" position={Position.Top} />
      <NodeContainer>{data.label}</NodeContainer>
      <Handle style={{ opacity: 0 }} type="source" position={Position.Bottom} />
    </div>
  );
};

const LayoutFlow = ({ initialNodes, initialEdges }: any) => {
  const layoutOptions = {
    direction: "TB",
    nodeSep: 200,
    rankSep: 80,
  };

  const layouted = getLayoutedElements(
    initialNodes,
    initialEdges,
    layoutOptions
  );

  const { nodes, edges } = layouted;

  return (
    <ReactFlow
      onNodeClick={(x, { data: { label } }) => console.log(x, label)}
      nodes={nodes}
      edges={edges}
      nodeTypes={{ CustomNode }}
      fitView
    ></ReactFlow>
  );
};

export default LayoutFlow;
