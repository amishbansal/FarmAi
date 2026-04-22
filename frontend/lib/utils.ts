import axios from "axios";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const stripMarkdown = (markdownText: string) => {
  return markdownText
    .replace(/!\[.*?\]\(.*?\)/g, '') // remove images
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // remove links but keep text
    .replace(/[#>*_`~\-]/g, '') // remove special markdown characters
    .replace(/\n+/g, ' ') // remove newlines
    .trim();
};

const daysInPunjabi: Record<string, string> = {
  "Mon": "ਸੋਮ",
  "Tue": "ਮੰਗਲ",
  "Wed": "ਬੁੱਧ",
  "Thu": "ਵੀਰ",
  "Fri": "ਸ਼ੁੱਕਰ",
  "Sat": "ਸ਼ਨੀਚਰ",
  "Sun": "ਐਤ"
};


export const getLocalizedDay = (date: Date, language: string) => {
  const day = date.toLocaleDateString("en-US", { weekday: "short" }); // Get in English always as fallback

  if (language === "pa") {
    return daysInPunjabi[day];
  }

  return date.toLocaleDateString(
    language === "en" ? "en-US" : language === "hi" ? "hi-IN" : "en-US",
    { weekday: "short" }
  );
};


const monthNamesPa = [
  "ਜਨ", "ਫਰ", "ਮਾਰਚ", "ਅਪ੍ਰੈ", "ਮਈ", "ਜੂਨ",
  "ਜੁਲਾ", "ਅਗ", "ਸਤੰ", "ਅਕਤੂ", "ਨਵੰ", "ਦਸੰ"
];

export const formatDate = (value:number, lang:string) => {
  const date = new Date(value);
  const day = date.getDate();
  const monthIndex = date.getMonth();

  if (lang === 'pa') {
    return `${monthNamesPa[monthIndex]} ${day}`;
  }

  // For other languages use default localization
  return date.toLocaleDateString(lang, { month: 'short', day: 'numeric' });
};


export const translateTo = async (
  transcript: string,
  src_lang: string,
  tar_lang: string
): Promise<string> => {
  const url =
    "https://google-translate113.p.rapidapi.com/api/v1/translator/html";
  const data = JSON.stringify({
    from: src_lang,
    to: tar_lang,
    html: transcript,
  });
  try {
    const response = await axios.post(url, data, {
      headers: {
        "content-type": "application/json",
        "X-RapidAPI-Key": "ce41fb4896msh59b328a31aba943p1938b3jsneaa2cd3df182",
        "X-RapidAPI-Host": "google-translate113.p.rapidapi.com",
      },
    });
    // await saveChatToDB(response.data.trans); // Save bot response to DB
    return response.data.trans;
  } catch (e: any) {
    console.error("Translation API Error:", e.response?.data);
    return transcript;
  }
};
