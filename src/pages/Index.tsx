import { useState } from "react";
import MenuUpload from "@/components/MenuUpload";
import MenuDisplay from "@/components/MenuDisplay";
import { MenuData } from "@/types/menu";

const Index = () => {
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");

  const handleMenuProcessed = (data: MenuData, url: string) => {
    setMenuData(data);
    setImageUrl(url);
  };

  const handleBack = () => {
    setMenuData(null);
    setImageUrl("");
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      {!menuData ? (
        <MenuUpload onMenuProcessed={handleMenuProcessed} />
      ) : (
        <MenuDisplay menuData={menuData} imageUrl={imageUrl} onBack={handleBack} />
      )}
    </div>
  );
};

export default Index;
