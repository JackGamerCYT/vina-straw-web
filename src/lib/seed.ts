import type { Post, Product, Settings } from "./types";

type SeedProduct = Omit<Product, "id">;

/** Sản phẩm có ảnh chụp thật; được thêm vào database đang chạy qua migration trong db.ts. */
export const REAL_SLUGS = ["tui-giay-rom", "tam-lot-rom"];

export const SEED_PRODUCTS: SeedProduct[] = [
  {
    slug: "tui-giay-rom",
    name: "Túi giấy rơm",
    line: "RơmFlex-Pack",
    short: "Túi làm từ xơ rơm rạ, màu trắng ngà còn thấy sợi rơm, quai dây thừng và tem logo tròn.",
    description:
      "Mẫu túi thật đầu tiên của nhóm Vina-Straw, làm từ bột xơ rơm rạ. Bề mặt giữ lại sợi rơm tự nhiên nên mỗi chiếc có vân hơi khác nhau.\n\nHiện có hai kiểu: túi đứng có quai dây thừng và túi dẹt đục lỗ luồn dây. Kích thước, định lượng và giá đang được hoàn thiện. Gửi yêu cầu báo giá để nhận thông tin mới nhất và đặt mẫu thử.",
    price: 0,
    unit: "cái",
    moq: 1,
    specs: [
      { k: "Nguyên liệu", v: "Xơ rơm rạ" },
      { k: "Màu", v: "Trắng ngà, thấy sợi rơm" },
      { k: "Quai", v: "Dây thừng" },
      { k: "Kiểu", v: "Túi đứng có quai, túi dẹt đục lỗ" },
      { k: "Giai đoạn", v: "Mẫu thử" },
    ],
    images: ["/img/real/tui-giay-1.webp", "/img/real/tui-giay-2.webp", "/img/real/tui-giay-3.webp", "/img/real/tui-giay-4.webp"],
    featured: true,
    active: true,
    sort: -2,
    strawGrams: 30,
  },
  {
    slug: "tam-lot-rom",
    name: "Tấm lót rơm",
    line: "RơmCell-Cushion",
    short: "Tấm ép từ sợi rơm vàng nguyên màu, mép tự nhiên, gắn tem logo Vina-Straw.",
    description:
      "Tấm lót ép từ sợi rơm rạ, giữ màu vàng rơm tự nhiên. Có thể dùng để lót, chèn hàng trong hộp hoặc trang trí khi trưng bày sản phẩm.\n\nĐây là mẫu thử của nhóm. Kích thước, độ dày và giá đang được hoàn thiện. Gửi yêu cầu báo giá để nhận thông tin mới nhất.",
    price: 0,
    unit: "tấm",
    moq: 1,
    specs: [
      { k: "Nguyên liệu", v: "Sợi rơm rạ ép" },
      { k: "Màu", v: "Vàng rơm tự nhiên" },
      { k: "Hình dạng", v: "Tấm chữ nhật, mép tự nhiên" },
      { k: "Giai đoạn", v: "Mẫu thử" },
    ],
    images: ["/img/real/tam-lot-1.webp", "/img/real/tam-lot-2.webp", "/img/real/tam-lot-3.webp", "/img/real/tam-lot-4.webp"],
    featured: true,
    active: true,
    sort: -1,
    strawGrams: 80,
  },
  {
    slug: "to-rom-500ml",
    name: "Tô rơm 500 mL",
    line: "RơmDish",
    short: "Tô ép nóng từ xơ rơm, miệng Ø160, vành bo tròn chắc tay.",
    description:
      "Tô định hình từ xơ rơm rạ đã làm sạch, liên kết bằng hồ tinh bột và ép nóng trong khuôn kim loại. Mặt trong được tráng hai lớp sinh học VinaPack (pectin – sáp thực vật) để hạn chế thấm dầu và nước trong thời gian dùng bữa.\n\nPhù hợp cho quán bún, phở, cơm hộp và suất ăn văn phòng. Kích thước theo bản vẽ VS-DISH-201.",
    price: 2500,
    unit: "cái",
    moq: 1000,
    specs: [
      { k: "Dung tích", v: "500 mL" },
      { k: "Miệng ngoài", v: "Ø160 mm" },
      { k: "Chiều cao", v: "60 mm" },
      { k: "Thành / đáy", v: "2,2 / 2,8 mm" },
      { k: "Lớp phủ", v: "VinaPack hai lớp, mặt trong" },
    ],
    images: ["/renders/bowl.webp"],
    featured: true,
    active: true,
    sort: 1,
    strawGrams: 12,
  },
  {
    slug: "ly-rom-250ml",
    name: "Ly rơm 250 mL",
    line: "RơmDish",
    short: "Ly miệng Ø82, cao 88 mm, lòng ly tráng lớp cản nước.",
    description:
      "Ly đúc từ bột xơ rơm, mép cuộn tròn để môi chạm êm. Lòng ly có lớp màng VinaPack giúp giữ nước uống lạnh trong suốt thời gian phục vụ. Dùng cho trà, nước ép, cà phê đá tại quán và sự kiện.",
    price: 1800,
    unit: "cái",
    moq: 1000,
    specs: [
      { k: "Dung tích danh nghĩa", v: "250 mL" },
      { k: "Miệng / đáy", v: "Ø82 / Ø58 mm" },
      { k: "Chiều cao", v: "88 mm" },
      { k: "Thành / đáy", v: "2,0 / 2,5 mm" },
    ],
    images: ["/renders/cup.webp"],
    featured: true,
    active: true,
    sort: 2,
    strawGrams: 6,
  },
  {
    slug: "chen-rom-250ml",
    name: "Chén rơm 250 mL",
    line: "RơmDish",
    short: "Chén có chân đỡ Ø56, xếp chồng gọn, dùng cho canh và chè.",
    description:
      "Chén có vòng chân đỡ giúp đứng vững trên khay, thành cong vừa tay cầm. Thiết kế xếp chồng để tiết kiệm chỗ khi vận chuyển và lưu kho.",
    price: 1900,
    unit: "cái",
    moq: 1000,
    specs: [
      { k: "Dung tích", v: "250 mL" },
      { k: "Miệng ngoài", v: "Ø120 mm" },
      { k: "Chiều cao", v: "55 mm" },
      { k: "Chân đỡ", v: "Ø56 mm" },
    ],
    images: ["/renders/chen.webp"],
    featured: false,
    active: true,
    sort: 3,
    strawGrams: 7,
  },
  {
    slug: "dia-rom-220",
    name: "Dĩa rơm Ø220",
    line: "RơmDish",
    short: "Dĩa vành rộng 30 mm, lòng phẳng Ø130 cho cơm và món khô.",
    description:
      "Dĩa ép nóng một lần, bề mặt mịn, vành rộng giúp cầm chắc khi bưng. Khe thoát khí của khuôn đặt ngoài vùng tiếp xúc thức ăn để mặt dĩa không bị in dấu.",
    price: 2200,
    unit: "cái",
    moq: 1000,
    specs: [
      { k: "Đường kính", v: "Ø220 mm" },
      { k: "Chiều cao", v: "22 mm" },
      { k: "Lòng dĩa", v: "Ø130 mm" },
      { k: "Độ dày", v: "1,8 – 2,2 mm" },
    ],
    images: ["/renders/plate.webp"],
    featured: true,
    active: true,
    sort: 4,
    strawGrams: 14,
  },
  {
    slug: "tui-flex-pack",
    name: "Túi đáy hộp RơmFlex-Pack",
    line: "RơmFlex-Pack",
    short: "Túi gấp từ tấm xơ thực vật, mặt 250×350, hông mở 60 mm.",
    description:
      "Túi đáy hộp gấp từ tấm xơ rơm – bã mía dày 0,6–1,0 mm, dán mép bằng hồ liên kết gốc tinh bột. Mặt trong có thể tráng VinaPack theo yêu cầu cho thực phẩm khô, bánh mì và đồ mang đi.\n\nIn logo một màu bằng mực gốc nước theo đơn hàng.",
    price: 3500,
    unit: "cái",
    moq: 2000,
    specs: [
      { k: "Mặt túi", v: "250 × 350 mm" },
      { k: "Hông mở", v: "60 mm (2 × 30)" },
      { k: "Nẹp miệng", v: "25 mm" },
      { k: "Tấm nền", v: "0,6 – 1,0 mm" },
    ],
    images: ["/renders/bag.webp"],
    featured: true,
    active: true,
    sort: 5,
    strawGrams: 25,
  },
  {
    slug: "dem-romcell-cushion",
    name: "Đệm bảo vệ RơmCell",
    line: "RơmCell-Cushion",
    short: "Vỏ hai nửa có gân giảm chấn, ôm chai lọ trong thùng vận chuyển.",
    description:
      "Bộ đệm gồm vỏ rơm – bã mía định hình và lõi gân xơ rơm – xơ dừa, nén có kiểm soát để giảm va đập truyền vào hàng. Kèm khoang rời chứa túi zeolite điều hoà ẩm, tháo thay được.\n\nDùng cho chai thuỷ tinh rỗng, lọ mỹ phẩm, đồ gốm nhỏ. Không dùng tiếp xúc trực tiếp thực phẩm.",
    price: 6500,
    unit: "bộ",
    moq: 500,
    specs: [
      { k: "Khoang chai", v: "Ø96 × 170 mm (mẫu)" },
      { k: "Vỏ", v: "Rơm – bã mía, dày 3 mm" },
      { k: "Gân đệm", v: "4 – 6 gân, cao 6 – 10 mm" },
      { k: "Phụ kiện", v: "Túi zeolite 60 × 40 × 8 mm" },
    ],
    images: ["/renders/cushion.webp"],
    featured: false,
    active: true,
    sort: 6,
    strawGrams: 40,
  },
  {
    slug: "cuon-mang-biofilm",
    name: "Cuộn màng RơmBioFilm",
    line: "RơmBioFilm",
    short: "Màng đúc từ tinh bột và vi xơ thực vật, khổ 300 mm.",
    description:
      "Màng một lớp đúc từ tinh bột, glycerol và vi xơ rơm, sấy trên băng tải rồi cuộn lên lõi giấy. Dùng để lót, bọc rau củ khô và gói quà. Độ dày và khổ màng điều chỉnh theo đơn.",
    price: 180000,
    unit: "cuộn",
    moq: 20,
    specs: [
      { k: "Khổ hữu dụng", v: "300 mm" },
      { k: "Độ dày khô", v: "0,20 – 0,30 mm" },
      { k: "Lõi cuộn", v: "ID 76 mm" },
      { k: "Đường kính cuộn", v: "≤ 180 mm" },
    ],
    images: ["/renders/film.webp"],
    featured: false,
    active: true,
    sort: 7,
    strawGrams: 200,
  },
  {
    slug: "tam-romtherm-mineral",
    name: "Tấm cách nhiệt RơmTherm",
    line: "RơmTherm-Mineral",
    short: "Tấm 600 × 1200 × 50, lõi rơm – xơ dừa – perlite, mép âm dương.",
    description:
      "Tấm panel lõi rơm, xơ dừa và perlite, hai mặt phủ lớp khoáng mỏng khoảng 2 mm. Mép âm dương giúp ghép kín khe. Dùng làm vách lót cách nhiệt cho nhà kho, chuồng trại, ki-ốt. Không dùng làm cấu kiện chịu lực.",
    price: 145000,
    unit: "tấm",
    moq: 50,
    specs: [
      { k: "Kích thước", v: "600 × 1200 × 50 mm" },
      { k: "Lõi", v: "Rơm + xơ dừa + perlite, 46 mm" },
      { k: "Mặt", v: "Khoáng ~2 mm mỗi phía" },
      { k: "Mép ghép", v: "Âm dương 19 mm" },
    ],
    images: ["/renders/panel.webp"],
    featured: false,
    active: true,
    sort: 8,
    strawGrams: 2000,
  },
];

