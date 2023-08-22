import { useAtomValue } from "jotai";
import { keyAtom } from "./Configuration";
import { useCallback } from "react";
import { completion, conversation, userMessage, response } from "./OpenAi";
import { z } from "zod";
import { extractJSONBlocks } from "./parsing";

const prompts = {
  buildCandidates: (data: { concept: string }) => `
SIMULATION: You are a computational engine that generates a concept map for the following topic: ${data.concept}

Candidate concept maps must be supplied in the following JSON format, including the markdown fence.

\`\`\`json
{
  "metadata": { "candidate": <iteration number> },
  "nodes": [ "example", "node", "names" ],
  "edges": [["example", "node"], ["node", "names"]]
}
\`\`\`

- Nodes are the concepts, and are single strings.
- Edges are the relationships between concepts, and are an array of tuples where the first element is the source, and the second element is the target.

Show your working! Don't just reply with the JSON.

Generate a comprehensive graph and then grade it on the following criteria:

- How well organised is the graph? (0-10)
- Are there sources that could point to more targets (more sub concepts)? (0-10)
- Is the graph comprehensive? (0-10)
- Is the graph arranged in the order that these concepts would typically be learned? (0-10)

VERY CONCISELY, think of two bullet points for each question that could improve the score.

Using the improvement points, create a new candidate making sure to merge the result with the earlier candidate.

Continue this process 2 more times.

Do not add feedback to the final candidate.

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
    async (concept: string): Promise<Graph | undefined> => {
      if (!key) {
        throw new Error("API KEY NOT SET (build graph)");
      }

      const data = { concept };

      const initialMessage = userMessage(prompts.buildCandidates(data));

      const rankedCandidates = await completion(key, conversation(initialMessage));

      const reply = response(rankedCandidates);

      console.log("reply", reply.content);

      const blobs = extractJSONBlocks(reply.content);

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

      const nodesInEdges = new Set(
        bestCandidate.edges.flatMap(([source, target]) => [source, target])
      );

      return {
        ...bestCandidate,
        edges: bestCandidate.edges.filter(([source, target]) => source !== target),
        nodes: bestCandidate.nodes.filter((node) => nodesInEdges.has(node)),
      };
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
