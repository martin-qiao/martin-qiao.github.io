import styles from "./admin.module.css";

export function Flash({ saved, error }: { saved?: string; error?: string }) {
  if (error) {
    return (
      <p className={styles.error} role="alert">
        {error}
      </p>
    );
  }
  if (saved) {
    return (
      <p className={styles.success} role="status">
        Saved.
      </p>
    );
  }
  return null;
}