export const DEFAULT_SETTINGS: Settings = {
  heroTitle: "Rơm sau mùa gặt, thành bao bì cho bữa ăn mỗi ngày",
  heroLead:
    "Vina-Straw ép xơ rơm rạ thành tô, ly, dĩa, túi và đệm bảo vệ. Ít nhựa hơn trên bàn ăn, ít khói đốt đồng hơn sau mỗi vụ lúa.",
  heroVideo: "/video/hero.mp4",
  heroPoster: "/video/hero-poster.jpg",
  aboutTitle: "Một dự án sinh viên, bắt đầu từ cánh đồng",
  aboutBody:
    "Vina-Straw là dự án nghiên cứu của nhóm sinh viên kỹ thuật tại TP. Hồ Chí Minh. Chúng tôi phát triển hệ sinh thái bao bì từ phụ phẩm lúa gạo: từ khâu làm sạch, mở xơ, phối liệu đến ép khuôn và tráng phủ sinh học. Mọi sản phẩm hiện ở giai đoạn mẫu thử và đang được kiểm nghiệm trước khi thương mại hoá.",
  contactEmail: "vinapackvietnam@gmail.com",
  contactPhone: "0931920637",
  contactAddress: "Thủ Đức, TP. Hồ Chí Minh",
  team: "Nhóm Vina-Straw",
};

