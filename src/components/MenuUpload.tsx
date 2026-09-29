import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MenuData } from "@/types/menu";
import { CURRENCIES, LANGUAGE_CURRENCY_MAP, LANGUAGE_NAMES, coverFor } from "@/lib/passport";
import { loadDemo } from "@/demo";

const API_URL = import.meta.env.PROD ? "https://menu-passport-backend.onrender.com" : "http://localhost:8000";

const selectClass =
  "field-select w-full cursor-pointer rounded-none border-b border-foil bg-transparent py-1 pr-8 text-xl text-paper hover:border-paper focus-visible:border-paper focus-visible:shadow-[0_1px_0_hsl(var(--paper))] focus-visible:outline-none";

function Picker({ label, value, onChange, children }: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <span className="relative mt-1 flex items-center">
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={(e) => {
          const option = e.target;
          if (option instanceof HTMLOptionElement && option.selected && e.relatedTarget === e.currentTarget) {
            requestAnimationFrame(() =>
              option.scrollIntoView({ block: "start", container: "nearest" } as ScrollIntoViewOptions),
            );
          }
        }}
        className={selectClass}
      >
        {children}
      </select>
      <ChevronDown aria-hidden className="pointer-events-none absolute right-1 h-5 w-5 text-foil" />
    </span>
  );
}

interface MenuUploadProps {
  onMenuProcessed: (data: MenuData, imageUrl: string) => void;
}

