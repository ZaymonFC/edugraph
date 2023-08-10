import { completion, userMessage } from "./OpenAi";
import { Graph, NodeId } from "./GraphGeneration";

export function explodeSkill(graph: Graph, skill: NodeId) {
  throw "Not implemented";
}

export function explainSkill(
  key: string,
  graph: Graph,
  skill: NodeId,
  goal: string
) {
  const connections = graph.edges.filter(
    ({ source, target }) => source === skill || target === skill
  );

  const prompt = `
    Please explain the skill ${skill} in the context of the goal ${goal}.

    Pick the top two of the following related skills and include context as to why ${skill}
    relates to these other skills.

    ${connections
      .map(({ source, target }) => `${source} -> ${target}`)
      .join("\n")}

    NOTE: You can use the following markdown syntax to format your response:

    # Heading 1
    ## Heading 2

    - List item 1
    - List item 2

    1. Numbered list item 1
    2. Numbered list item 2

    **Bold text to add emphasis**
    *Italic text for interest*

    <br />

    \`key terms in backticks\`
    `;

  const messages = [userMessage(prompt)];

  return completion(key, messages);
}
