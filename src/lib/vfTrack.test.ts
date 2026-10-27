import { existsSync, readFileSync } from "node:fs";
import { SECTIONS } from "@/data/sections";
import { BASE_STILL_SRC, DIAL_WIND_SRC } from "@/lib/hasselbladAssets";
import { VF_BOUNDS, VF_GLASS_PX } from "@/lib/vfGeometry";
import {
  frameIndexForTime,
  presentationForFrame,
  VF_FPS,
  VF_FRAME_COUNT,
} from "@/lib/vfTrack";

test("ships the locked v24h wind clip and base still", () => {
  expect(DIAL_WIND_SRC).toBe("/hasselblad/dial-wind-v24h-even-pace.mp4");
  expect(BASE_STILL_SRC).toBe("/hasselblad/base-v24-rest.jpg");
  expect(existsSync(`public${DIAL_WIND_SRC}`)).toBe(true);
  expect(existsSync(`public${BASE_STILL_SRC}`)).toBe(true);
  expect(existsSync("public/hasselblad/base.jpg")).toBe(true);
  expect(existsSync("public/hasselblad/dial-wind-v23-black-curtains.mp4")).toBe(false);
  expect(existsSync("public/hasselblad/dial-wind-v18.mp4")).toBe(false);
});

test("VF_BOUNDS is the locked v24h glass rect", () => {
  expect(VF_GLASS_PX).toEqual({ x: 524, y: 301, w: 234, h: 233 });
  expect(VF_BOUNDS.leftPct).toBeCloseTo((524 / 1280) * 100, 5);
  expect(VF_BOUNDS.topPct).toBeCloseTo((301 / 720) * 100, 5);
  expect(VF_BOUNDS.widthPct).toBeCloseTo((234 / 1280) * 100, 5);
  expect(VF_BOUNDS.heightPct).toBeCloseTo((233 / 720) * 100, 5);
  const mask = readFileSync("public/hasselblad/vf-mask.svg", "utf8");
  expect(mask).toContain('x="524"');
  expect(mask).toContain('y="301"');
  expect(mask).toContain('width="234"');
  expect(mask).toContain('height="233"');
  expect(mask).not.toContain('y="300"');
  expect(mask).not.toContain('x="470"');
});

test("track is 30 frames at 24fps and matches the public copy", () => {
  expect(VF_FPS).toBe(24);
  expect(VF_FRAME_COUNT).toBe(30);
  const pub = JSON.parse(readFileSync("public/hasselblad/vf-track.json", "utf8"));
  expect(pub.fps).toBe(VF_FPS);
  expect(pub.frames).toHaveLength(VF_FRAME_COUNT);
  expect(pub.frames[0].dx_vs_f0).toBe(0);
  expect(pub.frames[0].dy_vs_f0).toBe(0);
  for (const frame of pub.frames) {
    expect(frame.cx).toBe(641);
    expect(frame.cy).toBe(417.5);
    expect(frame.w).toBe(234);
    expect(frame.h).toBe(233);
    expect(frame.dx_vs_f0).toBe(0);
    expect(frame.dy_vs_f0).toBe(0);
  }
});

test("frame index follows currentTime and clamps to the clip", () => {
  expect(frameIndexForTime(0, VF_FRAME_COUNT, VF_FPS)).toBe(0);
  expect(frameIndexForTime(1 / 24, VF_FRAME_COUNT, VF_FPS)).toBe(1);
  expect(frameIndexForTime(15 / 24, VF_FRAME_COUNT, VF_FPS)).toBe(15);
  expect(frameIndexForTime(29 / 24, VF_FRAME_COUNT, VF_FPS)).toBe(29);
  expect(frameIndexForTime(1.25, VF_FRAME_COUNT, VF_FPS)).toBe(29);
  expect(frameIndexForTime(-1, VF_FRAME_COUNT, VF_FPS)).toBe(0);
  expect(frameIndexForTime(Number.NaN, VF_FRAME_COUNT, VF_FPS)).toBe(0);
});

test("rest pose is the locked glass, outset so the soft green edge stays covered", () => {
  const rest = presentationForFrame(0);
  const x = 524 - 3;
  const y = 301 - 3;
  const w = 234 + 6;
  const h = 233 + 6;
  expect(rest.frameIndex).toBe(0);
  expect(rest.maskImage).toMatch(/^url\("data:image\/svg\+xml,/);
  expect(rest.maskImage).toContain("fill%3D%27black%27");
  expect(rest.box.left).toBe(`${(x / 1280) * 100}%`);
  expect(rest.box.top).toBe(`${(y / 720) * 100}%`);
  expect(rest.box.width).toBe(`${(w / 1280) * 100}%`);
  expect(rest.box.height).toBe(`${(h / 720) * 100}%`);
});

test("mid-wind pose stays on the locked glass and punches a matching mask hole", () => {
  const rest = presentationForFrame(0);
  const mid = presentationForFrame(15);
  expect(mid.frameIndex).toBe(15);
  expect(mid.box).toEqual(rest.box);
  expect(mid.maskImage).toBe(rest.maskImage);
  expect(mid.maskImage).toMatch(/^url\("data:image\/svg\+xml,/);
  expect(mid.maskImage).toContain("fill%3D%27black%27");
  expect(mid.box.left).toBe(`${((524 - 3) / 1280) * 100}%`);
  expect(mid.box.top).toBe(`${((301 - 3) / 720) * 100}%`);
});

test("sections are the seven scene roles with matching thumbnails", () => {
  expect(SECTIONS.map((section) => section.id)).toEqual([
    "developer",
    "learner",
    "photographer",
    "traveler",
    "life-recorder",
    "reader",
    "movie-lover",
  ]);
  expect(SECTIONS.map((section) => section.label)).toEqual([
    "A developer",
    "A learner",
    "A photographer",
    "A traveler",
    "A life recorder",
    "A reader",
    "A movie lover",
  ]);
  for (const section of SECTIONS) {
    expect(section.overlayBody.startsWith("Placeholder:")).toBe(true);
    expect(section.viewfinderImage).toBe(`/hasselblad/sections/${section.id}.jpg`);
    expect(section.viewfinderSrcSet).toBe(
      `/hasselblad/sections/${section.id}.jpg 1x, /hasselblad/sections/${section.id}@2x.jpg 2x`,
    );
    expect(existsSync(`public${section.viewfinderImage}`)).toBe(true);
    expect(existsSync(`public/hasselblad/sections/${section.id}@2x.jpg`)).toBe(true);
  }
  expect(existsSync("public/hasselblad/sections/writer.jpg")).toBe(false);
  expect(existsSync("public/hasselblad/sections/documenter.jpg")).toBe(false);
  expect(existsSync("public/hasselblad/sections/driver.jpg")).toBe(false);
});
