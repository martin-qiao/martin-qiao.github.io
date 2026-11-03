"use client";

import { useState } from "react";
import styles from "./admin.module.css";
import { uploadImageFile } from "./uploadClient";

export function ImageField({
  name,
  label,
  initial = "",
  square = false,
  hint,
}: {
  name: string;
  label: string;
  initial?: string;
  square?: boolean;
  hint?: string;
}) {
  const [url, setUrl] = useState(initial);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <div className={styles.field}>
      <label>
        {label}
        <input
          type="file"
          accept="image/*"
          disabled={busy}
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file) return;
            setBusy(true);
            setError("");
            void uploadImageFile(file, square)
              .then(setUrl)
              .catch((reason: unknown) => {
                setError(reason instanceof Error ? reason.message : "Upload failed.");
              })
              .finally(() => setBusy(false));
          }}
        />
      </label>
      {hint ? <p className={styles.help}>{hint}</p> : null}
      {busy ? <p className={styles.help}>Uploading…</p> : null}
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
      <input type="hidden" name={name} value={url} />
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element -- blob and local CMS urls
        <img className={styles.preview} src={url} alt="" />
      ) : null}
    </div>
  );
}
