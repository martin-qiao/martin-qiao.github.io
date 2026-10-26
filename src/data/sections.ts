import type { Section } from "@/lib/sections";

const ROLES: { id: string; label: string }[] = [
  { id: "developer", label: "A developer" },
  { id: "learner", label: "A learner" },
  { id: "photographer", label: "A photographer" },
  { id: "traveler", label: "A traveler" },
  { id: "life-recorder", label: "A life recorder" },
  { id: "reader", label: "A reader" },
  { id: "movie-lover", label: "A movie lover" },
];

export const SECTIONS: Section[] = ROLES.map(({ id, label }) => {
  const viewfinderImage = `/hasselblad/sections/${id}.jpg`;
  const role = label.replace(/^A /, "");
  return {
    id,
    label,
    viewfinderImage,
    viewfinderSrcSet: `${viewfinderImage} 1x, /hasselblad/sections/${id}@2x.jpg 2x`,
    overlayBody: `Placeholder: ${role} section body.`,
  };
});