/** Bài viết mẫu, nạp một lần (migration). Chủ trang sửa hoặc xoá ở /admin/tin-tuc. */
export const SEED_POSTS: Omit<Post, "id" | "createdAt" | "updatedAt">[] = [
  {
    slug: "mau-tui-giay-va-tam-lot-rom-dau-tien",
    title: "Vina-Straw hoàn thành mẫu túi giấy rơm và tấm lót rơm đầu tiên",
    excerpt: "Sau nhiều lần thử phối liệu, nhóm đã làm ra hai mẫu thật: túi giấy từ xơ rơm có quai dây thừng và tấm lót ép từ sợi rơm vàng.",
    cover: "/img/real/bo-san-pham.webp",
    published: true,
    body: `Hai sản phẩm đầu tiên nhóm Vina-Straw làm ra bằng tay là túi giấy rơm và tấm lót rơm. Cả hai đều dùng rơm rạ sau thu hoạch làm nguyên liệu chính.

## Túi giấy rơm

Túi được làm từ bột xơ rơm, giữ màu trắng ngà tự nhiên. Nhìn gần vẫn thấy những sợi rơm nhỏ trên bề mặt, nên mỗi chiếc có vân hơi khác nhau. Hiện có hai kiểu: túi đứng có quai dây thừng và túi dẹt đục lỗ luồn dây.

## Tấm lót rơm

Tấm lót được ép từ sợi rơm vàng, giữ nguyên màu rơm và gắn tem logo tròn Vina-Straw. Tấm lót dùng để lót, chèn hàng trong hộp hoặc trang trí khi trưng bày.

## Bước tiếp theo

Kích thước, định lượng và giá của hai mẫu đang được hoàn thiện. Các tính năng như kháng nước hay phân huỷ sinh học sẽ chỉ được công bố sau khi có kết quả kiểm nghiệm. Nếu bạn muốn nhận mẫu thử, hãy gửi yêu cầu ở trang Nhận báo giá.`,
  },
  {
    slug: "vi-sao-khong-nen-dot-rom-ra",
    title: "Mỗi năm Việt Nam có bao nhiêu rơm rạ, và vì sao không nên đốt?",
    excerpt: "Sau mỗi vụ lúa, đồng ruộng để lại một lượng rơm rất lớn. Phần lớn bị đốt ngay tại ruộng, vừa gây khói bụi vừa bỏ phí một nguồn xơ thực vật.",
    cover: "/img/field-burnt.webp",
    published: true,
    body: `Theo Báo Nhân Dân (2025) dẫn số liệu ngành nông nghiệp, mỗi năm Việt Nam có khoảng 47 triệu tấn rơm rạ. Viện Nghiên cứu Lúa Quốc tế (IRRI) ước tính trên 20 triệu tấn trong số đó bị đốt bỏ.

## Đốt rơm gây hại gì?

Đốt rơm tạo khói và bụi mịn, ảnh hưởng tới người dân sống gần ruộng và cả các tuyến đường đi qua. Lửa cũng làm mất phần chất hữu cơ mà rơm có thể trả lại cho đất.

## Rơm có thể làm gì khác?

Rơm là nguồn xơ thực vật sẵn có, giá rẻ và có lại sau mỗi vụ. Ngoài làm nấm, ủ phân hay thức ăn gia súc, rơm có thể trở thành nguyên liệu cho bao bì. Đây là hướng Vina-Straw đang thử: giữ lại sợi rơm, làm sạch, phối với các thành phần gốc thực vật rồi ép thành túi, tấm lót, tô và ly.

## Nguồn

Báo Nhân Dân (2025); Viện Nghiên cứu Lúa Quốc tế (IRRI).`,
  },
  {
    slug: "tu-bo-rom-den-bao-bi-5-cong-doan",
    title: "Từ bó rơm đến bao bì: 5 công đoạn của Vina-Straw",
    excerpt: "Thu gom, làm sạch và mở xơ, phối liệu, ép khuôn, rồi kiểm tra. Mỗi công đoạn đều ghi thông số để mẫu sau giống mẫu trước.",
    cover: "/img/real/soi-rom.webp",
    published: true,
    body: `Một chiếc túi hay tấm lót Vina-Straw đi qua năm công đoạn.

## 1. Thu gom rơm sau vụ gặt

Rơm khô, không mốc, được gom ngay trên ruộng thay vì đốt. Mỗi lô ghi nguồn, ngày thu và độ ẩm.

## 2. Làm sạch và mở xơ

Rơm được rửa bỏ đất cát, cắt ngắn, đánh tơi rồi rây để tách phần sợi mịn và bó sợi dài.

## 3. Phối liệu gốc thực vật

Xơ rơm được trộn với bột giấy carton sạch, hồ tinh bột sắn và alginate. Nhóm không dùng keo nhựa tổng hợp.

## 4. Ép khuôn và sấy

Hỗn hợp được tạo hình trên khuôn, ép rồi sấy đến khi khối lượng ổn định.

## 5. Kiểm tra

Mỗi mẻ được kiểm tra hình dạng, độ chắc và các lỗi bề mặt. Những chỉ tiêu như kháng nước sẽ chỉ công bố sau khi có kết quả kiểm nghiệm của bên thứ ba.`,
  },
];
