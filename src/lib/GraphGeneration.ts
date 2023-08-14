import { useAtomValue } from "jotai";
import { keyAtom } from "./Configuration";
import { useCallback } from "react";
import { completion, conversation, userMessage, response } from "./OpenAi";
import { z } from "zod";
import { extractJSONBlocks } from "./parsing";

const prompts = {
  buildCandidates: (data: { goal: string }) => `
SIMULATION: You are a computational engine that generates a concept map for the following topic: ${data.goal}

Please return a graph in the following JSON format, including the markdown fence.

\`\`\`json
{
  "metadata": { "candidate": <iteration number> },
  "nodes": [ "example", "node", "names" ],
  "edges": [["example", "node"], ["node", "names"]]
}
\`\`\`

- Nodes are the concepts, and are single strings.
- Edges are the relationships between concepts, and are an array of tuples where the first element is the source, and the second element is the target.

Generate a comprehensive graph and then grade it on the following criteria:

- How well organised is the graph? (0-10)
- Are there sources that could point to more targets (more sub concepts)? (0-10)
- Is the graph comprehensive? (0-10)
- Is the graph arranged in the order that these concepts would typically be learned? (0-10)


For each question, add concise reasoning as to why you picked that score. Make a concise 5 bullet list of specific changes that could be made to improve the score.

Using the 5 bullet list, incorporate this feedback by generating another candidate, making sure to merge the result with the earlier candidate.

Continue this process 2 more times.

DON'T add feedback for the final iteration.

Tally up the scores of each candidate in the following JSON format:

\`\`\`json
[
  {"candidate": 1, scores: [...], total: ... },
  ...
]
\`\`\`
`,

  selectCandidate: "Return just the JSON of the highest ranked candidate.",
};

export type NodeId = string;

const GraphSchema = z.object({
  metadata: z.object({
    candidate: z.number(),
  }),
  nodes: z.array(z.string()),
  edges: z.array(z.tuple([z.string(), z.string()])),
});

export type Graph = z.infer<typeof GraphSchema>;

const CandidateScoreSchema = z.object({
  candidate: z.number(),
  scores: z.array(z.number()),
  total: z.number(),
});

const CandidateScoresSchema = z.array(CandidateScoreSchema);

type CandidateScores = z.infer<typeof CandidateScoresSchema>;

const highScore = (scores: CandidateScores) => {
  if (scores.length === 0) {
    throw new Error("No scores");
  }

  const sorted = scores.sort((a, b) => b.total - a.total);
  return sorted[0].candidate;
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

      const rankedCandidates = await completion(
        key,
        conversation(initialMessage)
      ).then(response);

      console.log(rankedCandidates.content);

      const blobs = extractJSONBlocks(rankedCandidates.content);

      const candidates = blobs
        .map((blob: any) => {
          try {
            return GraphSchema.parse(blob);
          } catch (e) {
            return undefined;
          }
        })
        .filter((x) => x !== undefined) as Graph[];

      const scores = findScores(blobs);

      if (!scores) {
        throw new Error("No scores");
      }

      const chosenGraph = highScore(scores);

      const bestCandidate = candidates.find(
        (x) => x.metadata.candidate === chosenGraph
      );

      if (!bestCandidate) {
        throw new Error("No best candidate");
      }

      return bestCandidate;
    },
    [key]
  );
};

export function findScores(blobs: any[]): CandidateScores | undefined {
  return (
    blobs
      .map((blob: any) => {
        try {
          return CandidateScoresSchema.parse(blob);
        } catch (e) {
          return undefined;
        }
      })
      .filter((x) => x !== undefined) as CandidateScores[]
  )[0];
}
