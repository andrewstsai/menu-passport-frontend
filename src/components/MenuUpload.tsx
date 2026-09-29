import { useEffect, useState } from "react";
import { ArrowDown, ArrowRight, ChevronDown, Upload } from "lucide-react";
import { MenuData } from "@/types/menu";
import { CURRENCIES, LANGUAGE_CURRENCY_MAP, LANGUAGE_NAMES, coverFor } from "@/lib/passport";
import { loadDemo } from "@/demo";

const API_URL = import.meta.env.PROD ? "https://menu-passport-backend.onrender.com" : "http://localhost:8000";

const selectClass =
  "field-select w-full cursor-pointer rounded-none border-b border-ink/40 bg-transparent py-1 pr-8 text-xl text-ink hover:border-ink focus-visible:border-ink focus-visible:shadow-[0_1px_0_hsl(var(--ink))] focus-visible:outline-none";

const labelClass = "text-xs uppercase tracking-[0.14em] text-pencil";

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
      <ChevronDown aria-hidden className="pointer-events-none absolute right-1 h-5 w-5 text-ink" />
    </span>
  );
}

interface MenuUploadProps {
  onMenuProcessed: (data: MenuData, imageUrl: string, href?: string) => void;
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
    if (previewUrl) URL.revokeObjectURL(previewUrl);
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
      className="relative min-h-dvh bg-passport bg-[linear-gradient(rgb(0_0_0/0.35),rgb(0_0_0/0.35))] p-3 text-paper transition-colors duration-500 motion-reduce:transition-none lg:p-6"
    >
      <div className="grid overflow-hidden rounded-xl shadow-[0_30px_80px_rgb(0_0_0/0.5)] lg:min-h-[calc(100dvh-3rem)] lg:auto-rows-fr lg:grid-cols-2">
        <section className="relative flex min-h-[calc((100dvh-1.5rem)/2)] flex-col items-center justify-center rounded-t-xl bg-passport px-6 py-10 text-center transition-colors duration-500 [view-transition-name:verso] motion-reduce:transition-none lg:min-h-0 lg:rounded-l-xl lg:rounded-tr-none lg:px-12">
        <div aria-hidden className="pointer-events-none absolute inset-3 rounded-md border border-foil/30 lg:inset-4" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-black/40 lg:inset-x-auto lg:inset-y-0 lg:right-0 lg:h-auto lg:w-8 lg:bg-gradient-to-l" />
        <h1 className="flex flex-col-reverse items-center gap-4 font-wordmark text-base uppercase tracking-[0.3em] text-foil lg:gap-14 lg:text-[1.75rem]">
          <svg viewBox="1.5 4.5 28 23" aria-hidden="true" className="h-24 w-28 shrink-0 lg:h-40 lg:w-44" fill="currentColor">
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
        <p className="mt-4 font-serif text-4xl font-semibold leading-[1.1] lg:mt-14 lg:text-[5rem]">Any menu.</p>
        <p className="mt-2 text-base tracking-[0.02em] text-paper/75 lg:mt-4 lg:text-[1.75rem]">Your language and currency.</p>
        </section>

        <section className="relative flex flex-col rounded-b-xl bg-paper px-[max(1.5rem,calc(50%-14rem))] py-7 text-ink [view-transition-name:recto] lg:justify-center lg:rounded-r-xl lg:rounded-bl-none lg:px-[max(3rem,calc(50%-18rem))] lg:py-12">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-black/30 via-black/10 via-30% lg:inset-x-auto lg:inset-y-0 lg:left-0 lg:h-auto lg:w-16 lg:bg-gradient-to-r" />
        <div className="flex items-center justify-between">
          <p aria-hidden className="text-sm uppercase tracking-[0.2em] text-pencil">Visa · Page 1</p>
          <a
            href="?demo"
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
              e.preventDefault();
              const demo = loadDemo();
              onMenuProcessed(demo.menuData, demo.imageUrl, "?demo");
            }}
            className="group -m-2 flex items-center gap-1.5 rounded-sm p-2 text-sm uppercase tracking-[0.14em] text-passport focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-passport lg:absolute lg:right-6 lg:top-6"
          >
            <span className="-mr-[0.14em] underline-offset-4 [text-box:trim-both_cap_alphabetic] group-hover:underline">See an example</span>
            <ArrowDown aria-hidden className="h-4 w-4 lg:hidden" />
            <ArrowRight aria-hidden className="hidden h-4 w-4 lg:block" />
          </a>
        </div>

        <input
          type="file"
          accept="image/*"
          id="menu-photo"
          className="peer sr-only"
          onChange={(e) => selectFile(e.target.files?.[0])}
        />
        <label
          htmlFor="menu-photo"
          className={`mt-4 flex aspect-video cursor-pointer items-center gap-4 rounded-md border border-dashed p-4 hover:border-ink peer-focus-visible:ring-2 peer-focus-visible:ring-passport lg:mt-6 lg:aspect-auto lg:h-44 ${dragging ? "border-ink" : "border-ink/40"}`}
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
                <span className="text-sm text-pencil">Change photo</span>
              </span>
            </>
          ) : (
            <>
              <span className="w-full text-center text-xl lg:hidden">Take or choose a photo</span>
              <span className="hidden w-full flex-col items-center gap-2 text-center lg:flex">
                <Upload aria-hidden className="h-8 w-8 text-passport" strokeWidth={1.5} />
                <span className="text-xl">Drop a menu photo here</span>
                <span className="text-sm text-pencil">
                  or <span className="text-passport underline underline-offset-4">browse files</span>
                </span>
              </span>
            </>
          )}
        </label>

        <div className="mt-8 grid grid-cols-[minmax(0,1fr)_8.5rem] gap-6 lg:grid-cols-[minmax(0,1fr)_10rem]">
          <label className="block">
            <span className={`block ${labelClass}`}>Translate into</span>
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
            <label className={`-my-3 flex cursor-pointer items-center gap-2 py-3 ${labelClass}`}>
              <input
                type="checkbox"
                checked={includeCurrency}
                onChange={(e) => setIncludeCurrency(e.target.checked)}
                className="h-4 w-4 cursor-pointer accent-passport"
              />
              Show prices in
            </label>
            <div className={includeCurrency ? "" : "[&_select]:text-pencil"}>
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
            className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-passport"
          />
          <span>
            Agent orchestration
            <span id="agent-note" className="mt-1 block text-sm text-pencil">
              Traditional pipeline if not selected.
            </span>
          </span>
        </label>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!selectedFile || isProcessing}
          className="mt-8 h-12 w-full rounded-md bg-passport font-semibold text-paper transition-colors hover:bg-passport/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-passport focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:opacity-50"
        >
          {isProcessing ? "Reading the menu…" : "Translate menu"}
        </button>

        <div aria-live="polite">
          {isProcessing && useAgent && (
            <p className="mt-3 text-sm text-pencil motion-safe:animate-pulse">The agent is orchestrating the tools. This can take a minute.</p>
          )}
          {error && (
            <p className="mt-4 rounded-md bg-stop/10 px-3 py-2 text-sm text-stop">{error}</p>
          )}
        </div>
        </section>
      </div>
    </main>
  );
}
