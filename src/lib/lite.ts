import type { Product } from "./types";
import type { Lite } from "@/components/checkout";
export const toLite = (p: Product): Lite => ({ id: p.id, slug: p.slug, name: p.name, price: p.price, unit: p.unit, moq: p.moq, image: p.images[0] ?? "", straw: p.strawGrams });
