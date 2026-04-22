"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useImageUrlStore } from "@/store/image-url-store";
import { useUploaderOpen } from "@/store/uploader-open-store";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export function InputFilePicker() {
  const [loading, setLoading] = useState(false);
  const {t} = useTranslation();

  const { setImageUrl } = useImageUrlStore();
  const { set } = useUploaderOpen();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file); // Convert file to Base64
    reader.onloadend = () => {
      setImageUrl(reader.result as string); // Store Base64 string
      setLoading(false);
      set(false);
      toast.success("Image uploaded successfully");
    };
  };
  return (
    <div className="grid w-full max-w-md items-center gap-1.5 py-3">
      <Label htmlFor="picture">{t('Picture')}</Label>
      <Input
        className="cursor-pointer"
        id="picture"
        type="file"
        accept="image/*"
        disabled={loading}
        onChange={handleFileChange}
      />
    </div>
  );
}