export default function MenuUpload({ onMenuProcessed }: MenuUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [language, setLanguage] = useState("en");
  const [currency, setCurrency] = useState("USD");
  const [includeCurrency, setIncludeCurrency] = useState(false);
  const [useAgent, setUseAgent] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.cover = coverFor(language, includeCurrency ? currency : undefined);
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", `hsl(${getComputedStyle(root).getPropertyValue("--cover").trim()})`);
  }, [language, currency, includeCurrency]);

  const selectFile = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Choose an image file, like a JPG or PNG photo of the menu.");
      return;
    }
    setError("");
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;
    setError("");
    setIsProcessing(true);
    try {
      const params = new URLSearchParams({ target_language: language });
      if (includeCurrency) params.set("target_currency", currency);
      const formData = new FormData();
      formData.append("file", selectedFile);

      let response: Response;
      try {
        response = await fetch(`${API_URL}/${useAgent ? "process-agent" : "process"}?${params}`, {
          method: "POST",
          body: formData,
        });
      } catch {
        throw new Error("Couldn't reach the server. It may be starting up, so try again in about 30 seconds.");
      }
      if (!response.ok) {
        throw new Error(`The menu couldn't be read (error ${response.status}). Try again, or use a sharper photo.`);
      }
      const { data } = await response.json();
      if (!data?.menu_items?.length) {
        throw new Error("No dishes found in this photo. Try a closer, straight-on shot of the menu.");
      }
      onMenuProcessed({ menu_items: data.menu_items, metadata: data.metadata }, previewUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        selectFile(e.dataTransfer.files?.[0]);
      }}
      onDragOver={(e) => e.preventDefault()}
      onDragEnter={() => setDragging(true)}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false);
      }}
      className="relative min-h-dvh bg-passport text-paper transition-colors duration-500 motion-reduce:transition-none"
    >
      <button
        type="button"
        onClick={() => {
          const demo = loadDemo();
          onMenuProcessed(demo.menuData, demo.imageUrl);
        }}
        className="absolute right-4 top-4 rounded-full border border-foil/60 px-3 py-1 text-sm text-foil hover:border-foil hover:bg-foil/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foil"
      >
        See an example
      </button>
      <div className="mx-auto flex max-w-md flex-col px-6 pb-12 pt-16 sm:min-h-dvh sm:justify-center sm:py-20">
        <h1 className="flex items-center gap-3 font-wordmark text-2xl min-[360px]:text-3xl tracking-[0.12em] text-foil">
          <svg viewBox="1.5 4.5 28 23" aria-hidden="true" className="h-10 w-12 shrink-0" fill="currentColor">
            <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 13v13.5M28 16.5v10M16 7.5v17M7.5 16h17M8.9 11.5h14.2M8.9 20.5h14.2" />
              <circle cx="16" cy="16" r="8.5" />
              <ellipse cx="16" cy="16" rx="4.25" ry="8.5" />
            </g>
            <path d="M2.5 10V6.05a.55.55 0 0 1 1.1 0V9.5a.425.425 0 0 0 .85 0V6.05a.55.55 0 0 1 1.1 0V9.5a.425.425 0 0 0 .85 0V6.05a.55.55 0 0 1 1.1 0V10c0 2-1.75 2.5-1.75 3.5h-1.5c0-1-1.75-1.5-1.75-3.5z" />
            <path d="M28.75 17V5.75c0-.5-.5-.65-.85-.35C26.4 6.8 25.5 9.5 25.5 13.5c0 1.5.5 2.5 1.75 3.5z" />
          </svg>
          Menu Passport
        </h1>
        <p className="mt-9 font-serif text-4xl font-semibold leading-[1.1]">Any menu.</p>
        <p className="mt-3.5 text-lg tracking-[0.02em] text-paper/75">Your language and currency.</p>

        <input
          type="file"
          accept="image/*"
          id="menu-photo"
          className="peer sr-only"
          onChange={(e) => selectFile(e.target.files?.[0])}
        />
        <label
          htmlFor="menu-photo"
          className={`mt-10 flex aspect-video cursor-pointer items-center gap-4 rounded-md border p-4 hover:border-paper peer-focus-visible:ring-2 peer-focus-visible:ring-foil ${dragging ? "border-dashed border-paper" : "border-foil"}`}
        >
          {selectedFile ? (
            <>
              <img
                src={previewUrl}
                alt=""
                className={`h-32 w-32 shrink-0 rounded-sm object-cover ${isProcessing ? "opacity-50" : ""}`}
              />
              <span className="min-w-0">
                <span className="block truncate">{selectedFile.name}</span>
                <span className="text-sm text-paper/70">Change photo</span>
              </span>
            </>
          ) : (
            <span className="w-full text-center text-xl">Take or choose a photo</span>
          )}
        </label>

        <div className="mt-8 grid grid-cols-[minmax(0,1fr)_8rem] gap-6">
          <label className="block">
            <span className="block text-sm text-paper/70">Translate into</span>
            <Picker
              value={language}
              onChange={(l) => {
                setLanguage(l);
                setCurrency(LANGUAGE_CURRENCY_MAP[l]);
              }}
            >
              {Object.entries(LANGUAGE_NAMES).sort((a, b) => a[1].localeCompare(b[1])).map(([code, name]) => (
                <option key={code} value={code}>{name}</option>
              ))}
            </Picker>
          </label>

          <div>
            <label className="-my-3 flex cursor-pointer items-center gap-2 py-3 text-sm text-paper/70">
              <input
                type="checkbox"
                checked={includeCurrency}
                onChange={(e) => setIncludeCurrency(e.target.checked)}
                className="h-4 w-4 cursor-pointer accent-foil"
              />
              Show prices in
            </label>
            <div className={includeCurrency ? "" : "[&_select]:text-paper/70"}>
              <Picker
                label="Currency"
                value={currency}
                onChange={(c) => {
                  setCurrency(c);
                  setIncludeCurrency(true);
                }}
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Picker>
            </div>
          </div>
        </div>

        <label className="mt-8 flex cursor-pointer gap-3">
          <input
            type="checkbox"
            aria-describedby="agent-note"
            checked={useAgent}
            onChange={(e) => setUseAgent(e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-foil"
          />
          <span>
            Agent orchestration
            <span id="agent-note" className="mt-1 block text-sm text-paper/70">
              An AI agent runs OCR, translation, price conversion, and image tools, choosing each one based on what it has found so far. Will take longer than the traditional pipeline used by default.
            </span>
          </span>
        </label>

        <Button
          onClick={handleSubmit}
          disabled={!selectedFile || isProcessing}
          className="mt-8 h-12 w-full bg-foil text-base font-semibold text-passport ring-offset-passport hover:bg-foil/90 focus-visible:ring-foil"
        >
          {isProcessing ? "Reading the menu…" : "Translate menu"}
        </Button>

        <div aria-live="polite">
          {isProcessing && useAgent && (
            <p className="mt-3 text-sm text-paper/70 motion-safe:animate-pulse">The agent is orchestrating the tools. This can take a minute.</p>
          )}
          {error && (
            <p className="mt-4 rounded-md bg-paper px-3 py-2 text-sm text-stop">{error}</p>
          )}
        </div>
      </div>
    </main>
  );
}
