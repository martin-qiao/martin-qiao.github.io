import { Markdown } from "@/components/markdown/Markdown";
import type { AboutView } from "@/lib/content/assemble";
import styles from "./home.module.css";

const TONE = {
  harbor: styles.harbor,
  studio: styles.studio,
  weekend: styles.weekend,
} as const;

export function AboutSection({ about }: { about: AboutView }) {
  return (
    <section
      id={about.id}
      className={`${styles.chapter} ${styles.about}`}
      aria-labelledby="about-heading"
    >
      <div className={styles.inner}>
        <p className={styles.eyebrow}>{about.eyebrow}</p>
        <h1 id="about-heading" className={styles.headline}>
          {about.headline}
        </h1>
        <Markdown source={about.body} className={styles.body} />
        <ul className={styles.portraits}>
          {about.portraits.map((portrait) => (
            <li
              key={portrait.id}
              className={`${styles.tile} ${portrait.tone ? TONE[portrait.tone] : styles.photoTile}`}
            >
              {portrait.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- CMS blob URLs are arbitrary hosts
                <img className={styles.tileImage} src={portrait.imageUrl} alt="" />
              ) : null}
              <span className={styles.tileLabel}>{portrait.label}</span>
            </li>
          ))}
        </ul>
        <a className={styles.pill} href={about.cta.href}>
          {about.cta.label}
        </a>
      </div>
    </section>
  );
}
