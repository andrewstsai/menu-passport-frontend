import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowUp, X } from "lucide-react";
import { MenuData, MenuItem } from "@/types/menu";
import { formatAmount, formatPrice } from "@/lib/passport";
import { plate } from "@/demo";

interface MenuDisplayProps {
  menuData: MenuData;
  imageUrl: string;
  onBack: () => void;
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const emptyPlate = plate();

const MAX_ZOOM = 5;

function useZoom() {
  const frame = useRef<HTMLElement>(null);
  const content = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = frame.current!;
    const inner = content.current!;
    let s = 1, x = 0, y = 0;
    let moved = false;
    const pointers = new Map<number, { x: number; y: number }>();

    const local = (e: { clientX: number; clientY: number }) => {
      const r = el.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    const apply = (factor: number, px: number, py: number, dx = 0, dy = 0) => {
      const next = Math.min(MAX_ZOOM, Math.max(1, s * factor));
      x = Math.min(0, Math.max(el.clientWidth * (1 - next), px - (px - x) * (next / s) + dx));
      y = Math.min(0, Math.max(el.clientHeight * (1 - next), py - (py - y) * (next / s) + dy));
      s = next;
      inner.style.transform = `translate(${x}px, ${y}px) scale(${s})`;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaMode ? e.deltaY * 16 : e.deltaY;
      const p = local(e);
      apply(Math.exp(e.ctrlKey ? -delta * 0.01 : delta * 0.002), p.x, p.y);
    };

    const onDown = (e: PointerEvent) => {
      if (!pointers.size) moved = false;
      pointers.set(e.pointerId, local(e));
    };

    const onMove = (e: PointerEvent) => {
      const prev = pointers.get(e.pointerId);
      if (!prev) return;
      const [a0, b0] = [...pointers.values()];
      const p = local(e);
      pointers.set(e.pointerId, p);
      const [a1, b1] = [...pointers.values()];
      if (!moved && Math.hypot(p.x - prev.x, p.y - prev.y) > 3) {
        moved = true;
        el.setPointerCapture(e.pointerId);
      }
      if (!b0) return apply(1, 0, 0, a1.x - a0.x, a1.y - a0.y);
      const mid0 = { x: (a0.x + b0.x) / 2, y: (a0.y + b0.y) / 2 };
      const factor = Math.hypot(a1.x - b1.x, a1.y - b1.y) / (Math.hypot(a0.x - b0.x, a0.y - b0.y) || 1);
      apply(factor, mid0.x, mid0.y, (a1.x + b1.x) / 2 - mid0.x, (a1.y + b1.y) / 2 - mid0.y);
    };

    const onUp = (e: PointerEvent) => pointers.delete(e.pointerId);

    const onClick = (e: MouseEvent) => {
      if (moved) e.stopPropagation();
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("click", onClick, true);
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("click", onClick, true);
    };
  }, []);

  return { frame, content };
}

