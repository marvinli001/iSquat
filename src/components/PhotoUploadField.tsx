"use client";

import { useEffect, useMemo, useState } from "react";

type UploadItem = {
  id: string;
  name: string;
  status: "moderating" | "uploading" | "ready" | "error";
  error?: string;
  key?: string;
  url?: string;
  previewUrl?: string;
};

type PhotoUploadFieldProps = {
  prefix: "toilets" | "reviews";
  name?: string;
  label?: string;
  helper?: string;
  maxPhotos?: number;
  context?: string;
  onBusyChange?: (busy: boolean) => void;
};

const MAX_FILE_BYTES = 3 * 1024 * 1024;
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

const formatBytes = (bytes: number) => {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${Math.round(bytes / 1024)} KB`;
};

const readAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read image."));
    reader.readAsDataURL(file);
  });

const buildId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `photo_${Date.now()}_${Math.random().toString(16).slice(2)}`;

export default function PhotoUploadField({
  prefix,
  name = "photos",
  label = "Upload photos (optional)",
  helper = "JPG, PNG, WebP, or GIF. Up to 3 photos, max 3 MB each.",
  maxPhotos = 3,
  context = "upload",
  onBusyChange,
}: PhotoUploadFieldProps) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const busy = useMemo(
    () => items.some((item) => item.status === "moderating" || item.status === "uploading"),
    [items]
  );

  useEffect(() => {
    onBusyChange?.(busy);
  }, [busy, onBusyChange]);

  const handleRemove = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files) {
      return;
    }

    const currentCount = items.filter((item) => item.status !== "error").length;
    const remaining = maxPhotos - currentCount;
    if (remaining <= 0) {
      return;
    }

    const nextFiles = Array.from(files).slice(0, remaining);
    for (const file of nextFiles) {
      const id = buildId();
      if (!allowedTypes.has(file.type)) {
        setItems((prev) => [
          ...prev,
          {
            id,
            name: file.name,
            status: "error",
            error: "Unsupported file type.",
          },
        ]);
        continue;
      }

      if (file.size > MAX_FILE_BYTES) {
        setItems((prev) => [
          ...prev,
          {
            id,
            name: file.name,
            status: "error",
            error: `File too large. Max ${formatBytes(MAX_FILE_BYTES)}.`,
          },
        ]);
        continue;
      }

      setItems((prev) => [
        ...prev,
        { id, name: file.name, status: "moderating" },
      ]);

      try {
        const dataUrl = await readAsDataUrl(file);
        setItems((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, previewUrl: dataUrl } : item
          )
        );

        const moderation = await fetch("/api/moderate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dataUrl, context }),
        });
        const moderationResult = await moderation.json();
        if (!moderation.ok || !moderationResult.ok) {
          throw new Error(moderationResult.reason || "Image rejected.");
        }

        setItems((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, status: "uploading" } : item
          )
        );

        const policyResponse = await fetch("/api/oss/policy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prefix,
            filename: file.name,
            contentType: file.type,
          }),
        });
        const policy = await policyResponse.json();
        if (!policyResponse.ok) {
          throw new Error(policy.error || "Failed to prepare upload.");
        }

        const formData = new FormData();
        formData.append("key", policy.key);
        formData.append("policy", policy.policy);
        formData.append("OSSAccessKeyId", policy.accessKeyId);
        formData.append("Signature", policy.signature);
        formData.append("success_action_status", "200");
        formData.append("Content-Type", file.type);
        formData.append("file", file);

        const uploadResponse = await fetch(policy.host, {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error("Upload failed.");
        }

        setItems((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status: "ready",
                  key: policy.key,
                  url: policy.url,
                }
              : item
          )
        );
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Upload failed.";
        setItems((prev) =>
          prev.map((item) =>
            item.id === id
              ? { ...item, status: "error", error: message }
              : item
          )
        );
      }
    }
  };

  return (
    <div className="form-field">
      <label htmlFor={`${name}-input`}>{label}</label>
      <input
        accept="image/*"
        id={`${name}-input`}
        multiple
        onChange={(event) => {
          void handleFiles(event.target.files);
          event.currentTarget.value = "";
        }}
        type="file"
      />
      <p className="form-note">{helper}</p>

      {items.length > 0 ? (
        <div className="photo-grid">
          {items.map((item) => (
            <div
              className="photo-tile"
              data-tone={item.previewUrl ? undefined : "apricot"}
              data-status={item.status}
              key={item.id}
              style={
                item.previewUrl
                  ? { backgroundImage: `url(${item.previewUrl})` }
                  : undefined
              }
            >
              <button
                className="photo-remove"
                type="button"
                onClick={() => handleRemove(item.id)}
              >
                Remove
              </button>
              <div className="photo-meta">
                {item.status === "ready"
                  ? "Ready"
                  : item.status === "moderating"
                  ? "Checking..."
                  : item.status === "uploading"
                  ? "Uploading..."
                  : item.error || "Error"}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {items
        .filter((item) => item.status === "ready" && item.key && item.url)
        .map((item) => (
          <input
            key={item.id}
            type="hidden"
            name={name}
            value={JSON.stringify({ key: item.key, url: item.url })}
          />
        ))}
    </div>
  );
}
