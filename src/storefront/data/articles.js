/**
 * Bài viết có sẵn cho mục Tin tức & video (/tin-tuc, /trang/<slug>).
 * Mỗi bài: slug, news ("tin" | "huong-dan" | "video"), title, summary, cover, date, body (Markdown:
 * "## " tiêu đề, "- " gạch đầu dòng, **đậm**), products (slug sản phẩm, web tự hiện thẻ có giá đang bán),
 * cta { to, label }. Dùng chung cho web khách và máy chủ (SEO), không import gì khác.
 * Giá trong bài là giá tại thời điểm viết; thẻ sản phẩm luôn hiện giá mới nhất.
 */
const HH = { to: "/may-choi-game-cam-tay", label: "Xem các máy chơi game cầm tay" };

export const ARTICLES = [
  {
    slug: "top-5-ban-phim-co-duoi-1-5-trieu-cuoi-2026",
    points: [
      "Dưới 1,5 triệu đã có bàn phím không dây 3 chế độ, gasket, hotswap, pin 4.000 mAh",
      "VOICSKY PULSE 75 dễ chọn nhất, PULSE 96 cho người cần cụm phím số",
      "Switch TONE êm cho văn phòng, CLOUDY có khấc cho người gõ nhiều",
      "So với AKKO cùng layout: VOICSKY pin lớn hơn, giá thấp hơn",
    ],
    // So sánh trực quan: ảnh hai mẫu cùng layout đặt cạnh nhau.
    pairs: [
      {
        title: "Layout 75%: VOICSKY PULSE 75 và AKKO 5075B Plus",
        left: { name: "VOICSKY PULSE 75", img: "https://media.hilipc.vn/desc/mwix9l8i-4qlr4t7p.webp", slug: "ban-phim-co-khong-day-voicsky-pulse-75-glacier",
          specs: ["82 phím, núm xoay âm lượng", "Gasket, hotswap 5-pin", "Pin 4.000 mAh", "Khoảng 1,14 triệu tại Hilitek"] },
        right: { name: "AKKO 5075B Plus", img: "https://media.hilipc.vn/desc/akko-5075-1.webp", credit: "Ảnh: AKKO",
          specs: ["Layout 75%, núm xoay", "Gasket, hotswap 5-pin", "Pin 3.000 mAh", "Khoảng 1,29 triệu (cửa hàng khác)"] },
      },
      {
        title: "Layout 96%: VOICSKY PULSE 96 và AKKO 3098B Plus",
        left: { name: "VOICSKY PULSE 96", img: "https://media.hilipc.vn/desc/mwixm06m-1amgzdt8.webp", slug: "ban-phim-co-khong-day-voicsky-pulse-96-glacier",
          specs: ["97 phím, có cụm số", "Núm xoay âm lượng", "Pin 4.000 mAh", "Khoảng 1,28 triệu tại Hilitek"] },
        right: { name: "AKKO 3098B Plus", img: "https://media.hilipc.vn/desc/akko-3098-1.webp", credit: "Ảnh: AKKO",
          specs: ["Layout 96%, có cụm số", "Kết nối 3 chế độ, hotswap", "Pin 3.000 mAh", "Hilitek không bán"] },
      },
    ],
    table: {
      title: "So sánh nhanh 5 mẫu",
      head: ["Mẫu", "Layout", "Kết nối", "Điểm nổi bật"],
      rows: [
        ["VOICSKY PULSE 75", "75% (82 phím)", "3 chế độ", "Núm xoay, pin 4.000 mAh"],
        ["VOICSKY PULSE 96", "96% (97 phím)", "3 chế độ", "Có cụm phím số"],
        ["VOICSKY TUNE 65", "65% (68 phím)", "3 chế độ", "Màn hình PIXDOT 7×7"],
        ["VOICSKY ECHO 75", "75% (81 phím)", "3 chế độ", "Màn hình 1.14 inch"],
        ["Machenike K500B", "TKL (87 phím)", "Có dây", "Giá mềm, switch Red"],
      ],
    },
    news: "huong-dan",
    date: "2026-11-24",
    title: "Top 5 bàn phím cơ dưới 1,5 triệu đáng mua cuối 2026",
    summary: "Không dây ba chế độ, gasket, hotswap, pin 400 giờ: bốn mẫu VOICSKY, một mẫu Machenike, kèm so sánh với AKKO 5075B Plus và 3098B Plus.",
    cover: "https://media.hilipc.vn/desc/mwix9l8i-4qlr4t7p.webp",
    cta: { to: "/danh-muc?cat=B%C3%A0n%20ph%C3%ADm%20c%C6%A1", label: "Xem tất cả bàn phím cơ" },
    products: [
      "ban-phim-co-khong-day-voicsky-pulse-75-glacier",
      "ban-phim-co-khong-day-voicsky-pulse-96-glacier",
      "ban-phim-co-khong-day-voicsky-tune-65-black-pink",
      "ban-phim-co-khong-day-voicsky-echo-75-light-tactile",
      "ban-phim-machenike-k500b-b87-wired-red-switch-led-backlit-black",
    ],
    body: `Dưới 1,5 triệu đồng giờ đã mua được bàn phím cơ không dây có cấu trúc gasket, keycap PBT và pin dùng cả tháng. Dưới đây là 5 mẫu Hilitek đang có hàng, xếp theo giá.

## 1. VOICSKY PULSE 75: dễ chọn nhất
![VOICSKY PULSE 75](https://media.hilipc.vn/desc/mwix9l8i-4qlr4t7p.webp)
- 82 phím layout 75% Exploded, núm xoay chỉnh âm lượng, nhấn để tắt tiếng
- Gasket Mount và tiêu âm 5 lớp, gõ êm, ít tiếng rỗng
- Hai loại switch: **TONE Silent Linear** (êm, nhẹ) hoặc **CLOUDY Tactile** (có khấc)
- Hotswap 5-pin, keycap PBT Double-Shot, kết nối 3 chế độ (Bluetooth, 2.4G, dây)
- Pin 4.000 mAh, tới 400 giờ khi dùng Bluetooth và tắt đèn
**Hợp với ai:** người mới chơi phím cơ, dân văn phòng muốn bàn gọn mà vẫn đủ hàng phím F.

## 2. VOICSKY PULSE 96: đủ cụm số trong thân gọn
![VOICSKY PULSE 96](https://media.hilipc.vn/desc/mwixm06m-1amgzdt8.webp)
Cùng cấu trúc và pin với PULSE 75 nhưng có 97 phím layout 96%, giữ cụm phím số mà vẫn ngắn hơn bàn phím fullsize. **Hợp với ai:** kế toán, nhập liệu, người hay gõ số.

## 3. VOICSKY TUNE 65: nhỏ gọn, có màn hình điểm ảnh
![VOICSKY TUNE 65](https://media.hilipc.vn/desc/mwixt1hj-40licbxv.webp)
- 68 phím layout 65%, vỏ bán trong suốt
- Màn hình PIXDOT 7×7 với 49 đèn LED hiển thị hiệu ứng
- Switch TONE Silent Linear 43g, gasket mount, pin 4.000 mAh
**Hợp với ai:** bàn làm việc nhỏ, người thích phím có điểm nhấn.

## 4. VOICSKY ECHO 75: có màn hình thông tin
![VOICSKY ECHO 75](https://media.hilipc.vn/desc/mwixepd9-0pyuy7w3.webp)
- 81 phím layout 75%, màn hình Dynamic Screen 1.14 inch hiện giờ, ngày, pin
- Núm xoay đa năng, switch TONE hoặc CLOUDY, socket hotswap có RGB
**Hợp với ai:** người muốn bàn phím "có gì đó để nhìn" mà vẫn dưới 1,5 triệu.

## 5. Machenike K500B-B87: có dây, giá dễ tiếp cận
![Machenike K500B-B87](https://media.hilipc.vn/desc/mwnk4un8-dd3rg6ki.webp)
- 87 phím TKL, switch Red linear, hotswap 3-pin
- Keycap PBT Double-Shot, LED Rainbow 11 chế độ, chống ghosting toàn phím
**Hợp với ai:** game thủ chỉ cần phím có dây, ổn định, ngân sách thấp.

## Chọn TONE hay CLOUDY?
**TONE Silent Linear** nhẹ (43g) và êm, hợp phòng làm việc chung. **CLOUDY Tactile** có khấc rõ khi nhấn, hợp người gõ nhiều chữ. Ở trang từng mẫu VOICSKY có thẻ **nghe thử tiếng gõ** để bạn so sánh trước khi mua.

## VOICSKY hay AKKO?
AKKO là thương hiệu bàn phím cơ quen thuộc với game thủ Việt. Hai mẫu AKKO hay được nhắc tới trong tầm giá này là **AKKO 5075B Plus** (75%) và **AKKO 3098B Plus** (96%). Đặt cạnh hai mẫu VOICSKY cùng layout:

- **PULSE 75 và AKKO 5075B Plus:** cùng layout 75%, cùng cấu trúc gasket, kết nối 3 chế độ, hotswap 5-pin. PULSE 75 có pin **4.000 mAh**, AKKO 5075B Plus dùng pin 3.000 mAh. Giá tham khảo: PULSE 75 khoảng 1,14 triệu tại Hilitek, AKKO 5075B Plus khoảng 1,29 triệu tại một số cửa hàng (11/2026).
- **PULSE 96 và AKKO 3098B Plus:** cùng nhóm bàn phím 96% giữ cụm số, cùng kết nối 3 chế độ và hotswap. PULSE 96 vẫn có pin 4.000 mAh so với 3.000 mAh của AKKO 3098B Plus, kèm núm xoay âm lượng.
- **Điểm mạnh của AKKO:** nhiều phối màu theo chủ đề, nhiều loại switch AKKO để chọn.
- **Điểm mạnh của VOICSKY:** pin lớn hơn, núm xoay, switch TONE Silent êm cho phòng làm việc chung, giá thấp hơn ở cùng layout, bảo hành 24 tháng tại Hilitek.

Hilitek hiện không bán AKKO; thông số AKKO trên đây theo công bố của hãng và các cửa hàng, giá có thể thay đổi.

## Mua tại Hilitek
Hàng chính hãng, bảo hành 24 tháng với VOICSKY, đủ hoá đơn VAT. Ghé cửa hàng ở Phú Thọ, TP.HCM để gõ thử trực tiếp.`,
  },
  {
    slug: "man-hinh-27-inch-2k-hay-full-hd-180hz",
    points: [
      "Chơi game thi đấu, card tầm trung: chọn Full HD 144Hz trở lên",
      "Làm việc nhiều, cần chữ nét: chọn 2K",
      "IPS cho màu chuẩn, VA cho tương phản cao và tần số quét cao giá tốt",
    ],
    table: {
      title: "Full HD tần số cao hay 2K?",
      head: ["Tiêu chí", "Full HD 144–280Hz", "2K 165–200Hz"],
      rows: [
        ["Độ nét chữ ở 27 inch", "Vừa đủ, nhìn gần thấy hạt", "Sắc nét"],
        ["Card đồ hoạ cần", "Tầm trung là đủ", "Mạnh hơn để giữ FPS"],
        ["Hợp nhất với", "Game bắn súng, thi đấu", "Làm việc, game nhập vai"],
        ["Giá tham khảo", "Từ khoảng 2,2 triệu", "Từ khoảng 3,6 triệu"],
      ],
    },
    news: "huong-dan",
    date: "2026-11-24",
    title: "Màn hình 27 inch 2K hay Full HD 180Hz: chơi game, làm việc nên chọn gì?",
    summary: "Độ phân giải, tần số quét và tấm nền: chọn đúng theo việc bạn làm nhiều nhất.",
    cover: "https://media.hilipc.vn/desc/mwivvuid-qepx6tfn.webp",
    cta: { to: "/danh-muc?cat=M%C3%A0n%20h%C3%ACnh%20Gaming", label: "Xem màn hình gaming" },
    products: [
      "man-hinh-vsp-ip2709sg-27-inch-ips-fhd-144hz-1ms",
      "man-hinh-msi-g275l-e14-27-inch-full-hd-ips-144hz-1-ms",
      "man-hinh-gaming-vsp-va2728g2-27-inch-va-fhd-280hz-1ms",
      "man-hinh-cong-gigabyte-gs27fc2-27-240hz",
      "man-hinh-may-tinh-aiwa-27-inch-2k-monitor-2k-165hz",
      "man-hinh-msi-mag-275qf-e21",
    ],
    body: `Ở cỡ 27 inch, câu hỏi lớn nhất là nên lấy độ phân giải 2K (2560×1440) hay Full HD (1920×1080) với tần số quét cao. Câu trả lời phụ thuộc vào việc bạn làm nhiều nhất và card đồ hoạ đang có.

## Full HD tần số cao: cho game bắn súng, thi đấu
![Màn hình VSP VA2728G2 280Hz](https://media.hilipc.vn/desc/mwivvuid-qepx6tfn.webp)
- Chữ và hình hơi to, mật độ điểm ảnh thấp hơn 2K, nhìn gần sẽ thấy hạt
- Card đồ hoạ tầm trung vẫn đẩy được FPS cao, tận dụng hết 144Hz đến 280Hz
- Giá mềm: mẫu 27 inch IPS 144Hz chỉ khoảng 2,2 triệu
**Gợi ý:** VSP IP2709SG (IPS 144Hz), MSI G275L E14 (IPS 144Hz), VSP VA2728G2 (VA 280Hz) cho game thủ muốn mượt tối đa, GIGABYTE GS27FC2 (màn cong VA 240Hz).

## 2K: cho làm việc và game nhập vai
![Màn hình AIWA 27 inch 2K](https://media.hilipc.vn/desc/mwiwd5rx-rbq1rqfs.webp)
- Chữ sắc nét, chia đôi màn hình làm việc thoải mái
- Game đẹp hơn nhưng cần card đồ hoạ mạnh hơn để giữ FPS cao
**Gợi ý:** AIWA MZ270L-Y (IPS 2K 165Hz), MSI MAG 275QF E21 (Rapid IPS 2K, tới 200Hz).

## IPS hay VA?
**IPS** màu chuẩn, góc nhìn rộng, hợp làm ảnh, xem phim, làm văn phòng. **VA** tương phản cao, màu đen sâu, thường có tần số quét cao với giá tốt, hợp game.

## Chọn nhanh
- Chơi game thi đấu, card tầm trung: **Full HD 144Hz trở lên**
- Làm việc nhiều, chơi game nhẹ: **2K**
- Ngân sách dưới 2,5 triệu: **Full HD IPS 144Hz**

Chưa biết chọn mẫu nào hợp với card đồ hoạ đang có, nhắn Hili qua Zalo để được tư vấn.`,
  },
  {
    slug: "chon-may-choi-game-cam-tay",
    points: [
      "Chọn theo game muốn chơi, không theo chip mạnh nhất",
      "Retro: nhỏ gọn, từ khoảng 1,75 triệu",
      "Android: linh hoạt, chơi được cả game mobile",
      "PC cầm tay: chơi game Steam, từ khoảng 15 triệu",
    ],
    table: {
      title: "Ba dòng máy trong một bảng",
      head: ["Dòng", "Chơi được", "Độ gọn", "Giá tham khảo"],
      rows: [
        ["Retro", "Game cổ, PS1, Game Boy", "Bỏ túi", "Khoảng 1,7 đến 2,5 triệu"],
        ["Android", "Giả lập PS2, Switch, game mobile", "Vừa", "Tuỳ chip, ví dụ AYN Thor"],
        ["PC cầm tay", "Game PC, Steam", "To, nặng hơn", "Khoảng 15 đến 28 triệu"],
      ],
    },
    news: "huong-dan",
    date: "2026-11-24",
    title: "Retro, Android hay PC cầm tay: máy chơi game cầm tay nào hợp với bạn?",
    summary: "Ba dòng máy khác nhau ở game chơi được, độ gọn và tầm tiền. Chọn theo kiểu chơi, không theo chip.",
    cover: "/handheld/retroid-pocket-6.webp",
    cta: HH,
    products: ["ayn-thor-pro-den"],
    body: `Câu hỏi đầu tiên không phải là chip nào mạnh nhất, mà là **bạn muốn chơi gì**.

## Retro: chơi lại game tuổi thơ
- Game điện tử thùng, máy băng, PS1, Game Boy
- Máy nhỏ, nhẹ, pin trâu, giá dễ chịu
- Mẫu tham khảo: Anbernic RG40XX-V (khoảng 1,75 triệu), Anbernic RG35XX H (khoảng 1,85 triệu), Trimui Smart Pro S (khoảng 2,5 triệu)
**Hợp với ai:** người muốn một chiếc máy bỏ túi, chơi vài ván lúc rảnh.

## Android: linh hoạt nhất
![AYN Thor hai màn hình](https://media.hilipc.vn/desc/mwj0mg7f-21ax645f.webp)
- Giả lập được nhiều hệ máy đời mới hơn như PS2, Switch, tuỳ chip
- Chơi được cả game mobile, xem YouTube, cài ứng dụng như điện thoại
- Có mẫu thiết kế đặc biệt như **AYN Thor** gập với hai màn hình AMOLED
**Hợp với ai:** người muốn một máy làm được nhiều việc, cân giữa giá và sức mạnh.

## PC cầm tay: chơi game PC thật
- Chạy Steam, game PC, có thể cắm màn hình, bàn phím như máy tính
- Máy to và nặng hơn, giá cao nhất trong ba dòng
- Mẫu tham khảo: ROG Xbox Ally (khoảng 15 triệu), Lenovo Legion Go (khoảng 14,9 triệu), MSI Claw A8 (khoảng 22,9 triệu), ROG Xbox Ally X (khoảng 23,5 đến 28 triệu)
**Hợp với ai:** người đã có thư viện game Steam, muốn chơi ở mọi nơi.

Giá trên là giá tham khảo tại các cửa hàng tháng 11/2026, thay đổi theo thời điểm. Hili tư vấn và báo giá mẫu bạn quan tâm qua Zalo.

## Chọn nhanh theo câu hỏi
- Chỉ chơi game cổ, cần gọn: **Retro**
- Muốn vừa chơi game vừa giải trí đa năng: **Android**
- Muốn chơi game PC mới: **PC cầm tay**

Ở trang Máy chơi game cầm tay, Hili chia sẵn từng dòng theo ngân sách và có tư vấn qua Zalo.`,
  },
  {
    slug: "build-pc-choi-game-15-trieu-thang-12-2026",
    points: [
      "Khung 15 triệu: i5-12400F, RAM 16GB, RTX 3050, SSD NVMe 512GB, nguồn 650W",
      "Phần nền chọn loại bền để nâng cấp sau, CPU và VGA chọn theo giá từng ngày",
      "Bộ máy tương tự trên thị trường đang bán trọn khoảng 16 đến 18,6 triệu",
    ],
    table: {
      title: "Cấu hình gợi ý",
      head: ["Linh kiện", "Gợi ý", "Ghi chú"],
      rows: [
        ["CPU", "Intel Core i5-12400F", "6 nhân 12 luồng"],
        ["Mainboard", "ASRock B760M-HDV/M.2 D4", "Có bán tại Hilitek"],
        ["RAM", "16GB DDR4 (2 × 8GB)", "Kênh đôi"],
        ["VGA", "RTX 3050", "Dư tiền lên RTX 5060 8GB"],
        ["SSD", "SSTC E130 512GB NVMe", "Có bán tại Hilitek"],
        ["Nguồn", "650W 80 Plus Bronze", "Đủ dư để nâng card"],
        ["Vỏ", "Xigmatek Cloud M DGT", "Có bán tại Hilitek"],
      ],
    },
    news: "huong-dan",
    date: "2026-11-24",
    title: "Build PC chơi game 15 triệu tháng 12/2026",
    summary: "Khung cấu hình 15 triệu với i5-12400F, RAM 16GB, RTX 3050: phần nền bền dùng lâu, so với giá bộ máy đang bán trên thị trường.",
    cover: "https://media.hilipc.vn/desc/mwivxx2a-v8x75s9y.webp",
    cta: { to: "/xay-dung-cau-hinh", label: "Tự chọn linh kiện, web cộng tổng tiền" },
    products: [
      "mainboard-asrock-b760m-hdv-m-2-d4",
      "o-cung-ssd-sstc-oceanic-whitetip-e130-512gb-nvme-m2",
      "case-xigmatek-cloud-m-dgt",
    ],
    body: `Với 15 triệu đồng, mục tiêu hợp lý là chơi mượt các game eSports và game phổ biến ở Full HD. Cách chia tiền khôn ngoan: phần nền (main, nguồn, SSD, vỏ) chọn loại bền để nâng cấp về sau, phần CPU và VGA chọn theo giá từng thời điểm.

## Phần nền (khoảng 6–6,5 triệu)
- **Mainboard:** ASRock B760M-HDV/M.2 D4, chân Intel đời 12–14, dùng RAM DDR4 để tiết kiệm
- **SSD:** SSTC Oceanic Whitetip E130 512GB NVMe, khởi động và vào game nhanh
- **Nguồn:** 650W chuẩn 80 Plus Bronze, như VSP VGP650BRU PRO, đủ dư để nâng card sau này
- **Vỏ:** Xigmatek Cloud M DGT, kính cường lực, có màn hình nhiệt độ

## Phần sức mạnh (khoảng 8–9 triệu)
- **CPU:** Intel Core i5-12400F, 6 nhân 12 luồng, hợp chân LGA1700 của main B760M
- **RAM:** 16GB DDR4 chạy kênh đôi (2 thanh 8GB)
- **VGA:** RTX 3050, chơi tốt game eSports ở Full HD; dư tiền thì lên RTX 5060 8GB
Giá RAM và card đồ hoạ thay đổi theo tuần, nên Hili báo giá phần này theo ngày để bạn có cấu hình tốt nhất trong 15 triệu.

## Thị trường đang bán thế nào?
Tham khảo các cửa hàng lớn tháng 11/2026: bộ máy **Core i5-12400F + RAM 16GB + RTX 3050** đang được bán trọn bộ khoảng **16 đến 18,6 triệu**. Muốn lên **RTX 5060 8GB** thì trọn bộ thường từ khoảng **18 đến 21 triệu**. Tự chọn từng món như trên giúp bạn giữ được mức 15 triệu với RTX 3050, rồi nâng card sau khi có thêm ngân sách.

## Mẹo
- Ưu tiên nguồn tốt, đừng tiết kiệm ở nguồn
- Chừa khe RAM trống để nâng lên 32GB sau
- Màn hình Full HD 144Hz là cặp đôi hợp lý với cấu hình này

Dùng công cụ **Xây dựng cấu hình PC** trên web: chọn từng món, web tự cộng tiền, rồi gửi cho Hili kiểm tra tương thích miễn phí.`,
  },
  {
    slug: "qua-tet-noel-cho-game-thu-duoi-2-trieu",
    points: [
      "Quà dùng hằng ngày: chuột, bàn phím, tai nghe chính hãng",
      "Dưới 1 triệu: chuột VOICSKY CLOUD S1 PRO 49g",
      "Combo bàn phím VOICSKY PULSE 75 + chuột Machenike L9 dưới 2 triệu",
    ],
    news: "tin",
    date: "2026-11-24",
    title: "Mua quà Tết, Noel cho game thủ dưới 2 triệu",
    summary: "Bàn phím, chuột, tai nghe chính hãng: quà dùng được hằng ngày, có bảo hành, có hoá đơn.",
    cover: "https://media.hilipc.vn/desc/mwj2vje0-9udhu2wl.webp",
    cta: { to: "/danh-muc?group=Gaming%20Gear", label: "Xem thêm gaming gear" },
    products: [
      "chuot-gaming-khong-day-voicsky-cloud-s1-pro-dark",
      "ban-phim-co-khong-day-voicsky-pulse-75-glacier",
      "chuot-khong-day-machenike-l9-x1-3311-black",
      "tai-nghe-xiberia-v15-deep-iron-grey",
      "tai-nghe-xiberia-k9-pro-black",
      "ban-phim-machenike-k500b-b87-wired-red-switch-led-backlit-black",
    ],
    body: `Quà cho người chơi game ý nghĩa nhất là thứ họ dùng mỗi ngày. Dưới đây là các món dưới 2 triệu đồng Hilitek đang có hàng.

## Dưới 700 nghìn
- **Tai nghe Xiberia V15:** tai nghe gaming giá mềm cho người mới
- **Bàn phím Machenike K500B-B87:** phím cơ có dây, switch Red, hotswap
- **Chuột không dây Machenike L9:** không vướng dây, gọn bàn

## Dưới 1 triệu
![Chuột VOICSKY CLOUD S1 PRO](https://media.hilipc.vn/desc/mwj2vje0-9udhu2wl.webp)
- **Chuột không dây VOICSKY CLOUD S1 PRO:** chỉ 49g, cảm biến PixArt PAW3395 tới 26.000 DPI, kết nối 3 chế độ
- **Tai nghe Xiberia K9 Pro:** tai nghe gaming tầm giá dưới 1 triệu

## Dưới 1,5 triệu
- **Bàn phím VOICSKY PULSE 75:** không dây 3 chế độ, gasket, pin 4.000 mAh, nhiều màu đẹp làm quà

## Gợi ý combo
- Chuột VOICSKY CLOUD S1 PRO + tai nghe Xiberia V15: khoảng 1,4 triệu
- Bàn phím VOICSKY PULSE 75 + chuột Machenike L9: dưới 2 triệu

## Mua quà ở Hilitek
Hàng chính hãng, có hoá đơn, bảo hành theo số serial nên người nhận không cần giữ hoá đơn giấy. Cần gói quà hoặc giao tận nơi trong TP.HCM, nhắn Hili qua Zalo.`,
  },
  {
    slug: "cach-tra-bao-hanh-bang-so-serial",
    points: [
      "Không cần giữ hoá đơn giấy, chỉ cần số serial",
      "Tra trên web trong 3 bước, có kết quả ngay",
      "Mất tem serial: nhắn Zalo kèm số điện thoại đã mua",
    ],
    news: "huong-dan",
    date: "2026-11-24",
    title: "Cách tra bảo hành bằng số serial tại Hilitek",
    summary: "Không cần giữ hoá đơn giấy: nhập số serial là biết hạn bảo hành còn bao lâu.",
    cover: "/home/m04.webp",
    cta: { to: "/bao-hanh", label: "Tra bảo hành ngay" },
    products: [],
    body: `Sản phẩm mua tại Hilitek được bảo hành theo **số serial**, nên bạn không cần giữ hoá đơn giấy.

## Tra trong 3 bước
- Mở trang **Tra cứu bảo hành** trên hilipc.vn
- Nhập số serial in trên tem sản phẩm hoặc trên phiếu bảo hành (ví dụ HLT-2405-000123)
- Bấm tra cứu để xem tên sản phẩm, ngày mua và hạn bảo hành

## Không tìm thấy số serial?
- Xem tem dán ở mặt dưới hoặc mặt sau sản phẩm
- Xem trên hộp sản phẩm hoặc phiếu bảo hành đi kèm
- Nhắn Hili qua Zalo kèm số điện thoại đã mua, nhân viên tra giúp

## Khi cần bảo hành
Mang sản phẩm tới cửa hàng Hilitek ở Phú Thọ, TP.HCM, hoặc nhắn Zalo để được hướng dẫn gửi. Hili hỗ trợ gửi bảo hành hãng giúp bạn với các sản phẩm bảo hành tại trung tâm hãng.`,
  },
  {
    slug: "windows-11-pro-ban-quyen-oem-retail-fqc",
    points: [
      "OEM, FQC gắn với một máy, giá tốt nhất",
      "Retail chuyển được sang máy khác",
      "ESD là bản quyền điện tử, nhận khoá qua email",
      "Dùng sai giấy phép có thể bị phạt tới 500 triệu đồng với tổ chức",
    ],
    table: {
      title: "So sánh các loại giấy phép Windows",
      head: ["Loại", "Chuyển máy", "Có hộp", "Hợp với"],
      rows: [
        ["OEM", "Không", "Không", "Máy mới dùng cố định"],
        ["FQC (OEM đóng hộp)", "Không", "Có", "Máy lắp ráp"],
        ["Retail (FPP)", "Có", "Có", "Hay thay máy"],
        ["ESD", "Theo loại", "Không", "Cần kích hoạt nhanh"],
      ],
    },
    news: "huong-dan",
    date: "2026-11-24",
    title: "Windows 11 Pro bản quyền: OEM, Retail, FQC khác nhau thế nào?",
    summary: "Phân biệt các loại giấy phép Windows để mua đúng cho máy cá nhân và máy công ty.",
    cover: "https://media.hilipc.vn/desc/mwixu5no-sbc24zg3.webp",
    cta: { to: "/phan-mem-ban-quyen", label: "Phần mềm bản quyền cho doanh nghiệp" },
    products: ["phan-mem-windows-11-pro-64bit-eng-intl-fqc-10528", "phan-mem-office-home-business-2024-all-lng-apac-em-retail-online-esd-ep2-06604"],
    body: `Cùng là Windows 11 Pro nhưng có nhiều loại giấy phép, giá và cách dùng khác nhau.

## OEM
- Giấy phép gắn với **máy tính cài đặt đầu tiên**
- Không chuyển được sang máy khác khi thay máy
- Giá tốt nhất, hợp máy lắp ráp mới, dùng lâu dài trên một máy

## FQC (bản OEM đóng hộp DSP)
- **FQC** là mã sản phẩm của Windows 11 Pro bản OEM đóng hộp (DSP), ví dụ FQC-10528
- Có hộp, đĩa hoặc USB và khoá sản phẩm, dùng cho máy lắp ráp
- Cùng nguyên tắc OEM: gắn với một máy

## Retail (FPP)
- Bản bán lẻ đóng hộp, **chuyển được sang máy khác** khi gỡ khỏi máy cũ
- Giá cao hơn OEM

## ESD
- Bản quyền điện tử: nhận khoá qua email, không có hộp
- Kích hoạt nhanh, tiện mua cho nhiều máy

## Doanh nghiệp nên chọn gì?
- Máy mới, dùng cố định: **OEM/FQC** tiết kiệm nhất
- Hay thay máy, luân chuyển máy: **Retail**
- Nhiều máy cùng lúc: hỏi Hili báo giá theo số lượng
Từ ngày 15/02/2026, Nghị định 341/2025/NĐ-CP quy định mức phạt hành chính tới 500 triệu đồng với tổ chức vi phạm quyền tác giả, nên dùng đúng giấy phép là cách tránh rủi ro rẻ nhất.

## Kiểm tra máy đã kích hoạt chưa
Vào **Cài đặt → Hệ thống → Kích hoạt**, trạng thái phải là "Đã kích hoạt". Hili kiểm tra giúp miễn phí nếu cần.`,
  },
];
