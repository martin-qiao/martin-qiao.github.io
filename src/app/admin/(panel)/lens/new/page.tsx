import { LensForm } from "@/components/admin/LensForm";
import { Flash } from "@/components/admin/Flash";
import styles from "@/components/admin/admin.module.css";
import { requireAdmin } from "@/lib/admin/guard";

export default async function NewLensPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdmin();
  const query = await searchParams;
  return (
    <>
      <h1 className={styles.pageTitle}>New frame</h1>
      <Flash error={query.error} />
      <LensForm />
    </>
  );
}
