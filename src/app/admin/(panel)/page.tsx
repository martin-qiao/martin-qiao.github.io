import Link from "next/link";
import { Flash } from "@/components/admin/Flash";
import styles from "@/components/admin/admin.module.css";
import { requireAdmin } from "@/lib/admin/guard";
import { getAboutAdmin, listFidget, listLens, listNotes, readStore } from "@/lib/content/repository";

function countLine(items: { status: string }[] | undefined): string {
  if (!items) return "Unavailable";
  const published = items.filter((item) => item.status === "published").length;
  return `${published} published · ${items.length - published} draft`;
}

export default async function AdminHome({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  await requireAdmin();
  const query = await searchParams;
  const [about, lens, notes, fidget] = await Promise.all([
    readStore(getAboutAdmin),
    readStore(listLens),
    readStore(listNotes),
    readStore(listFidget),
  ]);
  const failure = [about, lens, notes, fidget].find((result) => !result.ok);

  return (
    <>
      <h1 className={styles.pageTitle}>Desk</h1>
      <p className={styles.lead}>
        Edit the four homepage sections. Drafts stay off the public site until you publish them.
      </p>
      <Flash saved={query.saved} error={query.error ?? (failure && !failure.ok ? failure.error : undefined)} />
      <div className={styles.counts}>
        <Link className={styles.stat} href="/admin/about">
          <strong>About</strong>
          <span>{about.ok ? (about.data.status === "published" ? "Published" : "Draft") : "Unavailable"}</span>
        </Link>
        <Link className={styles.stat} href="/admin/lens">
          <strong>Lens</strong>
          <span>{lens.ok ? countLine(lens.data) : "Unavailable"}</span>
        </Link>
        <Link className={styles.stat} href="/admin/notes">
          <strong>Notes</strong>
          <span>{notes.ok ? countLine(notes.data) : "Unavailable"}</span>
        </Link>
        <Link className={styles.stat} href="/admin/fidget">
          <strong>Fidget</strong>
          <span>{fidget.ok ? countLine(fidget.data) : "Unavailable"}</span>
        </Link>
      </div>
    </>
  );
}
