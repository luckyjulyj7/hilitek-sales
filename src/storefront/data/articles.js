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
    // Bài dạng hình ảnh (ArticlePicks.jsx). Có trường này thì web không hiện points/pairs/table/body.
    picks: {
      lead: "Bốn mẫu VOICSKY không dây, ba mẫu gaming có dây của Machenike và EDRA. Xem hình, chọn theo nhu cầu.",
      hero: ["/home/cut-pulse-glacier.webp", "/landing/bai/tune65.webp", "/home/cut-echo.webp"],
      nav: "Bạn cần bàn phím kiểu nào?", extras: ["switches", "versus"], cols: [["Cỡ", "size"], ["Kết nối", "link"]],
      end: ["Chưa biết chọn mẫu nào?", "Nhắn Hili hoặc ghé cửa hàng ở Phú Thọ, TP.HCM để gõ thử."],
      items: [
        { id: "pulse-75", tone: "", need: "Dễ chọn nhất", name: "VOICSKY PULSE 75", img: "/home/cut-pulse-glacier.webp", slug: "ban-phim-co-khong-day-voicsky-pulse-75-glacier", sound: true, size: "75%, 82 phím", link: "Không dây 3 chế độ",
          text: "Gọn mà vẫn đủ hàng phím F, có núm xoay âm lượng. Hợp người mới chơi phím cơ và dân văn phòng.", specs: [["82 phím", "Layout 75%"], ["4.000 mAh", "Pin"], ["Hotswap", "Thay switch 5-pin"], ["2 switch", "TONE hoặc CLOUDY"]] },
        { id: "pulse-96", tone: "half mint", need: "Cần phím số", name: "VOICSKY PULSE 96", img: "/landing/bai/pulse96.webp", slug: "ban-phim-co-khong-day-voicsky-pulse-96-glacier", sound: true, size: "96%, 97 phím", link: "Không dây 3 chế độ",
          text: "Có cụm phím số cho kế toán, nhập liệu.", specs: [["97 phím", "Layout 96%"], ["4.000 mAh", "Pin"]] },
        { id: "tune-65", tone: "half pink", need: "Bàn làm việc nhỏ", name: "VOICSKY TUNE 65", img: "/landing/bai/tune65.webp", slug: "ban-phim-co-khong-day-voicsky-tune-65-black-pink", sound: true, size: "65%, 68 phím", link: "Không dây 3 chế độ",
          text: "Nhỏ gọn, vỏ bán trong suốt, có màn hình điểm ảnh.", specs: [["68 phím", "Layout 65%"], ["49 LED", "Màn hình PIXDOT 7×7"]] },
        { id: "echo-75", tone: "sky", need: "Thích có màn hình", name: "VOICSKY ECHO 75", img: "/home/cut-echo.webp", slug: "ban-phim-co-khong-day-voicsky-echo-75-light-tactile", sound: true, size: "75%, 81 phím", link: "Không dây 3 chế độ",
          text: "Màn hình nhỏ trên góc phím hiện giờ, ngày và pin, cạnh núm xoay đa năng.", specs: [["81 phím", "Layout 75%"], ["1,14 inch", "Màn hình"], ["Hotswap", "Có RGB"]] },
        { id: "k500b", tone: "dark", need: "Giá rẻ, có dây", name: "Machenike K500B-B87", img: "/landing/bai/k500b.webp", slug: "ban-phim-machenike-k500b-b87-wired-red-switch-led-backlit-black", size: "TKL, 87 phím", link: "Có dây",
          text: "Đèn nhiều màu, switch Red, cắm dây là dùng. Hợp game thủ cần phím ổn định với ngân sách thấp.", specs: [["87 phím", "Layout TKL"], ["11 chế độ", "Đèn LED"], ["Hotswap", "Thay switch 3-pin"]] },
        { id: "ek316", tone: "half amber", need: "Gaming full-size", name: "EDRA EK316", img: "/landing/bai/ek316.webp", slug: "ban-phim-choi-game-co-edra-ek316", size: "Full-size, 104 phím", link: "Có dây",
          text: "Đủ cụm phím số, đèn Rainbow, keycap xuyên LED. Chọn switch Blue, Red hoặc Brown.", specs: [["104 phím", "Full-size"], ["3 switch", "Blue, Red, Brown"]] },
        { id: "ek387fl", tone: "half dark", need: "Gaming TKL, đèn RGB", name: "EDRA EK387FL", img: "/landing/bai/ek387fl.webp", slug: "ban-phim-co-edra-ek387fl-polar-night", size: "TKL, 87 phím", link: "Có dây, cáp rời",
          text: "Switch Gateron, keycap PBT xuyên LED, cáp USB-C tháo rời.", specs: [["87 phím", "Layout TKL"], ["RGB", "Nhiều hiệu ứng"]] },
      ],
      versus: [
        { size: "Cỡ 75%", a: { name: "VOICSKY PULSE 75", img: "/home/cut-pulse-glacier.webp", mah: 4000, slug: "ban-phim-co-khong-day-voicsky-pulse-75-glacier" }, b: { name: "AKKO 5075B Plus", img: "/landing/bai/akko5075.webp", mah: 3000, note: "Khoảng 1,29 triệu nơi khác (11/2026)" } },
        { size: "Cỡ 96%", a: { name: "VOICSKY PULSE 96", img: "/landing/bai/pulse96.webp", mah: 4000, slug: "ban-phim-co-khong-day-voicsky-pulse-96-glacier" }, b: { name: "AKKO 3098B Plus", img: "/landing/bai/akko3098.webp", mah: 3000, note: "" } },
      ],
    },
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
      title: "So sánh nhanh 7 mẫu",
      head: ["Mẫu", "Layout", "Kết nối", "Điểm nổi bật"],
      rows: [
        ["VOICSKY PULSE 75", "75% (82 phím)", "3 chế độ", "Núm xoay, pin 4.000 mAh"],
        ["VOICSKY PULSE 96", "96% (97 phím)", "3 chế độ", "Có cụm phím số"],
        ["VOICSKY TUNE 65", "65% (68 phím)", "3 chế độ", "Màn hình PIXDOT 7×7"],
        ["VOICSKY ECHO 75", "75% (81 phím)", "3 chế độ", "Màn hình 1.14 inch"],
        ["Machenike K500B", "TKL (87 phím)", "Có dây", "Giá mềm, switch Red"],
        ["EDRA EK316", "Full-size (104 phím)", "Có dây", "Đủ cụm số, đèn Rainbow"],
        ["EDRA EK387FL", "TKL (87 phím)", "Có dây, cáp rời", "Switch Gateron, RGB"],
      ],
    },
    news: "huong-dan",
    date: "2026-11-24",
    title: "Top 7 bàn phím cơ dưới 1,5 triệu đáng mua cuối 2026",
    summary: "Bốn mẫu VOICSKY không dây, ba mẫu gaming có dây của Machenike và EDRA, kèm so sánh với AKKO 5075B Plus và 3098B Plus.",
    cover: "https://media.hilipc.vn/desc/mwix9l8i-4qlr4t7p.webp",
    cta: { to: "/danh-muc?cat=B%C3%A0n%20ph%C3%ADm%20c%C6%A1", label: "Xem tất cả bàn phím cơ" },
    products: [
      "ban-phim-co-khong-day-voicsky-pulse-75-glacier",
      "ban-phim-co-khong-day-voicsky-pulse-96-glacier",
      "ban-phim-co-khong-day-voicsky-tune-65-black-pink",
      "ban-phim-co-khong-day-voicsky-echo-75-light-tactile",
      "ban-phim-machenike-k500b-b87-wired-red-switch-led-backlit-black",
      "ban-phim-choi-game-co-edra-ek316",
      "ban-phim-co-edra-ek387fl-polar-night",
    ],
    body: `Dưới 1,5 triệu đồng giờ đã mua được bàn phím cơ không dây có cấu trúc gasket, keycap PBT và pin 4.000 mAh. Dưới đây là 7 mẫu Hilitek đang có hàng.

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

## 6. EDRA EK316: gaming full-size, đủ cụm số
![EDRA EK316](https://media.hilipc.vn/desc/mwiw42uq-fpg2kt5f.webp)
- 104 phím full-size, có dây USB 1,5 m, đèn Rainbow
- E-Dra Switch Blue, Red hoặc Brown, keycap ABS Double Injection xuyên LED
**Hợp với ai:** game thủ cần phím số, thích phím có dây.

## 7. EDRA EK387FL: TKL, switch Gateron, đèn RGB
![EDRA EK387FL](https://media.hilipc.vn/desc/mwiw4w4w-fbhf2yhk.webp)
- 87 phím TKL, cáp USB Type-C tháo rời 1,6 m, LED RGB nhiều hiệu ứng
- Switch Gateron Blue, Red, Brown hoặc Yellow, keycap PBT Double-Shot xuyên LED
**Hợp với ai:** game thủ muốn phím gọn, đèn đẹp.

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
    // Bài dạng hình ảnh (ArticlePicks.jsx).
    picks: {
      lead: "Sáu mẫu 27 inch đang bán, từ 2,2 triệu. Xem hình, chọn theo việc bạn làm nhiều nhất.",
      hero: ["/landing/bai/va2728g2.webp", "/landing/bai/ip2709sg.webp", "/landing/bai/mag275qf.webp"], look: "hz",
      nav: "Bạn dùng màn hình để làm gì?", extras: ["sharp", "refresh", "panels"], cols: [["Độ nét, tần số", "size"], ["Tấm nền", "link"]],
      end: ["Card của bạn hợp màn nào?", "Nhắn Hili tên card đồ hoạ và game hay chơi, Hili gợi ý mẫu phù hợp."],
      items: [
        { id: "va2728g2", tone: "", need: "Game bắn súng", name: "VSP VA2728G2", img: "/landing/bai/va2728g2.webp", slug: "man-hinh-gaming-vsp-va2728g2-27-inch-va-fhd-280hz-1ms", size: "Full HD 280Hz", link: "VA", hz: 280,
          text: "Tần số quét cao nhất trong bài, dành cho game thủ thích mượt tối đa.", specs: [["280Hz", "Tần số quét"], ["1ms", "Phản hồi MPRT"], ["4000:1", "Tương phản"]] },
        { id: "ip2709sg", tone: "half pink", need: "Ngân sách thấp", name: "VSP IP2709SG", img: "/landing/bai/ip2709sg.webp", slug: "man-hinh-vsp-ip2709sg-27-inch-ips-fhd-144hz-1ms", size: "Full HD 144Hz", link: "IPS", hz: 144,
          text: "Rẻ nhất trong bài, đủ cho học, làm và chơi game.", specs: [["144Hz", "Tần số quét"], ["IPS", "Tấm nền"]] },
        { id: "md2707k", tone: "half sky", need: "Mượt, màu chuẩn", name: "AIWA MD2707-K", img: "/landing/bai/md2707k.webp", slug: "man-hinh-may-tinh-aiwa-27-inch-monitor-180hz", size: "Full HD 180Hz", link: "IPS", hz: 180,
          text: "Tấm nền IPS chạy 180Hz, có loa tích hợp.", specs: [["180Hz", "Tần số quét"], ["Có loa", "Tích hợp"]] },
        { id: "gs27fc2", tone: "dark", need: "Thích màn cong", name: "GIGABYTE GS27FC2", img: "/landing/bai/gs27fc2.webp", slug: "man-hinh-cong-gigabyte-gs27fc2-27-240hz", size: "Full HD 240Hz", link: "VA cong", hz: 240,
          text: "Màn cong ôm theo mắt, tần số quét cao cho game hành động.", specs: [["240Hz", "Tần số quét"], ["1500R", "Độ cong"], ["125% sRGB", "Độ phủ màu"]] },
        { id: "mz270l", tone: "half mint", need: "Làm việc, 2K dễ mua", name: "AIWA MZ270L-Y", img: "/landing/bai/mz270l.webp", slug: "man-hinh-may-tinh-aiwa-27-inch-2k-monitor-2k-165hz", size: "2K 165Hz", link: "IPS", hz: 165,
          text: "Chữ sắc nét để làm việc, vẫn đủ mượt để chơi game.", specs: [["2K", "2560×1440"], ["165Hz", "Tần số quét"]] },
        { id: "mag275qf", tone: "half amber", need: "Game đẹp, 2K cao cấp", name: "MSI MAG 275QF E21", img: "/landing/bai/mag275qf.webp", slug: "man-hinh-msi-mag-275qf-e21", size: "2K 200Hz", link: "Rapid IPS", hz: 200,
          text: "Hình đẹp, màu rộng, tới 210Hz khi bật ép xung.", specs: [["2K", "2560×1440"], ["200Hz", "Tần số quét"]] },
      ],
    },
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
      "man-hinh-may-tinh-aiwa-27-inch-monitor-180hz",
      "man-hinh-gaming-vsp-va2728g2-27-inch-va-fhd-280hz-1ms",
      "man-hinh-cong-gigabyte-gs27fc2-27-240hz",
      "man-hinh-may-tinh-aiwa-27-inch-2k-monitor-2k-165hz",
      "man-hinh-msi-mag-275qf-e21",
    ],
    body: `Ở cỡ 27 inch, câu hỏi lớn nhất là nên lấy độ phân giải 2K (2560×1440) hay Full HD (1920×1080) với tần số quét cao. Câu trả lời phụ thuộc vào việc bạn làm nhiều nhất và card đồ hoạ đang có.

