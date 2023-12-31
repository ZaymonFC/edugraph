/* eslint-disable @typescript-eslint/no-unsafe-argument */
import Dagre from "@dagrejs/dagre";
import ReactFlow from "reactflow";
import "reactflow/dist/style.css";
import { SkillNode } from "./SkillNode";

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

const customNodes = { SkillNode };

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
      // onNodeClick={(x, { data: { label } }) => console.log(x, label)}
      nodes={nodes}
      edges={edges}
      nodeTypes={customNodes}
      fitView
    ></ReactFlow>
  );
};

export default LayoutFlow;
