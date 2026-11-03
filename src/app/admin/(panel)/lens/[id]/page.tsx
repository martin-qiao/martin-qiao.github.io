import { notFound } from "next/navigation";
import { Flash } from "@/components/admin/Flash";
import { LensForm } from "@/components/admin/LensForm";
import styles from "@/components/admin/admin.module.css";
import { requireAdmin } from "@/lib/admin/guard";
import { getLens, readStore } from "@/lib/content/repository";

export default async function EditLensPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const query = await searchParams;
  const result = await readStore(() => getLens(id));
  if (!result.ok) return <Flash error={result.error} />;
  if (!result.data) notFound();
  return (
    <>
      <h1 className={styles.pageTitle}>Edit frame</h1>
      <Flash saved={query.saved} error={query.error} />
      <LensForm frame={result.data} />
    </>
  );
}
