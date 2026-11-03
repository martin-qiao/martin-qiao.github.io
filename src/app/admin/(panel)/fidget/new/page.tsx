import { FidgetForm } from "@/components/admin/FidgetForm";
import { Flash } from "@/components/admin/Flash";
import styles from "@/components/admin/admin.module.css";
import { requireAdmin } from "@/lib/admin/guard";

export default async function NewFidgetPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdmin();
  const query = await searchParams;
  return (
    <>
      <h1 className={styles.pageTitle}>New gadget</h1>
      <Flash error={query.error} />
      <FidgetForm />
    </>
  );
}
