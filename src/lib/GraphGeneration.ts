import { useAtomValue } from "jotai";
import { keyAtom } from "./Configuration";
import { useCallback } from "react";
import { completion, conversation, reply, userMessage, response } from "./OpenAi";

const prompts = {
  buildCandidates: (data: { goal: string }) => `
SIMULATION: You are a computational engine that generates a concept map for the following topic: ${data.goal}

Please return a graph in the following JSON format:

\`\`\`
{
"nodes": [ "example", "node", "names" ],
"edges": [
{ "source": "example", "target": "node" },
{ "source": "node", "target": "names" }
}
\`\`\`

- Nodes are the concepts, and are single strings.
- Edges are the relationships between concepts, and are an array of objects with a \`source\` and \`target\` property.

Generate a comprehensive graph and then grade it on the following criteria:

- How well organised is the graph? (0-10)
- How comprehensive is the graph? (0-10)
- Are there sources that could point to more targets (more sub concepts)? (0-10)
- Is the graph arranged in the order that these concepts would typically be learned? (0-10)


For each question, add concise reasoning as to why you picked that score. Make a concise 5 bullet list of specific changes that could be made to improve the score.

Using the 5 bullet list, incorporate this feedback by generating another candidate, making sure to merge the result with the earlier candidate.

Continue this process 2 more times.

Calculate the total rank for each candidate, show the totals.

Pick the best one based on highest score`,

  selectCandidate: "Return just the JSON of the highest ranked candidate.",
};

export type NodeId = string;

export type Graph = {
  nodes: NodeId[];
  edges: { source: NodeId; target: NodeId }[];
};

export const useBuildGraph = () => {
  const key = useAtomValue(keyAtom);

  return useCallback(
    async (goal: string): Promise<Graph | undefined> => {
      if (!key) {
        console.error("API KEY NOT SET (build graph)");
        return;
      }

      const data = { goal };

      const initialMessage = userMessage(prompts.buildCandidates(data));

      const rankedCandidates = await completion(key, conversation(initialMessage));

      const chat = conversation(initialMessage, response(rankedCandidates));

      const chosenGraphMessage = await reply(key, chat, prompts.selectCandidate);

      const chosenGraph = response(chosenGraphMessage).content;

      return JSON.parse(chosenGraph) as Graph;
    },
    [key]
  );
};
