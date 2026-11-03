import Link from "next/link";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { Flash } from "@/components/admin/Flash";
import styles from "@/components/admin/admin.module.css";
import { deleteLensAction } from "@/lib/admin/actions";
import { requireAdmin } from "@/lib/admin/guard";
import { listLens, readStore } from "@/lib/content/repository";

export default async function LensListPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  await requireAdmin();
  const query = await searchParams;
  const result = await readStore(listLens);
  return (
    <>
      <div className={styles.toolbar}>
        <h1 className={styles.pageTitle}>Lens</h1>
        <Link className={styles.button} href="/admin/lens/new">
          New frame
        </Link>
      </div>
      <p className={styles.lead}>
        Published frames replace the film reel, grouped by viewfinder section and ordered by date.
      </p>
      <Flash saved={query.saved} error={query.error ?? (!result.ok ? result.error : undefined)} />
      {result.ok ? (
        <ul className={styles.list}>
          {result.data.map((frame) => (
            <li className={styles.item} key={frame.id}>
              <div>
                <Link href={`/admin/lens/${frame.id}`}>{frame.title}</Link>
                <p className={styles.meta}>
                  <span className={frame.status === "published" ? styles.badgeLive : styles.badge}>
                    {frame.status === "published" ? "Published" : "Draft"}
                  </span>{" "}
                  {frame.sectionId || "No section"}
                  {frame.shotOn ? ` · ${frame.shotOn}` : ""}
                </p>
              </div>
              <ConfirmDelete id={frame.id} action={deleteLensAction} />
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}
