import Link from "next/link";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { Flash } from "@/components/admin/Flash";
import styles from "@/components/admin/admin.module.css";
import { deleteFidgetAction } from "@/lib/admin/actions";
import { requireAdmin } from "@/lib/admin/guard";
import { listFidget, readStore } from "@/lib/content/repository";

export default async function FidgetListPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  await requireAdmin();
  const query = await searchParams;
  const result = await readStore(listFidget);
  return (
    <>
      <div className={styles.toolbar}>
        <h1 className={styles.pageTitle}>Fidget</h1>
        <Link className={styles.button} href="/admin/fidget/new">
          New gadget
        </Link>
      </div>
      <Flash saved={query.saved} error={query.error ?? (!result.ok ? result.error : undefined)} />
      {result.ok ? (
        <ul className={styles.list}>
          {result.data.map((tile) => (
            <li className={styles.item} key={tile.id}>
              <div>
                <Link href={`/admin/fidget/${tile.id}`}>{tile.title}</Link>
                <p className={styles.meta}>
                  <span className={tile.status === "published" ? styles.badgeLive : styles.badge}>
                    {tile.status === "published" ? "Published" : "Draft"}
                  </span>
                </p>
              </div>
              <ConfirmDelete id={tile.id} action={deleteFidgetAction} />
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}
