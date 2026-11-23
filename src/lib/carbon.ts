/**
 * Ước tính lượng khí nhà kính tránh được khi rơm được dùng làm bao bì thay vì bị đốt ngoài đồng.
 *
 * - Hệ số đốt rơm (rơm khô, ẩm 10%): 4,51 g CH4 và 0,069 g N2O trên 1 kg rơm.
 *   Romasanta và cộng sự (2017), thí nghiệm buồng đốt; dải 0,7–4,51 g CH4 và 0,019–0,069 g N2O được nêu lại
 *   trong Sci. Rep. 9:17018 (2019). Ở đây lấy cận trên của dải đo.
 * - Tiềm năng nóng lên toàn cầu 100 năm (IPCC AR5): CH4 = 28, N2O = 265.
 * - CO2 từ đốt rơm không tính vì được coi là trung hoà (IPCC 2006).
 *
 * Đây là con số ước tính để khách hàng hình dung, KHÔNG phải tín chỉ carbon đã được chứng nhận.
 * 1 tín chỉ carbon = 1 tấn CO2e.
 */
export const EF_CH4 = 4.51; // g CH4 / kg rơm
export const EF_N2O = 0.069; // g N2O / kg rơm
export const GWP_CH4 = 28;
export const GWP_N2O = 265;
/** g CO2e tránh được trên mỗi gam rơm (= kg CO2e trên mỗi kg rơm) */
export const CO2E_PER_G = (EF_CH4 * GWP_CH4 + EF_N2O * GWP_N2O) / 1000;

export type Carbon = { strawG: number; co2eG: number; credits: number };
export const carbonOf = (strawG: number): Carbon => {
  const co2eG = strawG * CO2E_PER_G;
  return { strawG, co2eG, credits: co2eG / 1_000_000 };
};
export const sumCarbon = (items: { qty: number; straw?: number }[]) => carbonOf(items.reduce((t, i) => t + i.qty * (i.straw ?? 0), 0));

const nf = (n: number, d = 1) => n.toLocaleString("vi-VN", { maximumFractionDigits: d });
/** 850 g · 1,2 kg · 3,4 tấn */
export const fmtMass = (g: number) => (g >= 1_000_000 ? `${nf(g / 1_000_000, 2)} tấn` : g >= 1000 ? `${nf(g / 1000, g >= 100_000 ? 0 : 1)} kg` : `${nf(g, 0)} g`);
/** Số tín chỉ, giữ 3 chữ số có nghĩa cho số rất nhỏ. */
export const fmtCredits = (c: number) => (c === 0 ? "0" : c >= 0.01 ? nf(c, 3) : c.toLocaleString("vi-VN", { maximumSignificantDigits: 3 }));
/** Cần bao nhiêu sản phẩm như vậy để đủ 1 tín chỉ */
export const unitsPerCredit = (strawG: number) => (strawG > 0 ? Math.ceil(1_000_000 / (strawG * CO2E_PER_G)) : 0);
