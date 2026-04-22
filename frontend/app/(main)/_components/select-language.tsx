"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguageStore } from "@/store/language-store";
import { useTranslation } from "react-i18next";

export const SelectLanguage = () => {
  const { i18n } = useTranslation();
  const { language, set } = useLanguageStore();

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang); // Change the language dynamically
    set(lang);
  };

  return (
    <Select value={language} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-[130px]">
        <SelectValue placeholder="English" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">English</SelectItem>
        <SelectItem value="pa">ਪੰਜਾਬੀ</SelectItem>{" "}
        {/* Assuming you add Punjabi translations later */}
        <SelectItem value="hi">हिंदी</SelectItem>
      </SelectContent>
    </Select>
  );
};
