import { notFound } from "next/navigation";
import { FidgetForm } from "@/components/admin/FidgetForm";
import { Flash } from "@/components/admin/Flash";
import styles from "@/components/admin/admin.module.css";
import { requireAdmin } from "@/lib/admin/guard";
import { getFidget, readStore } from "@/lib/content/repository";

export default async function EditFidgetPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const query = await searchParams;
  const result = await readStore(() => getFidget(id));
  if (!result.ok) return <Flash error={result.error} />;
  if (!result.data) notFound();
  return (
    <>
      <h1 className={styles.pageTitle}>Edit gadget</h1>
      <Flash saved={query.saved} error={query.error} />
      <FidgetForm tile={result.data} />
    </>
  );
}
