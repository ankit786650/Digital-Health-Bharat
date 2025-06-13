
"use client";

import * as React from "react";
import { Languages, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/contexts/LanguageContext"; // Added import
import type { Locale } from "@/locales/translations"; // Added import

export function LanguageToggle() {
  const [mounted, setMounted] = React.useState(false);
  const { locale, setLocale, t } = useLanguage(); // Use context

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleLanguageChange = (lang: Locale) => {
    setLocale(lang);
  };

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        aria-label="Toggle language"
        disabled
        className="h-9 w-9"
      >
        <Languages className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9" aria-label={t('toggleLanguage')}>
          <Languages className="h-5 w-5" />
          <span className="sr-only">{t('toggleLanguage')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleLanguageChange("en")} className="flex items-center justify-between">
          <span>{t('english')}</span>
          {locale === "en" && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleLanguageChange("hi")} className="flex items-center justify-between">
          <span>{t('hindi')}</span>
          {locale === "hi" && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
