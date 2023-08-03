import { completion, userMessage } from "./OpenAi";

export type NodeId = string;

export type Graph = {
  nodes: NodeId[];
  edges: { source: NodeId; target: NodeId }[];
};

export function makeLearningGraph(key: string, goal: string) {
  const prompt = `
    SIMULATION: You are a computational engine that, given a goal or field of study, you can determine
    the set of skills that are most important to learn in order to achieve that goal.

    Note: The set of skills should not be exhaustive, but a pragmatic subset of the most important concepts most likely to help
    acheive the goal.

    It's not enough to identify the skills and methods, you must build a dependency graph, recursively going back up the branches
    of the skill tree until you reach skills that the average high school student would know.

    For example, if I asked how to program a web app, some of the skills you might identify are:

    - HTML
    - CSS
    - JavaScript
    - Frontend Frameworks (React, Vue, Angular)
    - Backend Frameworks (Express, Django, Rails)
    - Databases (SQL, NoSQL)
    - Authentication
    - Deployment
    - Testing

    (This is not an exhaustive list, just an example.)

    Please return a graph in the following JSON format:

    \`\`\`
    {
      "nodes": [ "example", "node", "names" ],
      "edges": [
        { "source": "example", "target": "node" },
        { "source": "node", "target": "names" }
    }
    \`\`\`

    Note: Every node must have at least one edge.
    Note: Make sure that the edge makes sense in the context of the goal. If you can't create an edge for a node, don't include it.

    GOAL: ${goal}
	`;

  const messages = [userMessage(prompt)];

  return completion(key, messages);
}

export function explodeSkill(graph: Graph, skill: NodeId) {
  return null;
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

    Look at the following connections in the skill graph and include context as to why ${skill}
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

    **Bold text**
    *Italic text*

    <br /> `;

  const messages = [userMessage(prompt)];

  return completion(key, messages);
}
