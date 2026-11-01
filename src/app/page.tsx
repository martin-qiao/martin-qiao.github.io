import { AboutSection } from "@/components/home/AboutSection";
import { FidgetSection } from "@/components/home/FidgetSection";
import { LensChapter } from "@/components/home/LensChapter";
import { NotesSection } from "@/components/home/NotesSection";
import { SiteFooter } from "@/components/home/SiteFooter";
import { SiteNav } from "@/components/home/SiteNav";
import styles from "@/components/home/home.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <SiteNav />
      <main>
        <AboutSection />
        <LensChapter />
        <NotesSection />
        <FidgetSection />
      </main>
      <SiteFooter />
    </div>
  );
}
