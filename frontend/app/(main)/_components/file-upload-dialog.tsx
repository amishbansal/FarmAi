"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { ReactNode } from "react";
import { InputFilePicker } from "./file-picker";
import { useImageUrlStore } from "@/store/image-url-store";
import { useUploaderOpen } from "@/store/uploader-open-store";
import { useTranslation } from "react-i18next";

interface FileUploadDialogProps {
  children: ReactNode;
}

export const FileUploadDialog = () => {
  //   const { imageUrl } = useImageUrlStore();
  const { isOpen, set } = useUploaderOpen();
  const { t } = useTranslation();
  return (
    <Dialog open={isOpen} onOpenChange={set}>
      {/* <DialogTrigger asChild>{children}</DialogTrigger> */}

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("Upload Image")}</DialogTitle>
          <DialogDescription asChild>
            <InputFilePicker />
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant={'secondary'} onClick={() => set(false)} className="w-full">
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
