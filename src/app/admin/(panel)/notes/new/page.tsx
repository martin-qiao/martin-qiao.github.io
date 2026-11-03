import { Flash } from "@/components/admin/Flash";
import { NoteForm } from "@/components/admin/NoteForm";
import styles from "@/components/admin/admin.module.css";
import { requireAdmin } from "@/lib/admin/guard";

export default async function NewNotePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdmin();
  const query = await searchParams;
  return (
    <>
      <h1 className={styles.pageTitle}>New note</h1>
      <Flash error={query.error} />
      <NoteForm />
    </>
  );
}
