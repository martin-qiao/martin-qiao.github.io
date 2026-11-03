import { GalleryField } from "@/components/admin/GalleryField";
import { Flash } from "@/components/admin/Flash";
import { StatusField } from "@/components/admin/StatusField";
import styles from "@/components/admin/admin.module.css";
import { saveAboutAction } from "@/lib/admin/actions";
import { requireAdmin } from "@/lib/admin/guard";
import { getAboutAdmin, readStore } from "@/lib/content/repository";

export default async function AboutAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  await requireAdmin();
  const query = await searchParams;
  const result = await readStore(getAboutAdmin);
  if (!result.ok) {
    return <Flash error={result.error} />;
  }
  const about = result.data;
  return (
    <>
      <h1 className={styles.pageTitle}>About</h1>
      <p className={styles.lead}>Headline, markdown body, résumé link, and selfie gallery.</p>
      <Flash saved={query.saved} error={query.error} />
      <form className={styles.form} action={saveAboutAction}>
        <label className={styles.field}>
          Headline
          <input name="headline" defaultValue={about.headline} required maxLength={200} />
        </label>
        <label className={styles.field}>
          Body
          <textarea name="body" defaultValue={about.body} />
        </label>
        <p className={styles.help}>Markdown paragraphs, **bold**, *italic*, and links.</p>
        <label className={styles.field}>
          Résumé URL
          <input name="resume_url" type="url" defaultValue={about.resumeUrl} />
        </label>
        <GalleryField key={JSON.stringify(about.gallery)} initial={about.gallery} />
        <StatusField status={about.status} />
        <button className={styles.button} type="submit">
          Save about
        </button>
      </form>
    </>
  );
}
