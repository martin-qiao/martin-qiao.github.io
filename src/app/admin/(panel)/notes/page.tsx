import Link from "next/link";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { Flash } from "@/components/admin/Flash";
import styles from "@/components/admin/admin.module.css";
import { deleteNoteAction, importNoteAction } from "@/lib/admin/actions";
import { requireAdmin } from "@/lib/admin/guard";
import { listNotes, readStore } from "@/lib/content/repository";

export default async function NotesListPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  await requireAdmin();
  const query = await searchParams;
  const result = await readStore(listNotes);
  return (
    <>
      <div className={styles.toolbar}>
        <h1 className={styles.pageTitle}>Notes</h1>
        <Link className={styles.button} href="/admin/notes/new">
          New note
        </Link>
      </div>
      <form className={styles.import} action={importNoteAction}>
        <label className={styles.field}>
          New from link
          <input name="url" type="url" required placeholder="https://" inputMode="url" />
        </label>
        <p className={styles.help}>
          Fetches the title, description, and image into a draft. Nothing is published automatically.
        </p>
        <button className={styles.buttonSecondary} type="submit">
          Create draft
        </button>
      </form>
      <Flash saved={query.saved} error={query.error ?? (!result.ok ? result.error : undefined)} />
      {result.ok ? (
        <ul className={styles.list}>
          {result.data.map((note) => (
            <li className={styles.item} key={note.id}>
              <div>
                <Link href={`/admin/notes/${note.id}`}>{note.title}</Link>
                <p className={styles.meta}>
                  <span className={note.status === "published" ? styles.badgeLive : styles.badge}>
                    {note.status === "published" ? "Published" : "Draft"}
                  </span>{" "}
                  {note.slug}
                </p>
              </div>
              <ConfirmDelete id={note.id} action={deleteNoteAction} />
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}
