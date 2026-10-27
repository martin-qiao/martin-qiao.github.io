import { readFileSync } from "node:fs";
import { vfCrossfadeOpacity } from "@/lib/vfCrossfade";

test("old photo is gone at the midpoint and the new photo finishes at the end", () => {
  expect(vfCrossfadeOpacity(0)).toEqual({ outgoing: 1, incoming: 0 });
  expect(vfCrossfadeOpacity(0.25)).toEqual({ outgoing: 0.5, incoming: 0 });
  expect(vfCrossfadeOpacity(0.5)).toEqual({ outgoing: 0, incoming: 0 });
  expect(vfCrossfadeOpacity(0.75)).toEqual({ outgoing: 0, incoming: 0.5 });
  expect(vfCrossfadeOpacity(1)).toEqual({ outgoing: 0, incoming: 1 });
  expect(vfCrossfadeOpacity(-1)).toEqual({ outgoing: 1, incoming: 0 });
  expect(vfCrossfadeOpacity(2)).toEqual({ outgoing: 0, incoming: 1 });
  expect(vfCrossfadeOpacity(Number.NaN)).toEqual({ outgoing: 1, incoming: 0 });
});

test("the glass holds opaque black under the thumbs", () => {
  const css = readFileSync(
    "src/components/hasselblad/hasselblad.module.css",
    "utf8",
  );
  const vfBlock = css.slice(css.indexOf(".vf {"), css.indexOf(".vfStack"));
  expect(vfBlock).toContain("background: #000");
  expect(vfBlock).not.toContain("opacity: 0");
  expect(css).not.toContain("vfCrossfadeIn");
  expect(css).not.toContain(".vfIncoming");
});
