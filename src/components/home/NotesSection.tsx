import type { NotesView } from "@/lib/content/assemble";
import styles from "./home.module.css";

export function NotesSection({ notes }: { notes: NotesView }) {
  return (
    <section
      id={notes.id}
      className={`${styles.chapter} ${styles.notes}`}
      aria-labelledby="notes-heading"
    >
      <div className={styles.inner}>
        <p className={styles.eyebrow}>{notes.eyebrow}</p>
        <h2 id="notes-heading" className={styles.headline}>
          {notes.headline}
        </h2>
        <p className={styles.body}>{notes.body}</p>
        <div className={`${styles.grid} ${styles.notesGrid}`}>
          {notes.posts.map((post) => (
            <article key={post.id} className={styles.card}>
              {post.dateTime ? (
                <time className={styles.cardDate} dateTime={post.dateTime}>
                  {post.date}
                </time>
              ) : null}
              <h3 className={styles.cardTitle}>{post.title}</h3>
              <p className={styles.cardBody}>{post.summary}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
