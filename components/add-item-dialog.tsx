"use client";

import { useState } from "react";

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

const addItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  link: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  notes: z.string().optional(),
});

type AddItemFormData = z.infer<typeof addItemSchema>;

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (data: AddItemFormData) => void;
}

export function AddItemDialog({
  open,
  onOpenChange,
  onAdd,
}: AddItemDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddItemFormData>({
    resolver: zodResolver(addItemSchema),
    defaultValues: {
      name: "",
      link: "",
      notes: "",
    },
  });

  const onSubmit = async (data: AddItemFormData) => {
    setIsSubmitting(true);
    try {
      await onAdd(data);
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
          <DialogTitle>Add Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                data-test-id="item-name-input"
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
              <Label htmlFor="link">Link</Label>
              <Input
                id="link"
                type="url"
                data-test-id="item-link-input"
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
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                data-test-id="item-notes-input"
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
              data-test-id="item-submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
