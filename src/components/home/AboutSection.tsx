import { ABOUT } from "@/data/home";
import styles from "./home.module.css";

const TONE: Record<(typeof ABOUT.portraits)[number]["tone"], string> = {
  harbor: styles.harbor,
  studio: styles.studio,
  weekend: styles.weekend,
};

export function AboutSection() {
  return (
    <section
      id={ABOUT.id}
      className={`${styles.chapter} ${styles.about}`}
      aria-labelledby="about-heading"
    >
      <div className={styles.inner}>
        <p className={styles.eyebrow}>{ABOUT.eyebrow}</p>
        <h1 id="about-heading" className={styles.headline}>
          {ABOUT.headline}
        </h1>
        <p className={styles.body}>{ABOUT.body}</p>
        <ul className={styles.portraits}>
          {ABOUT.portraits.map((portrait) => (
            <li
              key={portrait.id}
              className={`${styles.tile} ${TONE[portrait.tone]}`}
            >
              <span className={styles.tileLabel}>{portrait.label}</span>
            </li>
          ))}
        </ul>
        <a className={styles.pill} href={ABOUT.cta.href}>
          {ABOUT.cta.label}
        </a>
      </div>
    </section>
  );
}
