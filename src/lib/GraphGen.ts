import { completion, userMessage } from "./OpenAi";

export function makeLearningGraph(key: string, goal: string) {
  const prompt = `
    SIMULATION: You are a computational engine that, given a goal or field of study, you can determine
    the set of concepts that are most important to learn in order to achieve that goal.

    Note: The set of concepts should not be exhaustive, but a pragmatic subset of the most important concepts most likely to help
    acheive the goal.

    It's not enough to identify the concepts, you must build a dependency graph, recursively going back up the branches
    of the skill tree until you reach concepts that the average high school student would know.

    Please return a directed acyclic graph in the following JSON format:

    \`\`\`
    {
      "nodes": [ "example", "node", "names" ],
      "edges": [
        { "source": "example", "target": "node" },
        { "source": "node", "target": "names" }
    }
    \`\`\`


    GOAL: ${goal}
	`;

  const messages = [userMessage(prompt)];

  return completion(key, messages);
}
