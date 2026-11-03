import { imageFileProblem } from "./imageFile";

test("accepts a phone photo and rejects other files", () => {
  expect(imageFileProblem({ type: "image/jpeg", size: 1200, name: "IMG.jpg" })).toBeNull();
  expect(imageFileProblem({ type: "image/heic", size: 1200, name: "IMG.HEIC" })).toBeNull();
  expect(imageFileProblem({ type: "text/plain", size: 20, name: "notes.txt" })).toMatch(/JPEG/);
  expect(imageFileProblem({ type: "image/png", size: 9 * 1024 * 1024, name: "big.png" })).toMatch(
    /8MB/,
  );
});
