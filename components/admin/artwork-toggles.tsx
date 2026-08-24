"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { setArtworkFlagsAction } from "@/app/actions/admin-artworks";
import { Switch } from "@/components/ui/switch";

type Flags = { sold: boolean; visible: boolean; featured: boolean };

const FLAG_LABELS: [keyof Flags, string][] = [
  ["sold", "Sold"],
  ["visible", "Visible"],
  ["featured", "Featured"],
];

export function ArtworkToggles({
  artworkId,
  sold,
  visible,
  featured,
}: { artworkId: number } & Flags) {
  const router = useRouter();
  const [flags, setFlags] = useState<Flags>({ sold, visible, featured });
  const [isPending, startTransition] = useTransition();

  function handleToggle(key: keyof Flags, checked: boolean) {
    setFlags((current) => ({ ...current, [key]: checked }));
    startTransition(async () => {
      await setArtworkFlagsAction(artworkId, { [key]: checked });
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      {FLAG_LABELS.map(([key, label]) => (
        <label key={key} className="flex items-center gap-1.5 text-xs">
          <Switch
            size="sm"
            checked={flags[key]}
            disabled={isPending}
            onCheckedChange={(checked) => handleToggle(key, checked)}
          />
          {label}
        </label>
      ))}
    </div>
  );
}
