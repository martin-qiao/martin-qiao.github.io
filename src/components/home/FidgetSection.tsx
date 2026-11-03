import type { FidgetView } from "@/lib/content/assemble";
import styles from "./home.module.css";

export function FidgetSection({ fidget }: { fidget: FidgetView }) {
  return (
    <section
      id={fidget.id}
      className={`${styles.chapter} ${styles.fidget}`}
      aria-labelledby="fidget-heading"
    >
      <div className={styles.inner}>
        <p className={styles.eyebrow}>{fidget.eyebrow}</p>
        <h2 id="fidget-heading" className={styles.headline}>
          {fidget.headline}
        </h2>
        <p className={styles.body}>{fidget.body}</p>
        <div className={`${styles.grid} ${styles.fidgetGrid}`}>
          {fidget.tiles.map((tile) => (
            <article key={tile.id} className={styles.card}>
              {tile.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- CMS blob URLs are arbitrary hosts
                <img className={styles.cardImage} src={tile.imageUrl} alt="" />
              ) : null}
              <h3 className={styles.cardTitle}>
                {tile.productUrl ? (
                  <a href={tile.productUrl} rel="noreferrer">
                    {tile.title}
                  </a>
                ) : (
                  tile.title
                )}
              </h3>
              <p className={styles.cardBody}>{tile.summary}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
