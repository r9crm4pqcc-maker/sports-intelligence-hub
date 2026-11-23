// ─── Sports / streetwear brand founding dates (full month + day + year) ──────
export interface BrandEntry {
  name: string;
  founded: { year: number; month: number; day: number };
}

export const BRAND_FOUNDINGS: Record<string, BrandEntry> = {
  nike: { name: "Nike", founded: { year: 1964, month: 1, day: 25 } },
  adidas: { name: "Adidas", founded: { year: 1949, month: 8, day: 18 } },
  jordan: { name: "Air Jordan", founded: { year: 1985, month: 4, day: 1 } },
  "jordan brand": { name: "Air Jordan", founded: { year: 1985, month: 4, day: 1 } },
  "air jordan": { name: "Air Jordan", founded: { year: 1985, month: 4, day: 1 } },
  puma: { name: "Puma", founded: { year: 1948, month: 10, day: 1 } },
  "new balance": { name: "New Balance", founded: { year: 1906, month: 4, day: 5 } },
  "under armour": { name: "Under Armour", founded: { year: 1996, month: 9, day: 25 } },
  reebok: { name: "Reebok", founded: { year: 1958, month: 8, day: 19 } },
  mizuno: { name: "Mizuno", founded: { year: 1906, month: 4, day: 1 } },
  asics: { name: "ASICS", founded: { year: 1977, month: 7, day: 21 } },
  umbro: { name: "Umbro", founded: { year: 1924, month: 5, day: 23 } },
  diadora: { name: "Diadora", founded: { year: 1948, month: 9, day: 1 } },
  supreme: { name: "Supreme", founded: { year: 1994, month: 4, day: 20 } },
  bape: { name: "A Bathing Ape", founded: { year: 1993, month: 4, day: 1 } },
  "a bathing ape": { name: "A Bathing Ape", founded: { year: 1993, month: 4, day: 1 } },
  "bathing ape": { name: "A Bathing Ape", founded: { year: 1993, month: 4, day: 1 } },
};

export function brandDecode(brandName: string) {
  const key = brandName.trim().toLowerCase();
  const brand = BRAND_FOUNDINGS[key];
  if (!brand) return null;
  const { year, month, day } = brand.founded;
  return {
    name: brand.name,
    foundedLabel: `${month}/${day}/${year}`,
    year, month, day,
  };
}
