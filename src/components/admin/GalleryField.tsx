"use client";

import { useState } from "react";
import styles from "./admin.module.css";
import { uploadImageFile } from "./uploadClient";
import type { Selfie } from "@/lib/content/text";

export function GalleryField({ initial }: { initial: Selfie[] }) {
  const [items, setItems] = useState<Selfie[]>(
    initial.length > 0 ? initial : [{ blobUrl: "", caption: "" }],
  );
  const [error, setError] = useState("");
  const [busyIndex, setBusyIndex] = useState<number | null>(null);

  function update(index: number, patch: Partial<Selfie>) {
    setItems((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
    );
  }

  return (
    <fieldset className={styles.gallery}>
      <legend>Selfies</legend>
      <p className={styles.help}>
        Each photo is a public image URL plus a caption. Empty rows are dropped on save.
      </p>
      {items.map((item, index) => (
        <div className={styles.galleryRow} key={index}>
          <div className={styles.field}>
            <label>
              Photo {index + 1}
              <input
                type="file"
                accept="image/*"
                disabled={busyIndex === index}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (!file) return;
                  setBusyIndex(index);
                  setError("");
                  void uploadImageFile(file, false)
                    .then((url) => update(index, { blobUrl: url }))
                    .catch((reason: unknown) => {
                      setError(reason instanceof Error ? reason.message : "Upload failed.");
                    })
                    .finally(() => setBusyIndex(null));
                }}
              />
            </label>
            {item.blobUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- blob and local CMS urls
              <img className={styles.preview} src={item.blobUrl} alt="" />
            ) : null}
          </div>
          <label className={styles.field}>
            Caption
            <input
              value={item.caption}
              onChange={(event) => update(index, { caption: event.target.value })}
            />
          </label>
        </div>
      ))}
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
      <div className={styles.toolbar}>
        <button
          className={styles.buttonSecondary}
          type="button"
          onClick={() => setItems((current) => [...current, { blobUrl: "", caption: "" }].slice(0, 12))}
        >
          Add photo
        </button>
        {items.length > 1 ? (
          <button
            className={styles.buttonSecondary}
            type="button"
            onClick={() => setItems((current) => current.slice(0, -1))}
          >
            Remove last
          </button>
        ) : null}
      </div>
      <input type="hidden" name="selfie_gallery" value={JSON.stringify(items)} />
    </fieldset>
  );
}
