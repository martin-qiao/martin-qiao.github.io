import { HasselbladHero } from "@/components/hasselblad/HasselbladHero";
import { LENS } from "@/data/home";
import type { FilmFrame } from "@/lib/filmReel";
import styles from "./home.module.css";

export function LensChapter({ frames }: { frames: readonly FilmFrame[] }) {
  return (
    <section
      id={LENS.id}
      className={`${styles.chapter} ${styles.lens}`}
      aria-labelledby="lens-heading"
    >
      <div className={styles.lensSticky}>
        <div className={styles.lensCopy}>
          <p className={styles.eyebrow}>{LENS.eyebrow}</p>
          <h2 id="lens-heading" className={`${styles.headline} ${styles.lensHeadline}`}>
            {LENS.headline}
          </h2>
        </div>
        <div className={styles.lensStage}>
          <HasselbladHero frames={frames} />
        </div>
      </div>
    </section>
  );
}
