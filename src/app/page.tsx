import { AboutSection } from "@/components/home/AboutSection";
import { FidgetSection } from "@/components/home/FidgetSection";
import { LensChapter } from "@/components/home/LensChapter";
import { NotesSection } from "@/components/home/NotesSection";
import { SiteFooter } from "@/components/home/SiteFooter";
import { SiteNav } from "@/components/home/SiteNav";
import styles from "@/components/home/home.module.css";
import { getHomeContent } from "@/lib/content/home";

export default async function Home() {
  const content = await getHomeContent();
  return (
    <div className={styles.page}>
      <SiteNav />
      <main>
        <AboutSection about={content.about} />
        <LensChapter frames={content.lensFrames} />
        <NotesSection notes={content.notes} />
        <FidgetSection fidget={content.fidget} />
      </main>
      <SiteFooter />
    </div>
  );
}
