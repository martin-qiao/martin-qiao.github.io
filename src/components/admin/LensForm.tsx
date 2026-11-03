import { SECTIONS } from "@/data/sections";
import { saveLensAction } from "@/lib/admin/actions";
import type { LensAdmin } from "@/lib/content/repository";
import { ImageField } from "./ImageField";
import { StatusField } from "./StatusField";
import styles from "./admin.module.css";

const EMPTY: LensAdmin = {
  id: "",
  title: "",
  caption: "",
  shotOn: "",
  thumbUrl: "",
  fullImageUrl: "",
  sectionId: "photographer",
  sortKey: 0,
  status: "draft",
};

export function LensForm({ frame = EMPTY }: { frame?: LensAdmin }) {
  return (
    <form className={styles.form} action={saveLensAction}>
      {frame.id ? <input type="hidden" name="id" value={frame.id} /> : null}
      <label className={styles.field}>
        Title
        <input name="title" defaultValue={frame.title} required maxLength={180} />
      </label>
      <label className={styles.field}>
        Caption
        <textarea name="caption" defaultValue={frame.caption} maxLength={400} />
      </label>
      <label className={styles.field}>
        Date
        <input name="shot_on" type="date" defaultValue={frame.shotOn} />
      </label>
      <label className={styles.field}>
        Viewfinder section
        <select name="section_id" defaultValue={frame.sectionId || "photographer"}>
          {SECTIONS.map((section) => (
            <option key={section.id} value={section.id}>
              {section.label}
            </option>
          ))}
        </select>
      </label>
      <label className={styles.field}>
        Sort
        <input name="sort_key" type="number" min={0} defaultValue={frame.sortKey} />
      </label>
      <ImageField
        key={frame.thumbUrl}
        name="thumb_url"
        label="Square thumb"
        initial={frame.thumbUrl}
        square
        hint="Phone photos are center-cropped to a square when the browser can decode them."
      />
      <ImageField
        key={frame.fullImageUrl}
        name="full_image_url"
        label="Full image (optional)"
        initial={frame.fullImageUrl}
      />
      <StatusField status={frame.status} />
      <button className={styles.button} type="submit">
        Save frame
      </button>
    </form>
  );
}
