"use client";

import styles from "./admin.module.css";

export function ConfirmDelete({
  id,
  action,
  label = "Delete",
}: {
  id: string;
  action: (formData: FormData) => void | Promise<void>;
  label?: string;
}) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <button
        className={styles.buttonDanger}
        type="submit"
        onClick={(event) => {
          if (!window.confirm("Delete this? This cannot be undone.")) {
            event.preventDefault();
          }
        }}
      >
        {label}
      </button>
    </form>
  );
}
