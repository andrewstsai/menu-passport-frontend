import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MenuData } from "@/types/menu";

interface MenuDisplayProps {
  menuData: MenuData;
  imageUrl: string;
  onBack: () => void;
}

export default function MenuDisplay({ menuData, imageUrl, onBack }: MenuDisplayProps) {
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>
        <div className="text-sm text-muted-foreground">
          {menuData.menu_items.length} items found
        </div>
      </div>

      <Card className="relative overflow-hidden shadow-[var(--shadow-elegant) flex justify-center]">
        <div className="relative inline-block mx-auto">
          <img
            src={imageUrl}
            alt="Menu"
            className="w-full h-auto max-h-[80vh]"
          />
          
          {menuData.menu_items.map((item, index) => {
            const { left, top, width, height } = item.bounding_box;
            
            return (
              <Popover key={index} open={hoveredItem === index}>
                <PopoverTrigger asChild>
                  <div
                    className="absolute cursor-pointer transition-all"
                    style={{
                      left: `${left * 100}%`,
                      top: `${top * 100}%`,
                      width: `${width * 100}%`,
                      height: `${height * 100}%`,
                      border: hoveredItem === index ? '3px solid hsl(var(--primary))' : '2px solid transparent',
                      backgroundColor: hoveredItem === index ? 'hsl(var(--primary) / 0.1)' : 'transparent',
                      borderRadius: '6px',
                      boxShadow: hoveredItem === index ? 'var(--shadow-elegant)' : 'none',
                    }}
                    onMouseEnter={() => setHoveredItem(index)}
                    onMouseLeave={() => setHoveredItem(null)}
                  />
                </PopoverTrigger>
                <PopoverContent
                  className="w-80 p-0 overflow-hidden shadow-[var(--shadow-elegant)]"
                  side="right"
                  align="start"
                >
                  {item.image_url && (
                    <div className="relative h-48 w-full overflow-hidden">
                      <img
                        src={item.image_url}
                        alt={item.translated_name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                  )}
                  <div className="p-4 space-y-2">
                    <h3 className="font-bold text-lg">{item.translated_name.charAt(0).toUpperCase() + item.translated_name.slice(1)}</h3>
                    <p className="text-sm text-muted-foreground">{item.name}</p>
                    {item.converted_price && item.currency && (
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-primary">
                          {item.converted_price.toFixed(2)}
                        </span>
                        <span className="text-sm font-medium text-muted-foreground">
                          {item.currency}
                        </span>
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
