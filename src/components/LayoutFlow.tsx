/* eslint-disable @typescript-eslint/no-unsafe-argument */
import Dagre from "@dagrejs/dagre";
import { useEffect } from "react";
import ReactFlow, {
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";

const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes: any, edges: any, options: any) => {
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

const LayoutFlow = ({ initialNodes, initialEdges }: any) => {
  const { fitView } = useReactFlow();

  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);

  // Reinitialise when nodes or edges change using useEffect
  useEffect(() => {
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

    setNodes([...layouted.nodes]);
    setEdges([...layouted.edges]);

    window.requestAnimationFrame(() => {
      fitView();
    });
  }, [initialNodes, initialEdges, setNodes, setEdges, fitView]);

  return <ReactFlow nodes={nodes} edges={edges} fitView></ReactFlow>;
};

export default LayoutFlow;
