import { useState } from "react";
import { Upload, Globe, DollarSign, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { MenuData } from "@/types/menu";

const LANGUAGE_CURRENCY_MAP: Record<string, string> = {
  ar: "SAR",
  bg: "BGN",
  cs: "CZK",
  da: "DKK",
  de: "EUR",
  el: "EUR",
  en: "USD",
  es: "EUR",
  et: "EUR",
  fi: "EUR",
  fr: "EUR",
  hu: "HUF",
  id: "IDR",
  it: "EUR",
  ja: "JPY",
  ko: "KRW",
  lt: "EUR",
  lv: "EUR",
  nb: "NOK",
  nl: "EUR",
  pl: "PLN",
  pt: "BRL",
  ro: "RON",
  ru: "RUB",
  sk: "EUR",
  sl: "EUR",
  sv: "SEK",
  tr: "TRY",
  uk: "UAH",
  zh: "CNY",
};

const LANGUAGE_NAMES: Record<string, string> = {
  ar: "Arabic",
  bg: "Bulgarian",
  cs: "Czech",
  da: "Danish",
  de: "German",
  el: "Greek",
  en: "English",
  es: "Spanish",
  et: "Estonian",
  fi: "Finnish",
  fr: "French",
  hu: "Hungarian",
  id: "Indonesian",
  it: "Italian",
  ja: "Japanese",
  ko: "Korean",
  lt: "Lithuanian",
  lv: "Latvian",
  nb: "Norwegian",
  nl: "Dutch",
  pl: "Polish",
  pt: "Portuguese",
  ro: "Romanian",
  ru: "Russian",
  sk: "Slovak",
  sl: "Slovenian",
  sv: "Swedish",
  tr: "Turkish",
  uk: "Ukrainian",
  zh: "Chinese",
};

interface MenuUploadProps {
  onMenuProcessed: (data: MenuData, imageUrl: string) => void;
}

export default function MenuUpload({ onMenuProcessed }: MenuUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [language, setLanguage] = useState("en");
  const [currency, setCurrency] = useState("USD");
  const [includeCurrency, setIncludeCurrency] = useState(false);
  const [useAdvanced, setUseAdvanced] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      console.error("No image selected");
      return;
    }

    setIsProcessing(true);
    try {
      const API_URL = import.meta.env.PROD ? 'https://menu-passport-backend.onrender.com' : 'http://localhost:8000';
      let url = useAdvanced ? `${API_URL}/process-agent?target_language=${language}` : `${API_URL}/process?target_language=${language}`;
      if (includeCurrency) {
        url += `&target_currency=${currency}`;
      }
      const formData = new FormData();
      formData.append('file', selectedFile);
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      const menuData: MenuData = {
        menu_items: result.data.menu_items,
        metadata: result.data.metadata,
      };
      onMenuProcessed(menuData, URL.createObjectURL(selectedFile));
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 my-[20vh] ">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary transition-colors cursor-pointer bg-card"
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Preview"
              className="max-h-48 mx-auto rounded-lg shadow-[var(--shadow-soft)]"
            />
          ) : (
            <>
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Drag and drop your menu image, or click to browse
              </p>
            </>
          )}
        </label>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Target Language
          </Label>
          <Select value={language} onValueChange={setLanguage} defaultValue={"en"}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(LANGUAGE_NAMES).map(([code, name]) => (
                <SelectItem key={code} value={code}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="currency"
            checked={includeCurrency}
            onCheckedChange={(checked) =>
              setIncludeCurrency(checked as boolean)
            }
          />
          <Label
            htmlFor="currency"
            className="flex items-center gap-2 cursor-pointer"
          >
            Include currency conversion
          </Label>
        </div>
        
        {includeCurrency && (
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Target Currency
            </Label>
            <Select value={currency} onValueChange={setCurrency} defaultValue={"USD"} disabled={!includeCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[...new Set(Object.values(LANGUAGE_CURRENCY_MAP))].sort().map((currency) => (
                  <SelectItem key={currency} value={currency}>
                    {currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>)
        }

        <div className="flex items-center space-x-2">
          <Checkbox
            id="extraction"
            checked={useAdvanced}
            onCheckedChange={(checked) => setUseAdvanced(checked as boolean)}
          />
          <Label
            htmlFor="extraction"
            className="flex items-center gap-2 cursor-pointer"
          >
            <Bot className="w-4 h-4" />
            Use agentic extraction
          </Label>
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!selectedFile || isProcessing}
        className="w-full h-12 text-lg font-semibold"
        size="lg"
      >
        {isProcessing ? "Processing..." : "Translate Menu"}
      </Button>
    </div>
  );
}
