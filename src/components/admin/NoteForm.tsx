import { saveNoteAction } from "@/lib/admin/actions";
import type { NoteAdmin } from "@/lib/content/repository";
import { ImageField } from "./ImageField";
import { StatusField } from "./StatusField";
import styles from "./admin.module.css";

const EMPTY: NoteAdmin = {
  id: "",
  title: "",
  summary: "",
  body: "",
  sourceUrl: "",
  ogImageUrl: "",
  slug: "",
  publishedOn: "",
  status: "draft",
};

export function NoteForm({ note = EMPTY }: { note?: NoteAdmin }) {
  return (
    <form className={styles.form} action={saveNoteAction}>
      {note.id ? <input type="hidden" name="id" value={note.id} /> : null}
      <label className={styles.field}>
        Title
        <input name="title" defaultValue={note.title} required maxLength={180} />
      </label>
      <label className={styles.field}>
        Slug
        <input name="slug" defaultValue={note.slug} maxLength={80} />
      </label>
      <label className={styles.field}>
        Summary
        <textarea name="summary" defaultValue={note.summary} maxLength={500} />
      </label>
      <label className={styles.field}>
        Body
        <textarea name="body" defaultValue={note.body} />
      </label>
      <p className={styles.help}>Markdown: paragraphs, **bold**, *italic*, and [links](https://).</p>
      <label className={styles.field}>
        Source URL
        <input name="source_url" type="url" defaultValue={note.sourceUrl} />
      </label>
      <label className={styles.field}>
        Publish date
        <input name="published_on" type="date" defaultValue={note.publishedOn} />
      </label>
      <ImageField
        key={note.ogImageUrl}
        name="og_image_url"
        label="Card image (optional)"
        initial={note.ogImageUrl}
      />
      <StatusField status={note.status} />
      <button className={styles.button} type="submit">
        Save note
      </button>
    </form>
  );
}
