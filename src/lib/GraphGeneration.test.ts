import { test, assert } from "vitest";
import { findScores } from "./GraphGeneration";

test("should return undefined when given an empty array", () => {
  const blobs: any[] = [];
  const result = findScores(blobs);
  assert.isUndefined(result);
});

test("should return undefined when given an array of invalid blobs", () => {
  const blobs = ["invalid", "blob", "data"];
  const result = findScores(blobs);
  assert.isUndefined(result);
});

test("should return the first valid CandidateScores object when given an array of valid and invalid blobs", () => {
  const blobs: any[] = [
    "invalid",
    [{ candidate: 1, scores: "string", total: 10 }],
    [
      { candidate: 1, scores: [1, 1, 1, 2], total: 5 },
      { candidate: 2, scores: [], total: 1 },
    ],
    "invalid",
  ];

  const expected = [
    { candidate: 1, scores: [1, 1, 1, 2], total: 5 },
    { candidate: 2, scores: [], total: 1 },
  ];

  const result = findScores(blobs);

  assert.deepEqual(result, expected);
});