## Full HD tần số cao: cho game bắn súng, thi đấu
![Màn hình VSP VA2728G2 280Hz](https://media.hilipc.vn/desc/mwivvuid-qepx6tfn.webp)
- Chữ và hình hơi to, mật độ điểm ảnh thấp hơn 2K, nhìn gần sẽ thấy hạt
- Card đồ hoạ tầm trung dễ đạt FPS cao hơn so với 2K
- Giá mềm: mẫu 27 inch IPS 144Hz chỉ khoảng 2,2 triệu
**Gợi ý:** VSP IP2709SG (IPS 144Hz), MSI G275L E14 (IPS 144Hz), AIWA MD2707-K (IPS 180Hz), VSP VA2728G2 (VA 280Hz) cho game thủ muốn mượt tối đa, GIGABYTE GS27FC2 (màn cong VA 240Hz).

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
    // Bài dạng hình ảnh (ArticlePicks.jsx).
    picks: {
      lead: "Các dòng máy khác nhau ở game chơi được, độ gọn và tầm tiền. Chọn theo game, không theo chip.",
      hero: ["/handheld/ayn-thor-cut.webp", "/handheld/anbernic-rg-34xxsp.webp", "/handheld/steam-deck-oled.webp"], look: "select",
      nav: "Bạn thuộc kiểu nào?", extras: ["eras", "sizes"],
      end: ["Nói game bạn hay chơi", "Hili gợi ý máy chạy được và báo giá qua Zalo."],
      items: [
        { id: "retro", tone: "amber", need: "Chơi lại game tuổi thơ", name: "Retro", imgs: ["/landing/bai/rg40xxv.webp", "/handheld/anbernic-rg-34xxsp.webp", "/landing/bai/miyoomini.webp"], names: ["Anbernic RG40XXV", "Anbernic RG 34XXSP", "Miyoo Mini Plus"], to: "/may-choi-game-cam-tay", cta: "Xem máy Retro",
          text: "Nhỏ, nhẹ, bỏ túi. Chơi vài ván lúc rảnh.", priceText: "Dưới 3 triệu", specs: [["PS1, GBA", "Game chơi được"], ["Khoảng 3,5 inch", "Màn hình"]] },
        { id: "brick-pro", tone: "mint", need: "Dáng đứng, hai cần analog", name: "Trimui Brick Pro", img: "/landing/bai/brickpro.webp", to: "/may-choi-game-cam-tay", cta: "Hỏi giá",
          text: "Dáng máy Game Boy, màn hình nét, thêm hai cần analog. Chạy Linux.", specs: [["3,95 inch", "IPS 1024×768"], ["2 analog", "Cảm biến Hall"], ["1 GB + 8 GB", "RAM, bộ nhớ"]] },
        { id: "anbernic", tone: "sky", need: "Nhiều kiểu dáng", name: "Retro Anbernic", imgs: ["/landing/bai/rg40xxh.webp", "/landing/bai/cubexx.webp", "/landing/bai/rg28xx.webp"], names: ["RG40XX H", "RG CubeXX", "RG28XX"], to: "/may-choi-game-cam-tay", cta: "Hỏi giá",
          text: "Máy ngang, màn vuông hoặc siêu nhỏ, cùng dòng chip H700.", specs: [["PS1, GBA", "Game chơi được"]] },
        { id: "thor", tone: "dark", need: "Hai màn hình, đa năng", name: "Android: AYN Thor", img: "/handheld/ayn-thor-cut.webp", slug: "ayn-thor-pro-den",
          text: "Máy gập hai màn hình AMOLED, có sẵn tại Hilitek. Chơi giả lập, game mobile, xem phim.", specs: [["2 màn AMOLED", "6 inch và 3,92 inch"], ["Snapdragon 8 Gen 2", "Bản Lite dùng 865"], ["6.000 mAh", "Pin"]] },
        { id: "android", tone: "sky", need: "Một máy, nhiều việc", name: "Android khác", imgs: ["/handheld/ayn-odin-3.webp", "/handheld/anbernic-rg-557.webp"], names: ["AYN Odin 3", "Anbernic RG 557"], to: "/may-choi-game-cam-tay", cta: "Xem máy Android",
          text: "Giả lập đời cao hơn tuỳ chip, cài ứng dụng như điện thoại.", priceText: "3 tới 12 triệu", specs: [["PS2, GameCube", "Tuỳ chip từng máy"], ["Khoảng 5,5 tới 6 inch", "Màn hình"]] },
        { id: "pc", tone: "", need: "Chơi game Steam", name: "PC cầm tay", imgs: ["/handheld/steam-deck-oled.webp", "/handheld/msi-claw-8-ai.webp", "/handheld/legion-go-2.webp"], names: ["Steam Deck OLED", "MSI Claw 8 AI+", "Legion Go 2"], to: "/may-choi-game-cam-tay", cta: "Xem PC cầm tay",
          text: "Chơi thư viện game PC ở mọi nơi. Máy to và nặng hơn.", priceText: "Từ 12 triệu", specs: [["Game PC, Steam", "Game chơi được"], ["7,4 tới 8,8 inch", "Màn hình"]] },
      ],
    },
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
    summary: "Các dòng máy khác nhau ở game chơi được, độ gọn và tầm tiền. Chọn theo kiểu chơi, không theo chip.",
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
      "Bộ tiết kiệm khoảng 15 triệu: i3-12100F, RAM 16GB, RTX 3050 6GB",
      "Bộ nên mua khoảng 17 triệu: i5-12400F, RAM 16GB, RTX 3050 6GB, case kèm 3 quạt ARGB",
      "CPU, RAM, card là giá tham khảo tháng 11/2026, đổi theo ngày",
    ],
    table: {
      title: "Hai bộ cấu hình",
      head: ["Linh kiện", "Tiết kiệm", "Nên mua"],
      rows: [
        ["CPU", "Core i3-12100F", "Core i5-12400F"],
        ["Mainboard", "ASRock H610M-H2/M.2", "Colorful H610M-D V20A"],
        ["RAM", "16GB DDR4 3200", "16GB DDR4 3200"],
        ["Card", "RTX 3050 6GB", "RTX 3050 6GB"],
        ["SSD", "SSTC E130 512GB NVMe", "SSTC E130 512GB NVMe"],
        ["Nguồn", "VSP VGP650BRU PRO 650W", "VSP VGP650BRU PRO 650W"],
        ["Vỏ", "Xigmatek Cloud M DGT", "Xigmatek Cloud M DGT 3 AF"],
      ],
    },
    news: "huong-dan",
    date: "2026-11-24",
    title: "Build PC chơi game 15 đến 17 triệu tháng 12/2026",
    summary: "Hai bộ PC chơi game có RTX 3050: bộ tiết kiệm i3-12100F khoảng 15 triệu, bộ nên mua i5-12400F khoảng 17 triệu.",
    cover: "https://media.hilipc.vn/desc/mwivxx2a-v8x75s9y.webp",
    cta: { to: "/xay-dung-cau-hinh", label: "Tự chọn linh kiện, web cộng tổng tiền" },
    products: [
      "mainboard-asrock-h610m-h2-m-2",
      "mainboard-colorful-h610m-d-v20a",
      "o-cung-ssd-sstc-oceanic-whitetip-e130-512gb-nvme-m2",
      "case-xigmatek-cloud-m-dgt",
    ],
    body: `Tầm 15 đến 17 triệu là đủ để có bộ máy card rời chơi mượt game eSports và game phổ biến ở Full HD. Giá dưới đây chưa gồm màn hình, bàn phím, chuột.

## Bộ tiết kiệm, khoảng 15 triệu
- **CPU:** Intel Core i3-12100F, 4 nhân 8 luồng
- **Mainboard:** ASRock H610M-H2/M.2
- **RAM:** 16GB DDR4 3200, một thanh
- **Card:** RTX 3050 6GB
- **SSD:** SSTC Oceanic Whitetip E130 512GB NVMe
- **Nguồn:** VSP VGP650BRU PRO 650W 80 Plus Bronze
- **Vỏ:** Xigmatek Cloud M DGT, kính cường lực, màn hình nhiệt độ

## Bộ nên mua, khoảng 17 triệu
- **CPU:** Intel Core i5-12400F, 6 nhân 12 luồng
- **Mainboard:** Colorful H610M-D V20A
- **RAM:** 16GB DDR4 3200, một thanh
- **Card:** RTX 3050 6GB, dư tiền thì lên RTX 5060 8GB
- **SSD:** SSTC Oceanic Whitetip E130 512GB NVMe
- **Nguồn:** VSP VGP650BRU PRO 650W 80 Plus Bronze
- **Vỏ:** Xigmatek Cloud M DGT 3 AF, kèm sẵn 3 quạt ARGB

Mainboard, SSD, nguồn và vỏ là giá đang bán trên web. CPU, RAM và card là giá tham khảo tháng 11/2026, đổi theo ngày, nhắn Hili để có giá hôm nay.

## Mẹo
- Đừng tiết kiệm ở nguồn
- Chừa một khe RAM để lên 32GB sau
- Ghép màn hình Full HD 144Hz là vừa

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
