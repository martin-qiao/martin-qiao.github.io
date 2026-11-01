import { NOTES } from "@/data/home";
import styles from "./home.module.css";

export function NotesSection() {
  return (
    <section
      id={NOTES.id}
      className={`${styles.chapter} ${styles.notes}`}
      aria-labelledby="notes-heading"
    >
      <div className={styles.inner}>
        <p className={styles.eyebrow}>{NOTES.eyebrow}</p>
        <h2 id="notes-heading" className={styles.headline}>
          {NOTES.headline}
        </h2>
        <p className={styles.body}>{NOTES.body}</p>
        <div className={`${styles.grid} ${styles.notesGrid}`}>
          {NOTES.posts.map((post) => (
            <article key={post.id} className={styles.card}>
              <time className={styles.cardDate} dateTime={post.dateTime}>
                {post.date}
              </time>
              <h3 className={styles.cardTitle}>{post.title}</h3>
              <p className={styles.cardBody}>{post.summary}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
