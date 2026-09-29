import { useLayoutEffect, useRef, useState } from "react";
import { ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MenuData, MenuItem } from "@/types/menu";
import { formatPrice } from "@/lib/passport";

interface MenuDisplayProps {
  menuData: MenuData;
  imageUrl: string;
  onBack: () => void;
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function Price({ item }: { item: MenuItem }) {
  if (item.converted_price == null || !item.currency) return null;
  return <>{formatPrice(item.converted_price, item.currency)}</>;
}

export default function MenuDisplay({ menuData, imageUrl, onBack }: MenuDisplayProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [selectedAtTop, setSelectedAtTop] = useState(false);
  const [hoveredAtTop, setHoveredAtTop] = useState(false);
  const items = menuData.menu_items;
  const shown = hovered ?? selected;
  const sheetAtTop = hovered !== null ? hoveredAtTop : selectedAtTop;
  const item = shown === null ? null : items[shown];

  const headerRef = useRef<HTMLElement>(null);
  const [headerBottom, setHeaderBottom] = useState(0);
  const topSheetOpen = sheetAtTop && shown !== null;
  useLayoutEffect(() => {
    if (!topSheetOpen) return;
    const update = () => setHeaderBottom(Math.max(0, headerRef.current?.getBoundingClientRect().bottom ?? 0));
    update();
    addEventListener("scroll", update, { passive: true });
    return () => removeEventListener("scroll", update);
  }, [topSheetOpen]);

  const hover = (i: number, fromList: boolean) => {
    setHovered(i);
    setHoveredAtTop(fromList);
  };

  const previewProps = (i: number, fromList: boolean) => ({
    onClick: () => {
      setSelected(i);
      setSelectedAtTop(fromList);
    },
    onMouseEnter: () => hover(i, fromList),
    onMouseLeave: () => setHovered(null),
  });

  return (
    <div className="min-h-dvh">
      <header ref={headerRef} className="bg-passport text-paper transition-colors duration-500 motion-reduce:transition-none">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 h-14">
          <Button
            variant="ghost"
            onClick={onBack}
            className="-ml-3 text-paper ring-offset-passport hover:bg-paper/10 hover:text-paper focus-visible:ring-foil"
          >
            <ArrowLeft />
            New menu
          </Button>
          <h1 className="text-sm text-paper/80">
            {items.length} {items.length === 1 ? "dish" : "dishes"}
          </h1>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <figure className="relative mx-auto w-fit max-w-full">
          <img src={imageUrl} alt="Photo of the menu" className="block h-auto max-h-[85dvh] max-w-full rounded-md" />
          {items.map((it, i) => {
            const { left, top, width, height } = it.bounding_box;
            const state =
              i === selected ? "opacity-90 outline outline-2 outline-ink" : i === hovered ? "opacity-70" : "opacity-40";
            return (
              <button
                key={i}
                type="button"
                tabIndex={-1}
                aria-hidden
                {...previewProps(i, false)}
                className={`absolute rounded-sm bg-highlighter mix-blend-multiply transition-opacity motion-reduce:transition-none ${state}`}
                style={{
                  left: `${left * 100}%`,
                  top: `${top * 100}%`,
                  width: `${width * 100}%`,
                  height: `${height * 100}%`,
                }}
              />
            );
          })}
        </figure>

        <aside className="lg:sticky lg:top-6 lg:flex lg:max-h-[calc(100dvh-6.5rem)] lg:flex-col">
          <section
            className={`fixed inset-x-0 z-20 max-h-[70dvh] ${sheetAtTop ? "rounded-b-lg border-b shadow-[0_8px_24px_hsl(var(--ink)/0.12)]" : "bottom-0 rounded-t-lg border-t shadow-[0_-8px_24px_hsl(var(--ink)/0.12)]"} ${item?.image_url ? "grid-cols-[9rem_minmax(0,1fr)]" : ""} ${item ? "grid" : "hidden lg:grid"} gap-4 overflow-y-auto scrollbar-thin bg-paper p-4 lg:static lg:mb-6 lg:shrink-0 lg:grid-cols-1 lg:rounded-lg lg:border lg:shadow-none`}
            style={sheetAtTop ? { top: headerBottom } : undefined}
          >
            {item?.image_url ? (
              <img
                src={item.image_url}
                alt=""
                className="aspect-square w-full rounded-md object-cover lg:aspect-[4/3]"
              />
            ) : (
              <div aria-hidden className="hidden aspect-[4/3] rounded-md bg-rule/60 lg:block" />
            )}
            <div className="lg:h-28 lg:overflow-hidden">
              {item ? (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-xl font-semibold leading-snug lg:line-clamp-2">
                      {capitalize(item.translated_name)}
                    </h2>
                    <button
                      type="button"
                      onClick={() => {
                        setSelected(null);
                        setHovered(null);
                      }}
                      className="-m-2 rounded-full p-3 text-pencil hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
                    >
                      <X className="h-5 w-5" />
                      <span className="sr-only">Close</span>
                    </button>
                  </div>
                  <p className="text-pencil lg:truncate">{item.name}</p>
                  <p className="mt-2 text-lg font-semibold tabular-nums">
                    <Price item={item} />
                  </p>
                </>
              ) : (
                <p className="text-pencil">Hover over or click a dish on the menu photo or in the list to see it here.</p>
              )}
            </div>
          </section>

          <h2 className="sr-only">Dishes</h2>
          <p className="mb-3 text-sm text-pencil lg:hidden">Tap a dish on the menu photo or in the list to see it.</p>
          <ul className="divide-y border-y scrollbar-thin lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain">
            {items.map((it, i) => (
              <li key={i}>
                <button
                  type="button"
                  aria-pressed={i === selected}
                  {...previewProps(i, true)}
                  onFocus={() => hover(i, true)}
                  onBlur={() => setHovered(null)}
                  className={`flex w-full items-baseline justify-between gap-4 px-2 py-3 text-left hover:bg-rule/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring ${i === selected ? "bg-highlighter/40 hover:bg-highlighter/40" : ""}`}
                >
                  <span className="min-w-0">
                    <span className="block font-semibold">{capitalize(it.translated_name)}</span>
                    <span className="block text-sm text-pencil">{it.name}</span>
                  </span>
                  <span className="shrink-0 tabular-nums">
                    <Price item={it} />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </aside>
      </main>
    </div>
  );
}
