import { FIDGET } from "@/data/home";
import styles from "./home.module.css";

export function FidgetSection() {
  return (
    <section
      id={FIDGET.id}
      className={`${styles.chapter} ${styles.fidget}`}
      aria-labelledby="fidget-heading"
    >
      <div className={styles.inner}>
        <p className={styles.eyebrow}>{FIDGET.eyebrow}</p>
        <h2 id="fidget-heading" className={styles.headline}>
          {FIDGET.headline}
        </h2>
        <p className={styles.body}>{FIDGET.body}</p>
        <div className={`${styles.grid} ${styles.fidgetGrid}`}>
          {FIDGET.tiles.map((tile) => (
            <article key={tile.id} className={styles.card}>
              <h3 className={styles.cardTitle}>{tile.title}</h3>
              <p className={styles.cardBody}>{tile.summary}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
