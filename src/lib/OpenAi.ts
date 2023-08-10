type ChatMessage = { role: string; content: string };

type Choice = {
  index: number;
  message: ChatMessage;
  finish_reason: string;
};

type Usage = {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
};

type ChatCompletion = {
  id: string;
  object: string;
  created: number;
  choices: Choice[];
  usage: Usage;
};

export const response = (completion: ChatCompletion) =>
  completion.choices[0].message;

export const conversation = (...rest: ChatMessage[]) => rest;

export function userMessage(content: string): ChatMessage {
  return { role: "user", content };
}

export function systemMessage(content: string): ChatMessage {
  return { role: "system", content };
}

export function completion(
  key: string,
  messages: ChatMessage[]
): Promise<ChatCompletion> {
  return fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: messages,
    }),
  })
    .then((response) => response.json())
    .catch((error) => {
      // Handle any errors
      console.error("Something went wrong generating chat completion", error);
    });
}

export const reply = (key: string, conversation: ChatMessage[], reply: string) => {
  const messages = [...conversation, userMessage(reply)];

  return completion(key, messages);
};
