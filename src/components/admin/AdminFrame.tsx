import Link from "next/link";
import { logoutAction } from "@/lib/admin/actions";
import { requireAdmin } from "@/lib/admin/guard";
import { AdminNav } from "./AdminNav";
import styles from "./admin.module.css";

export async function AdminFrame({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className={styles.shell}>
      <header className={styles.top}>
        <p className={styles.brand}>Editorial</p>
        <AdminNav />
        <div className={styles.topActions}>
          <Link className={styles.linkButton} href="/">
            View site
          </Link>
          <form action={logoutAction}>
            <button className={styles.buttonSecondary} type="submit">
              Log out
            </button>
          </form>
        </div>
      </header>
      <div className={styles.main}>{children}</div>
    </div>
  );
}
