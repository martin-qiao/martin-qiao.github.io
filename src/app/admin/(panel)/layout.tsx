import { Suspense } from "react";
import { AdminFrame } from "@/components/admin/AdminFrame";
import styles from "@/components/admin/admin.module.css";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const maxDuration = 30;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<p className={styles.fallback}>Loading admin…</p>}>
      <AdminFrame>{children}</AdminFrame>
    </Suspense>
  );
}
