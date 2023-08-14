import { completion, userMessage } from "./OpenAi";
import { Graph, NodeId } from "./GraphGeneration";

export function explodeSkill(graph: Graph, skill: NodeId) {
  throw "Not implemented";
}

export function explainSkill(
  key: string,
  graph: Graph,
  concept: NodeId,
  context: string
) {
  const connections = graph.edges.filter(
    ([source, target]) => source === concept || target === concept
  );

  const nodes = connections.map(([source, target]) =>
    source === concept ? target : source
  );

  const distinctNodes = [...new Set(nodes)];

  const prompt = `
Context: ${context}
Concept to explain: ${concept}
Related concepts: ${distinctNodes.join(", ")}
Style: Concise, informative, educational; relate back to the context where appropriate

Heading names in the template can be customized as needed.
Emphasize key terms and key words in __bold__ as you deem appropriate.

Follow this structure:
# Heading (name of the concept)
Define and explain the concept, it's origins and history.

Related concepts (only show if there is anything in the related concepts field above).

Further learning (if applicable; include directions for additional study).`;

  const messages = [userMessage(prompt)];

  return completion(key, messages);
}
