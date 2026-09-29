import { useState } from "react";
import MenuUpload from "@/components/MenuUpload";
import MenuDisplay from "@/components/MenuDisplay";
import { MenuData } from "@/types/menu";
import { loadDemo } from "@/demo";

const demo = new URLSearchParams(location.search).has("demo") ? loadDemo() : null;

const Index = () => {
  const [menuData, setMenuData] = useState<MenuData | null>(demo?.menuData ?? null);
  const [imageUrl, setImageUrl] = useState<string>(demo?.imageUrl ?? "");

  const handleMenuProcessed = (data: MenuData, url: string) => {
    setMenuData(data);
    setImageUrl(url);
  };

  const handleBack = () => {
    setMenuData(null);
    setImageUrl("");
  };

  return !menuData ? (
    <MenuUpload onMenuProcessed={handleMenuProcessed} />
  ) : (
    <MenuDisplay menuData={menuData} imageUrl={imageUrl} onBack={handleBack} />
  );
};

export default Index;
