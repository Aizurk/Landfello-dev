import { useId, useRef } from "react";
import { Eye, FileText, Replace, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { StatusBadge, type StatusBadgeStatus } from "./StatusBadge";

export type FilePrivacy = "private" | "verified_buyers" | "after_offer";

export interface UploadedFileItem {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
  reviewStatus: StatusBadgeStatus;
  privacy: FilePrivacy;
  dataUrl?: string;
}

export interface FileUploadZoneProps {
  files: UploadedFileItem[];
  onChange: (files: UploadedFileItem[]) => void;
  label?: string;
  hint?: string;
  multiple?: boolean;
  className?: string;
  accept?: string;
}

const PRIVACY_LABELS: Record<FilePrivacy, string> = {
  private: "Private",
  verified_buyers: "Verified buyers",
  after_offer: "After offer",
};

function createId() {
  return `file_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function isImageType(type: string, name: string) {
  if (type.startsWith("image/")) return true;
  return /\.(jpe?g|png|gif|webp)$/i.test(name);
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function toUploadedFile(file: File): Promise<UploadedFileItem> {
  const base: UploadedFileItem = {
    id: createId(),
    name: file.name,
    type: file.type || "application/octet-stream",
    uploadedAt: new Date().toISOString(),
    reviewStatus: "pending",
    privacy: "private",
  };

  if (isImageType(file.type, file.name)) {
    try {
      base.dataUrl = await readFileAsDataUrl(file);
    } catch {
      // Keep name-only metadata if FileReader fails
    }
  }

  return base;
}

export function FileUploadZone({
  files,
  onChange,
  label = "Upload documents",
  hint = "PDF or images (JPG, PNG). Multiple files supported.",
  multiple = true,
  className,
  accept = ".pdf,.jpg,.jpeg,.png,image/*",
}: FileUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList?.length) return;
    const selected = Array.from(fileList);
    const uploaded = await Promise.all(selected.map(toUploadedFile));
    onChange(multiple ? [...files, ...uploaded] : uploaded.slice(0, 1));
    if (inputRef.current) inputRef.current.value = "";
  };

  const updateFile = (id: string, patch: Partial<UploadedFileItem>) => {
    onChange(files.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  };

  const removeFile = (id: string) => {
    onChange(files.filter((f) => f.id !== id));
  };

  const replaceFile = async (id: string, fileList: FileList | null) => {
    if (!fileList?.[0]) return;
    const next = await toUploadedFile(fileList[0]);
    onChange(files.map((f) => (f.id === id ? { ...next, id: f.id, privacy: f.privacy } : f)));
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <div className="text-sm font-medium text-emerald-950">{label}</div>
        {hint ? <p className="mt-1 text-xs text-emerald-950/55">{hint}</p> : null}
      </div>

      <label
        htmlFor={inputId}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-emerald-900/20 bg-emerald-50/40 px-5 py-6 text-center transition-colors",
          "hover:border-emerald-900/40 hover:bg-emerald-50/70",
          "focus-within:outline-none focus-within:ring-2 focus-within:ring-emerald-900 focus-within:ring-offset-2"
        )}
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-900 ring-1 ring-emerald-900/10">
          <Upload className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-semibold text-emerald-950">
            Drop files here or click to browse
          </p>
          <p className="mt-0.5 text-xs text-emerald-950/55">
            Accepts PDF, JPG, and PNG
          </p>
        </div>
        <input
          id={inputId}
          ref={inputRef}
          type="file"
          className="sr-only"
          accept={accept}
          multiple={multiple}
          onChange={(e) => void handleFiles(e.target.files)}
        />
      </label>

      {files.length > 0 ? (
        <ul className="space-y-3">
          {files.map((file) => (
            <li
              key={file.id}
              className="rounded-2xl border border-emerald-900/10 bg-white p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-900">
                    <FileText className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-emerald-950">
                      {file.name}
                    </p>
                    <p className="mt-0.5 text-xs text-emerald-950/55">
                      {file.type || "Unknown type"}
                    </p>
                    <div className="mt-2">
                      <StatusBadge status={file.reviewStatus} />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Select
                    value={file.privacy}
                    onValueChange={(value) =>
                      updateFile(file.id, { privacy: value as FilePrivacy })
                    }
                  >
                    <SelectTrigger className="h-9 w-[160px] rounded-xl text-xs">
                      <SelectValue placeholder="Privacy" />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(PRIVACY_LABELS) as FilePrivacy[]).map(
                        (key) => (
                          <SelectItem key={key} value={key}>
                            {PRIVACY_LABELS[key]}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>

                  <label className="inline-flex">
                    <input
                      type="file"
                      className="sr-only"
                      accept={accept}
                      onChange={(e) => void replaceFile(file.id, e.target.files)}
                    />
                    <span className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-emerald-900/15 bg-transparent px-3 py-2 text-xs font-semibold text-emerald-950 hover:bg-emerald-900/5">
                      <Replace className="h-3.5 w-3.5" />
                      Replace
                    </span>
                  </label>

                  {file.dataUrl ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 rounded-xl px-3 text-xs"
                      onClick={() => window.open(file.dataUrl, "_blank", "noopener,noreferrer")}
                    >
                      <Eye className="mr-1.5 h-3.5 w-3.5" />
                      View
                    </Button>
                  ) : null}

                  <Button
                    type="button"
                    variant="ghost"
                    className="h-9 rounded-xl px-3 text-xs text-red-700 hover:bg-red-50 hover:text-red-800"
                    onClick={() => removeFile(file.id)}
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    Delete
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
