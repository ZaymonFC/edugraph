export function extractJSONBlocks(markdownText: string): any[] {
  const jsonBlocks: any[] = [];

  // Match code blocks marked as JSON, allowing for optional spaces and various line endings
  const regex = /```json\s*([\s\S]*?)\s*```/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(markdownText)) !== null) {
    // Remove any escaped backticks within the code block
    const block = match[1].replace(/\\`/g, "`").trim();
    try {
      jsonBlocks.push(JSON.parse(block));
    } catch (e) {
      console.warn("Invalid JSON block found:", block);
    }
  }

  return jsonBlocks;
}
