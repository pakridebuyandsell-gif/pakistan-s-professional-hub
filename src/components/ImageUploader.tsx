import { useCallback, useRef, useState } from "react";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

const MAX_FILES = 4;
const MAX_SIZE_MB = 2;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export interface ImageUploaderProps {
  value: File[];
  onChange: (files: File[]) => void;
  max?: number;
  disabled?: boolean;
}

/**
 * Multi-image picker (max 4 by default) with drag & drop, previews, per-file
 * validation and one-click remove. Emits File[] so the parent decides when to
 * upload (typically on wizard submit).
 */
export function ImageUploader({ value, onChange, max = MAX_FILES, disabled }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);

  const previews = value.map((f) => ({ file: f, url: URL.createObjectURL(f) }));

  const accept = useCallback(
    (incoming: FileList | File[]) => {
      const arr = Array.from(incoming);
      const remaining = max - value.length;
      if (remaining <= 0) {
        toast.error(`You can upload at most ${max} images`);
        return;
      }
      const valid: File[] = [];
      for (const f of arr.slice(0, remaining)) {
        if (!ACCEPTED.includes(f.type)) {
          toast.error(`${f.name}: unsupported format`);
          continue;
        }
        if (f.size > MAX_SIZE_MB * 1024 * 1024) {
          toast.error(`${f.name}: exceeds ${MAX_SIZE_MB}MB`);
          continue;
        }
        valid.push(f);
      }
      if (valid.length) onChange([...value, ...valid]);
    },
    [max, onChange, value],
  );

  const remove = (idx: number) => onChange(value.filter((_, i) => i !== idx));

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (disabled) return;
          if (e.dataTransfer.files?.length) accept(e.dataTransfer.files);
        }}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
          dragging ? "border-[var(--brand-orange)] bg-[var(--brand-orange)]/5" : "border-border hover:border-[var(--brand-orange)]/60"
        } ${disabled ? "opacity-60 pointer-events-none" : ""}`}
      >
        <ImagePlus className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-2 text-sm font-medium">
          Drag & drop or <span className="text-[var(--brand-orange)]">browse</span> to upload
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Up to {max} images · JPG, PNG, WEBP or GIF · max {MAX_SIZE_MB}MB each
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED.join(",")}
          className="hidden"
          onChange={(e) => e.target.files && accept(e.target.files)}
        />
      </div>

      {previews.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {previews.map((p, i) => (
            <div key={i} className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-muted">
              <img src={p.url} alt={p.file.name} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label={`Remove ${p.file.name}`}
              >
                <X className="h-3 w-3" />
              </button>
              <span className="absolute bottom-0 left-0 right-0 truncate bg-black/50 px-2 py-0.5 text-[10px] text-white">
                {p.file.name}
              </span>
            </div>
          ))}
        </div>
      )}

      <p className="mt-2 text-xs text-muted-foreground">
        {value.length} / {max} selected
      </p>
    </div>
  );
}

export function UploadingOverlay({ active, label = "Uploading images…" }: { active: boolean; label?: string }) {
  if (!active) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="flex items-center gap-3 rounded-xl bg-white px-5 py-4 shadow-lg">
        <Loader2 className="h-5 w-5 animate-spin text-[var(--brand-green)]" />
        <span className="text-sm font-medium">{label}</span>
      </div>
    </div>
  );
}
