import { saveFidgetAction } from "@/lib/admin/actions";
import type { FidgetAdmin } from "@/lib/content/repository";
import { ImageField } from "./ImageField";
import { StatusField } from "./StatusField";
import styles from "./admin.module.css";

const EMPTY: FidgetAdmin = {
  id: "",
  title: "",
  summary: "",
  productUrl: "",
  imageUrl: "",
  sortKey: 0,
  status: "draft",
};

export function FidgetForm({ tile = EMPTY }: { tile?: FidgetAdmin }) {
  return (
    <form className={styles.form} action={saveFidgetAction}>
      {tile.id ? <input type="hidden" name="id" value={tile.id} /> : null}
      <label className={styles.field}>
        Title
        <input name="title" defaultValue={tile.title} required maxLength={180} />
      </label>
      <label className={styles.field}>
        Summary
        <textarea name="summary" defaultValue={tile.summary} maxLength={500} />
      </label>
      <label className={styles.field}>
        Product URL
        <input name="product_url" type="url" defaultValue={tile.productUrl} />
      </label>
      <label className={styles.field}>
        Sort
        <input name="sort_key" type="number" min={0} defaultValue={tile.sortKey} />
      </label>
      <ImageField key={tile.imageUrl} name="image_url" label="Image (optional)" initial={tile.imageUrl} />
      <StatusField status={tile.status} />
      <button className={styles.button} type="submit">
        Save gadget
      </button>
    </form>
  );
}
