"use client";

import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const editItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  link: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  price: z.string().optional(),
  notes: z.string().optional(),
});

type EditItemFormData = z.infer<typeof editItemSchema>;

interface Item {
  id: string;
  name: string;
  link?: string;
  price?: string;
  notes?: string;
}

interface EditItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: Item | null;
  onEdit: (itemId: string, data: EditItemFormData) => void;
}

export function EditItemDialog({
  open,
  onOpenChange,
  item,
  onEdit,
}: EditItemDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<EditItemFormData>({
    resolver: zodResolver(editItemSchema),
    defaultValues: {
      name: "",
      link: "",
      price: "",
      notes: "",
    },
  });

  // Update form values when item changes
  useEffect(() => {
    if (item) {
      setValue("name", item.name);
      setValue("link", item.link || "");
      setValue("price", item.price || "");
      setValue("notes", item.notes || "");
    } else {
      reset();
    }
  }, [item, setValue, reset]);

  const onSubmit = async (data: EditItemFormData) => {
    if (!item) return;

    setIsSubmitting(true);
    try {
      await onEdit(item.id, data);
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
          <DialogTitle>Edit Item</DialogTitle>
          <DialogDescription>
            Update the item details. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-name"
                data-test-id="edit-item-name-input"
                {...register("name")}
                placeholder="Item name"
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-link">Link</Label>
              <Input
                id="edit-link"
                type="url"
                data-test-id="edit-item-link-input"
                {...register("link")}
                placeholder="https://example.com/item"
              />
              {errors.link && (
                <p className="text-sm text-destructive">
                  {errors.link.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-price">Price</Label>
              <Input
                id="edit-price"
                data-test-id="edit-item-price-input"
                {...register("price")}
                placeholder="$99.99"
              />
              {errors.price && (
                <p className="text-sm text-destructive">
                  {errors.price.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                data-test-id="edit-item-notes-input"
                {...register("notes")}
                placeholder="Additional notes or preferences"
                rows={3}
              />
              {errors.notes && (
                <p className="text-sm text-destructive">
                  {errors.notes.message}
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
              data-test-id="edit-item-submit-button"
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

