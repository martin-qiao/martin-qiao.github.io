import styles from "./admin.module.css";
import type { ContentStatus } from "@/lib/content/text";

export function StatusField({ status }: { status: ContentStatus }) {
  return (
    <fieldset className={styles.choices}>
      <legend>Visibility</legend>
      <label className={styles.choice}>
        <input type="radio" name="status" value="draft" defaultChecked={status !== "published"} />
        Draft
      </label>
      <label className={styles.choice}>
        <input
          type="radio"
          name="status"
          value="published"
          defaultChecked={status === "published"}
        />
        Published
      </label>
    </fieldset>
  );
}
