import { completion, userMessage } from "./OpenAi";

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

    Please return a graph in the following JSON format:

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
