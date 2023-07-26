type ChatMessage = { role: string; content: string };

export function userMessage(content: string): ChatMessage {
  return { role: "user", content };
}

export function completion(key: string, messages: ChatMessage[]) {
  return fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: messages,
      temperature: 0.9,
    }),
  })
    .then((response) => response.json())
    .catch((error) => {
      // Handle any errors
      console.error(error);
    });
}
