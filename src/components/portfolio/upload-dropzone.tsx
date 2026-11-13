"use client";
import React, { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { UploadCloud, X, ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { validateUploadFile, MAX_UPLOAD_SIZE_MB } from "@/lib/workflow";
import { cn } from "@/lib/utils";

type Props = {
  file: File | null;
  previewUrl: string | null;
  onFileSelected: (file: File, previewUrl: string) => void;
  onClear: () => void;
  uploading?: boolean;
  error?: string | null;
};

export function UploadDropzone({ file, previewUrl, onFileSelected, onClear, uploading, error }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [drag, setDrag] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    const err = validateUploadFile(f);
    if (err) { setLocalError(err); return; }
    setLocalError(null);
    const url = URL.createObjectURL(f);
    onFileSelected(f, url);
  }, [onFileSelected]);

  return (
    <div className="space-y-3">
      {!file ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files); }}
          className={cn("rounded-sm border border-dashed p-10 text-center transition-all duration-200", drag ? "border-gold/60 bg-gold/5" : "border-line bg-cream/40 hover:bg-cream/70")}
        >
          <UploadCloud className="h-9 w-9 mx-auto text-charcoal/70 mb-3" />
          <p className="font-serif text-xl">Drag & drop your Groww portfolio screenshot</p>
          <p className="text-sm text-muted-foreground mt-1">PNG, JPG, JPEG, or WEBP up to {MAX_UPLOAD_SIZE_MB} MB</p>
          <div className="mt-4 flex justify-center">
            <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()} disabled={uploading}>
              Choose file
            </Button>
            <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/jpg,image/webp" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-start">
            <div className="relative w-full sm:w-56 aspect-[4/3] rounded-md border border-border overflow-hidden bg-slate-100 flex items-center justify-center">
              {previewUrl ? <Image src={previewUrl} alt="Portfolio screenshot preview" fill unoptimized className="object-contain" /> : <ImageIcon className="h-8 w-8 text-muted-foreground" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{file.name}</div>
              <div className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB · {file.type || "image"}</div>
              {uploading && <div className="mt-3 flex items-center gap-2 text-sm text-primary"><Loader2 className="h-4 w-4 animate-spin" /> Extracting holdings from screenshot...</div>}
              <div className="mt-4 flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={uploading}>Replace</Button>
                <Button type="button" variant="ghost" size="sm" onClick={onClear} disabled={uploading} className="text-muted-foreground"><X className="h-4 w-4 mr-1"/>Remove</Button>
                <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/jpg,image/webp" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {(localError || error) && <Alert variant="error" title="Upload issue">{localError || error}</Alert>}
    </div>
  );
}
