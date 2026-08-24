"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import {
  uploadSiteSettingsImageAction,
  type SiteSettingsImageField,
} from "@/app/actions/admin-site-settings";
import { Button } from "@/components/ui/button";

export function SiteSettingsImageUpload({
  field,
  imageUrl,
  changeLabel,
}: {
  field: SiteSettingsImageField;
  imageUrl: string;
  changeLabel: string;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [, startTransition] = useTransition();

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError(null);
    setIsUploading(true);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("file", file);
      const result = await uploadSiteSettingsImageAction(field, formData);
      setIsUploading(false);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex items-start gap-4">
      {/* eslint-disable-next-line @next/next/no-img-element -- admin-only preview of an already-uploaded Blob URL, not worth next/image's optimization pipeline */}
      <img
        src={imageUrl}
        alt=""
        className="h-[104px] w-[186px] shrink-0 border border-[#e2d8ce] object-cover"
      />
      <div className="flex flex-col items-start gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="border-primary text-primary hover:bg-primary/5"
        >
          {isUploading ? "Subiendo…" : changeLabel}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
        {error && <p className="text-destructive text-xs">{error}</p>}
      </div>
    </div>
  );
}
