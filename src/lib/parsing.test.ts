import { extractJSONBlocks } from "./parsing";
import { test, assert } from "vitest";

test("should extract a single valid JSON block", () => {
  const markdownText = '```json\n{"name": "John Doe", "age": 30}\n```';
  const expected = [{ name: "John Doe", age: 30 }];
  const result = extractJSONBlocks(markdownText);
  assert.deepEqual(result, expected);
});

test("should extract multiple valid JSON blocks", () => {
  const markdownText =
    '```json\n{"name": "John Doe", "age": 30}\n```\n\n```json\n{"name": "Jane Doe", "age": 25}\n```';
  const expected = [
    { name: "John Doe", age: 30 },
    { name: "Jane Doe", age: 25 },
  ];
  const result = extractJSONBlocks(markdownText);
  assert.deepEqual(result, expected);
});

test("should ignore invalid JSON blocks", () => {
  const markdownText =
    '```json\n{"name": "John Doe", "age": 30}\n```\n\n```json\n{"name": "Jane Doe", "age": 25}\n```' +
    '\n\n```json\n{"name": "Invalid JSON", "age": }\n```';
  const expected = [
    { name: "John Doe", age: 30 },
    { name: "Jane Doe", age: 25 },
  ];
  const result = extractJSONBlocks(markdownText);
  assert.deepEqual(result, expected);
});

test("should extract JSON blocks with various line endings and optional spaces", () => {
  const markdownText =
    '```json\n{\r\n  "name": "John Doe",\n  "age": 30\n}\n```\n\n```json\n{\n  "name": "Jane Doe",  \n  "age": 25\n}\n```';
  const expected = [
    { name: "John Doe", age: 30 },
    { name: "Jane Doe", age: 25 },
  ];
  const result = extractJSONBlocks(markdownText);
  assert.deepEqual(result, expected);
});

test("should return an empty array if no JSON blocks are found", () => {
  const markdownText = "This is some text without any JSON blocks.";
  const result = extractJSONBlocks(markdownText);

  assert.isEmpty(result);
});
