import { MenuData } from "@/types/menu";

const W = 600;
const H = 800;

const dishes = [
  { name: "Χωριάτικη σαλάτα", en: "greek salad", eur: 9.5, color: "#7BA05B" },
  { name: "Τζατζίκι", en: "tzatziki", eur: 5, color: "#E8E4D8" },
  { name: "Καλαμαράκια τηγανητά", en: "fried calamari", eur: 11, color: "#D9A95B" },
  { name: "Σπανακόπιτα", en: "spinach pie", eur: 7.5, color: "#C98F3E" },
  { name: "Μουσακάς", en: "moussaka", eur: 13.5, color: "#A5552E" },
  { name: "Σουβλάκι χοιρινό", en: "pork souvlaki", eur: 12, color: "#8C4A2F" },
  { name: "Χταπόδι στα κάρβουνα", en: "grilled octopus", eur: 18, color: "#9C3D4A" },
  { name: "Παστίτσιο", en: "pastitsio", eur: 12.5, color: "#C07A3A" },
];

const baselines = [220, 270, 320, 370, 490, 540, 590, 640];

const svg = (body: string, w: number, h: number) =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`,
  )}`;

const menuImage = () => svg(
  `<rect width="${W}" height="${H}" fill="#EFE6D2"/>
  <rect x="20" y="20" width="${W - 40}" height="${H - 40}" fill="none" stroke="#3B2A1E" stroke-width="2"/>
  <g font-family="Georgia, serif" fill="#3B2A1E">
    <text x="${W / 2}" y="95" font-size="38" text-anchor="middle">Ταβέρνα Το Κύμα</text>
    <text x="${W / 2}" y="165" font-size="26" text-anchor="middle" font-style="italic">Ορεκτικά</text>
    <text x="${W / 2}" y="435" font-size="26" text-anchor="middle" font-style="italic">Κυρίως πιάτα</text>
    ${dishes
      .map(
        (d, i) => `<text x="60" y="${baselines[i]}" font-size="23">${d.name}</text>
    <text x="540" y="${baselines[i]}" font-size="23" text-anchor="end">${d.eur.toFixed(2)} €</text>`,
      )
      .join("")}
    <text x="${W / 2}" y="730" font-size="16" text-anchor="middle">Καλή όρεξη</text>
  </g>`,
  W,
  H,
);

const plate = (color: string) =>
  svg(
    `<rect width="400" height="300" fill="#D8D2C4"/>
    <circle cx="200" cy="150" r="120" fill="#FAFAF7"/>
    <circle cx="200" cy="150" r="80" fill="${color}"/>`,
    400,
    300,
  );

export const loadDemo = (): { imageUrl: string; menuData: MenuData } => ({
  imageUrl: menuImage(),
  menuData: {
  menu_items: dishes.map((d, i) => ({
    name: d.name,
    translated_name: d.en,
    image_url: i === 1 ? "" : plate(d.color),
    bounding_box: { left: 50 / W, top: (baselines[i] - 28) / H, width: 500 / W, height: 38 / H },
    original_price: d.eur,
    converted_price: Math.round(d.eur * 1.08 * 100) / 100,
    currency: "USD",
  })),
  metadata: {
    original_language: "el",
    translated_to: "en",
    target_currency: "USD",
    processed_at: new Date().toISOString(),
    menu_id: 0,
  },
  },
});
