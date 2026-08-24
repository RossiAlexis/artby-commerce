"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  deleteArtworkAction,
  setArtworkFlagsAction,
} from "@/app/actions/admin-artworks";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function DeleteArtworkButton({
  artworkId,
  artworkTitle,
}: {
  artworkId: number;
  artworkTitle: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blockedByOrder, setBlockedByOrder] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteArtworkAction(artworkId);
      if (!result.success) {
        setError(result.error);
        setBlockedByOrder(result.blockedByOrder);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  function handleHideInstead() {
    startTransition(async () => {
      await setArtworkFlagsAction(artworkId, { visible: false });
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setError(null);
          setBlockedByOrder(false);
        }
      }}
    >
      <DialogTrigger render={<Button variant="destructive" size="sm" />}>
        Delete
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete &ldquo;{artworkTitle}&rdquo;?</DialogTitle>
          <DialogDescription>
            This can&apos;t be undone. An Artwork referenced by an Order
            can&apos;t be deleted — hiding it is offered instead.
          </DialogDescription>
        </DialogHeader>
        {error && <p className="text-destructive text-xs">{error}</p>}
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            Cancel
          </DialogClose>
          {blockedByOrder ? (
            <Button onClick={handleHideInstead} disabled={isPending}>
              Hide instead
            </Button>
          ) : (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              Delete
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
