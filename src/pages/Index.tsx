import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import MenuUpload from "@/components/MenuUpload";
import MenuDisplay from "@/components/MenuDisplay";
import { MenuData } from "@/types/menu";
import { loadDemo } from "@/demo";

type Menu = { menuData: MenuData; imageUrl: string };

const demo = new URLSearchParams(location.search).has("demo") ? loadDemo() : null;
if (demo) history.replaceState({ menu: true }, "");

const turnPage = (direction: "forward" | "back", update: () => void) => {
  if (!document.startViewTransition || matchMedia("(prefers-reduced-motion: reduce)").matches) return update();
  document.documentElement.dataset.turn = direction;
  document.startViewTransition(() => flushSync(update));
};

const Index = () => {
  const [menu, setMenu] = useState<Menu | null>(demo);
  const lastMenu = useRef(menu);

  useEffect(() => {
    const onPopState = (e: PopStateEvent) => {
      const next = e.state?.menu ? lastMenu.current : null;
      if (!next === !menu) return;
      turnPage(next ? "forward" : "back", () => setMenu(next));
    };
    addEventListener("popstate", onPopState);
    return () => removeEventListener("popstate", onPopState);
  }, [menu]);

  const handleMenuProcessed = (menuData: MenuData, imageUrl: string, href = location.pathname) => {
    lastMenu.current = { menuData, imageUrl };
    history.pushState({ menu: true, fromUpload: true }, "", href);
    turnPage("forward", () => setMenu(lastMenu.current));
  };

  const handleBack = () => {
    if (history.state?.fromUpload) return history.back();
    history.pushState(null, "", location.pathname);
    turnPage("back", () => setMenu(null));
  };

  return !menu ? (
    <MenuUpload onMenuProcessed={handleMenuProcessed} />
  ) : (
    <MenuDisplay menuData={menu.menuData} imageUrl={menu.imageUrl} onBack={handleBack} />
  );
};

export default Index;
