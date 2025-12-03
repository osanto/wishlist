"use client";

import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const editWishlistSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
});

type EditWishlistFormData = z.infer<typeof editWishlistSchema>;

interface Wishlist {
  id: string;
  title: string;
  description?: string;
}

interface EditWishlistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  wishlist: Wishlist | null;
  onEdit: (wishlistId: string, data: EditWishlistFormData) => void;
}

export function EditWishlistDialog({
  open,
  onOpenChange,
  wishlist,
  onEdit,
}: EditWishlistDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<EditWishlistFormData>({
    resolver: zodResolver(editWishlistSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  // Update form values when wishlist changes
  useEffect(() => {
    if (wishlist) {
      setValue("title", wishlist.title);
      setValue("description", wishlist.description || "");
    } else {
      reset();
    }
  }, [wishlist, setValue, reset]);

  const onSubmit = async (data: EditWishlistFormData) => {
    if (!wishlist) return;

    setIsSubmitting(true);
    try {
      await onEdit(wishlist.id, data);
      reset();
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Wishlist</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="edit-wishlist-title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-wishlist-title"
                data-test-id="edit-wishlist-title-input"
                {...register("title")}
                placeholder="Wishlist title"
              />
              {errors.title && (
                <p className="text-sm text-destructive">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-wishlist-description">Description</Label>
              <Textarea
                id="edit-wishlist-description"
                data-test-id="edit-wishlist-description-input"
                {...register("description")}
                placeholder="Optional description"
                rows={3}
              />
              {errors.description && (
                <p className="text-sm text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-test-id="edit-wishlist-submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