function Prices({ item, fractionDigits, printedClassName }: {
  item: MenuItem;
  fractionDigits: number;
  printedClassName: string;
}) {
  const printed = item.original_price == null ? null : formatAmount(item.original_price, fractionDigits);
  if (item.converted_price == null || !item.currency) return <>{printed}</>;
  return (
    <>
      {formatPrice(item.converted_price, item.currency)}
      {printed && <span className={printedClassName}>{printed}</span>}
    </>
  );
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
  const count = `${items.length} ${items.length === 1 ? "dish" : "dishes"}`;
  const fractionDigits = items.some((it) => it.original_price != null && !Number.isInteger(it.original_price)) ? 2 : 0;
  const countClass = "text-sm uppercase tracking-[0.2em] text-pencil";
  const zoom = useZoom();

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
    <div className="h-dvh bg-passport bg-[linear-gradient(rgb(0_0_0/0.35),rgb(0_0_0/0.35))] p-edge">
      <div className="relative flex h-full flex-col overflow-hidden rounded-xl shadow-[0_30px_80px_rgb(0_0_0/0.5)]">
      <main className="grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)_minmax(0,1fr)] lg:grid-cols-2 lg:grid-rows-[minmax(0,1fr)]">
        <div className="relative flex items-center justify-center rounded-t-xl bg-paper px-4 pb-4 pt-14 [view-transition-name:verso] lg:rounded-l-xl lg:rounded-tr-none lg:px-10 lg:pb-8 lg:pt-16">
        <header className="absolute inset-x-0 top-0 z-10 flex h-14 items-center justify-between px-4 lg:px-10">
          <a
            href={location.pathname}
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
              e.preventDefault();
              onBack();
            }}
            className="group -m-2 flex items-center gap-1.5 rounded-sm p-2 text-sm uppercase tracking-[0.14em] text-passport focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-passport"
          >
            <ArrowUp aria-hidden className="h-4 w-4 lg:hidden" />
            <ArrowLeft aria-hidden className="hidden h-4 w-4 lg:block" />
            <span className="-mr-[0.14em] underline-offset-4 [text-box:trim-both_cap_alphabetic] group-hover:underline">New menu</span>
          </a>
          <h1 className={`${countClass} lg:hidden`}>{count}</h1>
        </header>
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-black/15 lg:inset-y-0 lg:left-auto lg:right-0 lg:h-auto lg:w-8 lg:bg-gradient-to-l" />
        <figure ref={zoom.frame} className="relative mx-auto w-fit max-w-full touch-none select-none overflow-hidden rounded-md">
          <div ref={zoom.content} className="relative origin-top-left">
          <img src={imageUrl} alt="Photo of the menu" draggable={false} className="block h-auto max-h-[calc((100dvh-1.5rem)/2-4.5rem)] max-w-full rounded-md lg:max-h-[calc(100dvh-9rem)]" />
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
          </div>
        </figure>
        </div>

        <aside className="relative flex min-h-0 flex-col rounded-b-xl bg-paper p-4 [view-transition-name:recto] lg:rounded-r-xl lg:rounded-bl-none lg:px-[max(2.5rem,calc(50%-20rem))] lg:pb-8 lg:pt-16">
          <h1 className={`absolute right-10 top-0 hidden h-14 items-center lg:flex ${countClass}`}>{count}</h1>
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-black/15 lg:inset-y-0 lg:right-auto lg:h-auto lg:w-8 lg:bg-gradient-to-r" />
          <section
            className={`fixed left-[max(0.75rem,env(safe-area-inset-left))] right-[max(0.75rem,env(safe-area-inset-right))] z-20 rounded-lg border shadow-[0_8px_24px_hsl(var(--ink)/0.12)] ${sheetAtTop ? "top-[4.25rem] max-h-[calc(50dvh-5rem)]" : "bottom-[max(0.75rem,env(safe-area-inset-bottom))] max-h-[45dvh]"} ${item?.image_url ? "grid-cols-[9rem_minmax(0,1fr)]" : ""} ${item ? "grid" : "hidden lg:grid"} gap-4 overflow-y-auto scrollbar-thin bg-paper p-4 lg:static lg:mb-6 lg:shrink-0 lg:grid-cols-[12rem_minmax(0,1fr)] lg:rounded-lg lg:border lg:shadow-none`}
          >
            {item?.image_url ? (
              <img
                src={item.image_url}
                alt=""
                className="aspect-square w-full rounded-md object-cover lg:aspect-[4/3]"
              />
            ) : (
              <img src={emptyPlate} alt="" className="hidden aspect-[4/3] w-full rounded-md object-cover lg:block" />
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
                      className="-m-2 rounded-full p-3 text-pencil hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-passport lg:hidden"
                    >
                      <X className="h-5 w-5" />
                      <span className="sr-only">Close</span>
                    </button>
                  </div>
                  <p className="text-pencil lg:truncate">{item.name}</p>
                  <p className="mt-2 text-lg font-semibold tabular-nums">
                    <Prices item={item} fractionDigits={fractionDigits} printedClassName="ml-2 text-base font-normal text-pencil" />
                  </p>
                </>
              ) : (
                <p className="text-pencil">Hover over or click a dish on the menu photo or in the list to see it here. Scroll or pinch over the photo to zoom, and drag to move around.</p>
              )}
            </div>
          </section>

          <h2 className="sr-only">Dishes</h2>
          <p className="mb-3 text-sm text-pencil lg:hidden">Tap a dish on the menu photo or in the list to see it.<br />Pinch the photo to zoom.</p>
          <ul className="divide-y border-y min-h-0 overflow-y-auto overscroll-contain scrollbar-thin">
            {items.map((it, i) => (
              <li key={i}>
                <button
                  type="button"
                  aria-pressed={i === selected}
                  {...previewProps(i, true)}
                  onFocus={() => hover(i, true)}
                  onBlur={() => setHovered(null)}
                  className={`flex w-full items-baseline justify-between gap-4 px-2 py-3 text-left hover:bg-rule/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-passport ${i === selected ? "bg-highlighter/40 hover:bg-highlighter/40" : ""}`}
                >
                  <span className="min-w-0">
                    <span className="block font-semibold">{capitalize(it.translated_name)}</span>
                    <span className="block text-sm text-pencil">{it.name}</span>
                  </span>
                  <span className="shrink-0 text-right tabular-nums">
                    <Prices item={it} fractionDigits={fractionDigits} printedClassName="block text-sm text-pencil" />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </aside>
      </main>
      </div>
    </div>
  );
}
