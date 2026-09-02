/**
 * Dữ liệu mẫu để dựng & xem giao diện website bán hàng.
 *
 * Giai đoạn sau: `src/storefront/lib/api.js` thay nguồn này bằng gọi
 * `/api/web/products` (serverless đọc Supabase, chỉ trả sản phẩm đã bật
 * "Đăng lên web", đã bỏ giá vốn/giá sỉ). Giữ nguyên tên field như dưới.
 *
 * field:
 *   group        nhóm cha (khớp MENU trong config.js)
 *   category     danh mục con (khớp MENU)
 *   brand        nhãn hiệu
 *   listPrice    giá niêm yết (gạch ngang)
 *   price        giá bán
 *   warrantyMonths  0 = không BH, >=1200 = vĩnh viễn
 *   stock        tồn kho (số)
 *   hasSerial    có số serial riêng để tra bảo hành
 *   specChips    2–4 cụm ngắn hiển thị ở thanh nổi bật
 *   specs        [[nhãn, giá trị], ...] cho bảng thông số
 */

import { slugify } from "../lib/format.js";

const raw = [
  // ---------- Linh kiện PC ----------
  {
    sku: "HI-MB-001", name: "Mainboard ASUS PRIME B760M-A WiFi DDR5",
    group: "Linh kiện PC", category: "Mainboard", brand: "ASUS",
    listPrice: 3990000, price: 3690000, warrantyMonths: 36, stock: 8, hasSerial: true,
    shortDesc: "Socket LGA1700, 4 khe DDR5, PCIe 4.0, WiFi 6 + BT 5.2.",
    specChips: ["LGA1700", "DDR5 4 khe", "M.2 x2", "WiFi 6"],
    specs: [["Socket", "Intel LGA1700"], ["Chipset", "B760"], ["RAM", "4 x DDR5, tối đa 128GB"],
      ["Khe M.2", "2 (PCIe 4.0)"], ["Kết nối", "WiFi 6, Bluetooth 5.2"], ["Kích thước", "mATX"]],
  },
  {
    sku: "HI-MB-002", name: "Mainboard MSI MAG B650 TOMAHAWK WiFi",
    group: "Linh kiện PC", category: "Mainboard", brand: "MSI",
    listPrice: 5590000, price: 5190000, warrantyMonths: 36, stock: 4, hasSerial: true,
    shortDesc: "Socket AM5, tản VRM lớn, 2.5G LAN, PCIe 4.0.",
    specChips: ["AM5", "DDR5", "2.5G LAN", "ATX"],
    specs: [["Socket", "AMD AM5"], ["Chipset", "B650"], ["RAM", "4 x DDR5, tối đa 128GB"],
      ["Khe M.2", "3"], ["LAN", "2.5 Gbps"], ["Kích thước", "ATX"]],
  },
  {
    sku: "HI-CPU-001", name: "CPU Intel Core i5-13400F",
    group: "Linh kiện PC", category: "CPU", brand: "Intel",
    listPrice: 5290000, price: 4850000, warrantyMonths: 36, stock: 15, hasSerial: false,
    shortDesc: "10 nhân 16 luồng, xung tối đa 4.6GHz, kèm tản zin.",
    specChips: ["10 nhân / 16 luồng", "4.6GHz", "LGA1700", "65W"],
    specs: [["Số nhân / luồng", "10 / 16"], ["Xung nhịp", "2.5 – 4.6 GHz"], ["Socket", "LGA1700"],
      ["TDP", "65W (turbo 148W)"], ["Nhân đồ hoạ", "Không (bản F)"]],
  },
  {
    sku: "HI-CPU-002", name: "CPU AMD Ryzen 5 7600",
    group: "Linh kiện PC", category: "CPU", brand: "AMD",
    listPrice: 5990000, price: 5490000, warrantyMonths: 36, stock: 6, hasSerial: false,
    shortDesc: "6 nhân 12 luồng Zen 4, 5.1GHz, tản Wraith Stealth.",
    specChips: ["6 nhân / 12 luồng", "5.1GHz", "AM5", "65W"],
    specs: [["Số nhân / luồng", "6 / 12"], ["Xung nhịp", "3.8 – 5.1 GHz"], ["Socket", "AM5"],
      ["TDP", "65W"], ["Kèm tản", "Wraith Stealth"]],
  },
  {
    sku: "HI-RAM-001", name: "RAM Kingston Fury Beast 32GB (2x16) DDR5 5200",
    group: "Linh kiện PC", category: "RAM", brand: "Kingston",
    listPrice: 2790000, price: 2490000, warrantyMonths: 1200, stock: 20, hasSerial: false,
    shortDesc: "Kit 2 thanh, tản nhôm thấp, hỗ trợ XMP 3.0.",
    specChips: ["32GB (2x16)", "DDR5 5200", "CL40", "Bảo hành vĩnh viễn"],
    specs: [["Dung lượng", "32 GB (2 x 16)"], ["Bus", "5200 MHz"], ["Độ trễ", "CL40"],
      ["Điện áp", "1.25V"], ["Hồ sơ", "Intel XMP 3.0 / AMD EXPO"]],
  },
  {
    sku: "HI-RAM-002", name: "RAM Corsair Vengeance 16GB (2x8) DDR4 3200",
    group: "Linh kiện PC", category: "RAM", brand: "Corsair",
    listPrice: 1090000, price: 950000, warrantyMonths: 1200, stock: 3, hasSerial: false,
    shortDesc: "Kit 2 thanh DDR4 phổ thông, hợp mọi mainboard.",
    specChips: ["16GB (2x8)", "DDR4 3200", "CL16"],
    specs: [["Dung lượng", "16 GB (2 x 8)"], ["Bus", "3200 MHz"], ["Độ trễ", "CL16"], ["Điện áp", "1.35V"]],
  },
  {
    sku: "HI-VGA-001", name: "Card màn hình MSI GeForce RTX 4060 VENTUS 2X 8G",
    group: "Linh kiện PC", category: "Card màn hình", brand: "MSI",
    listPrice: 8990000, price: 8290000, warrantyMonths: 36, stock: 5, hasSerial: true,
    shortDesc: "8GB GDDR6, 2 quạt Torx, DLSS 3, cắm 1 nguồn 8-pin.",
    specChips: ["RTX 4060", "8GB GDDR6", "2 quạt", "170W"],
    specs: [["GPU", "GeForce RTX 4060"], ["Bộ nhớ", "8 GB GDDR6"], ["Giao tiếp", "PCIe 4.0 x8"],
      ["Cổng", "3 x DisplayPort, 1 x HDMI"], ["Nguồn đề nghị", "≥ 450W"], ["Kích thước", "2 slot, 199mm"]],
  },
  {
    sku: "HI-VGA-002", name: "Card màn hình Gigabyte RTX 4070 SUPER GAMING OC 12G",
    group: "Linh kiện PC", category: "Card màn hình", brand: "Gigabyte",
    listPrice: 18990000, price: 17990000, warrantyMonths: 36, stock: 2, hasSerial: true,
    shortDesc: "12GB GDDR6X, tản WINDFORCE 3 quạt, LHR, DLSS 3.",
    specChips: ["RTX 4070 Super", "12GB GDDR6X", "3 quạt", "220W"],
    specs: [["GPU", "GeForce RTX 4070 SUPER"], ["Bộ nhớ", "12 GB GDDR6X"], ["Giao tiếp", "PCIe 4.0 x16"],
      ["Cổng", "3 x DisplayPort 1.4a, 1 x HDMI 2.1"], ["Nguồn đề nghị", "≥ 650W"], ["Kích thước", "3 slot, 261mm"]],
  },
  {
    sku: "HI-PSU-001", name: "Nguồn Cooler Master MWE 650 V2 80+ Bronze",
    group: "Linh kiện PC", category: "Nguồn máy tính", brand: "Cooler Master",
    listPrice: 1390000, price: 1190000, warrantyMonths: 60, stock: 12, hasSerial: true,
    shortDesc: "650W thực, chuẩn 80+ Bronze, quạt 120mm, dây dẹp.",
    specChips: ["650W", "80+ Bronze", "Non-modular", "5 năm BH"],
    specs: [["Công suất", "650W thực"], ["Hiệu suất", "80 Plus Bronze"], ["Chuẩn dây", "Non-modular"],
      ["Quạt", "120mm HDB"], ["Bảo vệ", "OVP / OPP / SCP / OCP"]],
  },
  {
    sku: "HI-PSU-002", name: "Nguồn Corsair RM750e 80+ Gold Full Modular",
    group: "Linh kiện PC", category: "Nguồn máy tính", brand: "Corsair",
    listPrice: 2790000, price: 2490000, warrantyMonths: 84, stock: 7, hasSerial: true,
    shortDesc: "750W, 80+ Gold, full modular, chuẩn ATX 3.0 + 12VHPWR.",
    specChips: ["750W", "80+ Gold", "Full modular", "ATX 3.0"],
    specs: [["Công suất", "750W"], ["Hiệu suất", "80 Plus Gold"], ["Chuẩn dây", "Full modular"],
      ["Chuẩn", "ATX 3.0, PCIe 5.0 12VHPWR"], ["Bảo hành", "7 năm"]],
  },
  {
    sku: "HI-COOL-001", name: "Tản nhiệt khí Deepcool AK400",
    group: "Linh kiện PC", category: "Tản nhiệt", brand: "Deepcool",
    listPrice: 690000, price: 590000, warrantyMonths: 24, stock: 18, hasSerial: false,
    shortDesc: "4 ống đồng, quạt 120mm PWM, TDP ~220W, cao 155mm.",
    specChips: ["4 heatpipe", "120mm PWM", "TDP 220W"],
    specs: [["Kiểu", "Tản khí tháp đơn"], ["Ống đồng", "4"], ["Quạt", "120mm, 500–1850 RPM"],
      ["Chiều cao", "155 mm"], ["Socket", "LGA1700/1200, AM5/AM4"]],
  },
  {
    sku: "HI-COOL-002", name: "Tản nhiệt nước Deepcool LE520 240mm",
    group: "Linh kiện PC", category: "Tản nhiệt", brand: "Deepcool",
    listPrice: 1690000, price: 1490000, warrantyMonths: 36, stock: 4, hasSerial: true,
    shortDesc: "AIO 240mm, bơm chống rung, 2 quạt 120mm, đèn ARGB.",
    specChips: ["AIO 240mm", "2 quạt ARGB", "TDP 220W"],
    specs: [["Kích thước radiator", "240 mm"], ["Quạt", "2 x 120mm ARGB"], ["Bơm", "3 pha, chống rò"],
      ["Socket", "LGA1700/1200, AM5/AM4"], ["Bảo hành", "3 năm"]],
  },

  // ---------- Gaming Gear ----------
  {
    sku: "HI-KB-001", name: "Bàn phím cơ AKKO 3068B Plus (3 mode)",
    group: "Gaming Gear", category: "Bàn phím", brand: "AKKO",
    listPrice: 1590000, price: 1390000, warrantyMonths: 12, stock: 16, hasSerial: false,
    shortDesc: "68 phím, BT5.0 + 2.4G + type-C, hot-swap, keycap PBT.",
    specChips: ["65% 68 phím", "3 mode", "Hot-swap", "PBT Doubleshot"],
    specs: [["Layout", "65% (68 phím)"], ["Kết nối", "Bluetooth 5.0 / 2.4G / USB-C"],
      ["Switch", "AKKO CS (hot-swap 5 pin)"], ["Keycap", "PBT Doubleshot"], ["Pin", "3000 mAh"]],
  },
  {
    sku: "HI-KB-002", name: "Bàn phím cơ Rapoo V500PRO TKL",
    group: "Gaming Gear", category: "Bàn phím", brand: "Rapoo",
    listPrice: 690000, price: 550000, warrantyMonths: 24, stock: 2, hasSerial: false,
    shortDesc: "87 phím, khung kim loại, chống nước nhẹ, LED viền.",
    specChips: ["TKL 87 phím", "Khung kim loại", "Blue switch"],
    specs: [["Layout", "TKL (87 phím)"], ["Kết nối", "USB có dây"], ["Switch", "Rapoo Blue"],
      ["Khung", "Nhôm phay"], ["Chống nước", "Nhẹ (drain hole)"]],
  },
  {
    sku: "HI-MO-001", name: "Chuột Logitech G102 LIGHTSYNC",
    group: "Gaming Gear", category: "Chuột", brand: "Logitech",
    listPrice: 490000, price: 390000, warrantyMonths: 24, stock: 30, hasSerial: false,
    shortDesc: "Cảm biến 8000DPI, 6 nút, LED RGB, 85g.",
    specChips: ["8000 DPI", "6 nút", "RGB", "85g"],
    specs: [["Cảm biến", "Mercury (8000 DPI)"], ["Nút", "6"], ["Đèn", "LIGHTSYNC RGB"],
      ["Trọng lượng", "85 g"], ["Dây", "Cao su"]],
  },
  {
    sku: "HI-MO-002", name: "Chuột không dây Logitech G304 LIGHTSPEED",
    group: "Gaming Gear", category: "Chuột", brand: "Logitech",
    listPrice: 890000, price: 720000, warrantyMonths: 24, stock: 11, hasSerial: false,
    shortDesc: "HERO 12000DPI, LIGHTSPEED 2.4G, 250h pin, 99g.",
    specChips: ["12000 DPI", "LIGHTSPEED 2.4G", "99g", "1 x AA"],
    specs: [["Cảm biến", "HERO (12000 DPI)"], ["Kết nối", "LIGHTSPEED 2.4G"], ["Pin", "1 x AA, ~250 giờ"],
      ["Trọng lượng", "99 g (kèm pin)"], ["Nút", "6"]],
  },
  {
    sku: "HI-PAD-001", name: "Lót chuột Hilitek Deskmat XL 900x400",
    group: "Gaming Gear", category: "Lót chuột", brand: "Hilitek",
    listPrice: 250000, price: 190000, warrantyMonths: 0, stock: 45, hasSerial: false,
    shortDesc: "Cỡ đại phủ bàn, bề mặt vải mịn, viền may, đế cao su.",
    specChips: ["900 x 400 mm", "Viền may", "Đế chống trượt"],
    specs: [["Kích thước", "900 x 400 x 3 mm"], ["Bề mặt", "Vải dệt mịn"], ["Đế", "Cao su tạo nhám"], ["Viền", "May chỉ"]],
  },
  {
    sku: "HI-HS-001", name: "Tai nghe gaming HyperX Cloud Stinger 2",
    group: "Gaming Gear", category: "Tai nghe", brand: "HyperX",
    listPrice: 1190000, price: 990000, warrantyMonths: 24, stock: 9, hasSerial: false,
    shortDesc: "Driver 50mm, DTS 7.1 (qua app), mic xoay tắt tiếng.",
    specChips: ["Driver 50mm", "DTS 7.1", "Jack 3.5mm", "275g"],
    specs: [["Driver", "50 mm"], ["Âm thanh vòm", "DTS Headphone:X (phần mềm)"], ["Kết nối", "3.5 mm"],
      ["Mic", "Điện dung, xoay để tắt"], ["Trọng lượng", "275 g"]],
  },
  {
    sku: "HI-HS-002", name: "Tai nghe không dây Hilitek Air Pro ANC",
    group: "Gaming Gear", category: "Tai nghe", brand: "Hilitek",
    listPrice: 1290000, price: 1090000, warrantyMonths: 12, stock: 4, hasSerial: true,
    shortDesc: "Bluetooth 5.3, chống ồn ANC, tổng 30 giờ pin, IPX4.",
    specChips: ["BT 5.3", "ANC", "30 giờ pin", "IPX4"],
    specs: [["Bluetooth", "5.3"], ["Chống ồn", "ANC lai"], ["Pin", "6 giờ + 24 giờ hộp sạc"],
      ["Kháng nước", "IPX4"], ["Codec", "SBC, AAC"]],
  },

  // ---------- Thiết bị lưu trữ ----------
  {
    sku: "HI-SSD-001", name: "Ổ cứng SSD Samsung 980 1TB NVMe Gen3",
    group: "Thiết bị lưu trữ", category: "Ổ cứng SSD", brand: "Samsung",
    listPrice: 1990000, price: 1790000, warrantyMonths: 60, stock: 14, hasSerial: true,
    shortDesc: "M.2 2280, đọc 3500MB/s, không DRAM, TBW 600.",
    specChips: ["1TB", "NVMe Gen3", "Đọc 3500MB/s", "5 năm BH"],
    specs: [["Chuẩn", "M.2 2280 NVMe PCIe Gen3 x4"], ["Dung lượng", "1 TB"], ["Đọc / Ghi", "3500 / 3000 MB/s"],
      ["TBW", "600 TB"], ["Bảo hành", "5 năm"]],
  },
  {
    sku: "HI-SSD-002", name: "Ổ cứng SSD WD Blue SN580 2TB NVMe Gen4",
    group: "Thiết bị lưu trữ", category: "Ổ cứng SSD", brand: "Western Digital",
    listPrice: 3690000, price: 3390000, warrantyMonths: 60, stock: 6, hasSerial: true,
    shortDesc: "PCIe Gen4, đọc 4150MB/s, nCache 4.0, mát mẻ.",
    specChips: ["2TB", "NVMe Gen4", "Đọc 4150MB/s", "TBW 900"],
    specs: [["Chuẩn", "M.2 2280 NVMe PCIe Gen4 x4"], ["Dung lượng", "2 TB"], ["Đọc / Ghi", "4150 / 4150 MB/s"],
      ["TBW", "900 TB"], ["Bảo hành", "5 năm"]],
  },
  {
    sku: "HI-HDD-001", name: "Ổ cứng HDD Seagate BarraCuda 2TB 3.5\"",
    group: "Thiết bị lưu trữ", category: "Ổ cứng HDD", brand: "Seagate",
    listPrice: 1690000, price: 1490000, warrantyMonths: 24, stock: 10, hasSerial: true,
    shortDesc: "7200rpm, 256MB cache, SATA 3, lưu trữ dữ liệu lớn.",
    specChips: ["2TB", "7200 rpm", "SATA 3", "Cache 256MB"],
    specs: [["Dung lượng", "2 TB"], ["Tốc độ quay", "7200 rpm"], ["Bộ đệm", "256 MB"],
      ["Giao tiếp", "SATA 6 Gb/s"], ["Kích thước", "3.5 inch"]],
  },
  {
    sku: "HI-EXT-001", name: "Ổ cứng di động SSD Samsung T7 1TB",
    group: "Thiết bị lưu trữ", category: "SSD di động", brand: "Samsung",
    listPrice: 2590000, price: 2290000, warrantyMonths: 36, stock: 7, hasSerial: true,
    shortDesc: "USB 3.2 Gen 2, đọc 1050MB/s, vỏ nhôm, chống sốc 2m.",
    specChips: ["1TB", "USB 3.2 Gen 2", "Đọc 1050MB/s"],
    specs: [["Dung lượng", "1 TB"], ["Giao tiếp", "USB 3.2 Gen 2 (10 Gbps)"], ["Tốc độ đọc", "1050 MB/s"],
      ["Tốc độ ghi", "1000 MB/s"], ["Bảo hành", "36 tháng"]],
  },
  {
    sku: "HI-EXT-002", name: "Ổ cứng di động WD My Passport 2TB",
    group: "Thiết bị lưu trữ", category: "SSD di động", brand: "Western Digital",
    listPrice: 2190000, price: 1990000, warrantyMonths: 36, stock: 3, hasSerial: true,
    shortDesc: "HDD 2.5\" USB 3.0, kèm phần mềm sao lưu, mã hoá 256-bit.",
    specChips: ["2TB", "USB 3.0", "Mã hoá AES-256"],
    specs: [["Dung lượng", "2 TB"], ["Giao tiếp", "USB 3.0"], ["Bảo mật", "Mã hoá phần cứng AES 256-bit"],
      ["Phần mềm", "WD Backup, WD Security"], ["Bảo hành", "36 tháng"]],
  },
  {
    sku: "HI-USB-001", name: "USB Kingston DataTraveler Exodia 64GB",
    group: "Thiết bị lưu trữ", category: "USB & Thẻ nhớ", brand: "Kingston",
    listPrice: 190000, price: 145000, warrantyMonths: 60, stock: 60, hasSerial: false,
    shortDesc: "USB 3.2 Gen 1, nắp trượt, móc khoá, đọc ~100MB/s.",
    specChips: ["64GB", "USB 3.2 Gen 1", "5 năm BH"],
    specs: [["Dung lượng", "64 GB"], ["Chuẩn", "USB 3.2 Gen 1"], ["Tốc độ đọc", "~100 MB/s"], ["Bảo hành", "5 năm"]],
  },
  {
    sku: "HI-SD-001", name: "Thẻ nhớ SanDisk Extreme microSDXC 128GB A2",
    group: "Thiết bị lưu trữ", category: "USB & Thẻ nhớ", brand: "SanDisk",
    listPrice: 490000, price: 390000, warrantyMonths: 1200, stock: 25, hasSerial: false,
    shortDesc: "V30 U3 A2, đọc 190MB/s, quay 4K, kèm adapter SD.",
    specChips: ["128GB", "V30 / A2", "Đọc 190MB/s"],
    specs: [["Dung lượng", "128 GB"], ["Chuẩn tốc độ", "UHS-I U3, V30, A2"], ["Đọc / Ghi", "190 / 90 MB/s"],
      ["Quay phim", "4K UHD"], ["Bảo hành", "Trọn đời (giới hạn)"]],
  },

  // ---------- Màn hình ----------
  {
    sku: "HI-MN-001", name: "Màn hình gaming ViewSonic VX2758-2KP-MHD 27\" 165Hz",
    group: "Màn hình", category: "Màn hình gaming", brand: "ViewSonic",
    listPrice: 5490000, price: 4990000, warrantyMonths: 36, stock: 5, hasSerial: true,
    shortDesc: "IPS 2K QHD, 165Hz, 1ms, FreeSync, viền mỏng.",
    specChips: ["27\" IPS", "2K 165Hz", "1ms", "FreeSync"],
    specs: [["Kích thước", "27 inch"], ["Tấm nền", "IPS"], ["Độ phân giải", "2560 x 1440"],
      ["Tần số quét", "165 Hz"], ["Thời gian đáp ứng", "1 ms (MPRT)"], ["Cổng", "2 x HDMI, 1 x DisplayPort"]],
  },
  {
    sku: "HI-MN-002", name: "Màn hình gaming LG UltraGear 24GN65R 24\" 144Hz",
    group: "Màn hình", category: "Màn hình gaming", brand: "LG",
    listPrice: 3990000, price: 3590000, warrantyMonths: 24, stock: 8, hasSerial: true,
    shortDesc: "IPS Full HD, 144Hz, 1ms, G-Sync Compatible, HDR10.",
    specChips: ["24\" IPS", "FHD 144Hz", "1ms", "G-Sync"],
    specs: [["Kích thước", "23.8 inch"], ["Tấm nền", "IPS"], ["Độ phân giải", "1920 x 1080"],
      ["Tần số quét", "144 Hz"], ["Đồng bộ", "G-Sync Compatible, FreeSync Premium"], ["HDR", "HDR10"]],
  },
  {
    sku: "HI-MN-003", name: "Màn hình văn phòng Dell P2422H 24\" IPS",
    group: "Màn hình", category: "Màn hình văn phòng", brand: "Dell",
    listPrice: 4290000, price: 3890000, warrantyMonths: 36, stock: 12, hasSerial: true,
    shortDesc: "IPS Full HD, chân nâng hạ xoay, kèm cổng USB hub.",
    specChips: ["24\" IPS", "FHD 60Hz", "Chân công thái học", "USB hub"],
    specs: [["Kích thước", "23.8 inch"], ["Tấm nền", "IPS"], ["Độ phân giải", "1920 x 1080"],
      ["Tần số quét", "60 Hz"], ["Chân đế", "Nâng/hạ/nghiêng/xoay/pivot"], ["Cổng", "HDMI, DP, VGA, 4 x USB"]],
  },
  {
    sku: "HI-MN-004", name: "Màn hình văn phòng AOC 27B2H 27\" IPS",
    group: "Màn hình", category: "Màn hình văn phòng", brand: "AOC",
    listPrice: 3290000, price: 2890000, warrantyMonths: 36, stock: 2, hasSerial: true,
    shortDesc: "IPS Full HD viền mỏng 3 cạnh, chống nhấp nháy, HDMI.",
    specChips: ["27\" IPS", "FHD 75Hz", "Viền mỏng"],
    specs: [["Kích thước", "27 inch"], ["Tấm nền", "IPS"], ["Độ phân giải", "1920 x 1080"],
      ["Tần số quét", "75 Hz"], ["Chăm sóc mắt", "Flicker-Free, Low Blue Light"], ["Cổng", "HDMI, VGA"]],
  },

  // ---------- Phần mềm & Gia dụng ----------
  {
    sku: "HI-SW-001", name: "Phần mềm quản lý bán hàng Hilitek — Gói 1 năm",
    group: "Phần mềm & Gia dụng", category: "Phần mềm bản quyền", brand: "Hilitek",
    listPrice: 1650000, price: 1490000, warrantyMonths: 12, stock: 999, hasSerial: true,
    shortDesc: "Bản quyền 1 năm, cập nhật miễn phí, hỗ trợ cài đặt từ xa.",
    specChips: ["Thời hạn 12 tháng", "Cập nhật miễn phí", "Hỗ trợ từ xa"],
    specs: [["Loại", "Phần mềm SaaS / cài đặt"], ["Thời hạn", "12 tháng"],
      ["Hỗ trợ", "Cài đặt & hướng dẫn từ xa"], ["Cập nhật", "Miễn phí trong thời hạn"]],
  },
  {
    sku: "HI-SW-002", name: "Phần mềm kế toán Hilitek Pro — Bản quyền vĩnh viễn",
    group: "Phần mềm & Gia dụng", category: "Phần mềm bản quyền", brand: "Hilitek",
    listPrice: 2650000, price: 2450000, warrantyMonths: 1200, stock: 999, hasSerial: true,
    shortDesc: "Mua một lần dùng mãi, 1 máy chủ + 3 máy trạm.",
    specChips: ["Vĩnh viễn", "1 server + 3 client", "Xuất Excel/PDF"],
    specs: [["Bản quyền", "Vĩnh viễn"], ["Phạm vi", "1 server + 3 client"], ["Xuất báo cáo", "Excel, PDF"]],
  },
  {
    sku: "HI-HOME-001", name: "Bếp điện từ đôi Hilitek Home D2",
    group: "Phần mềm & Gia dụng", category: "Gia dụng", brand: "Hilitek",
    listPrice: 1890000, price: 1650000, warrantyMonths: 24, stock: 6, hasSerial: true,
    shortDesc: "2 vùng nấu, mặt kính Schott, 9 mức công suất, hẹn giờ.",
    specChips: ["2 x 2000W", "Mặt kính Schott", "Hẹn giờ 3 giờ"],
    specs: [["Công suất", "2 x 2000 W"], ["Mặt kính", "Schott Ceran"], ["Mức công suất", "9"], ["Hẹn giờ", "Tới 3 giờ"]],
  },
];

/**
 * Mô tả sản phẩm — phần "tự viết" của chủ shop. Sau này là trường `web.description`
 * nhập trong app quản lý. Ở đây viết mẫu cho vài sản phẩm; sản phẩm không có mô tả
 * riêng sẽ tự dùng `shortDesc`. Định dạng: xuống dòng đôi = đoạn mới; dòng bắt đầu
 * bằng "- " = gạch đầu dòng.
 */
const DESCRIPTIONS = {
  "HI-VGA-002": `Gigabyte RTX 4070 SUPER GAMING OC 12G là lựa chọn "đánh đâu thắng đó" ở phân khúc tầm cao: chơi mượt 2K tối đa thiết lập, dư sức 4K ở nhiều tựa game khi bật DLSS 3.

Tản nhiệt WINDFORCE 3 quạt với 3 fan 90mm quay ngược chiều nhau, ống đồng composite tiếp xúc trực tiếp GPU, giữ nhiệt độ mát và tiếng ồn thấp ngay cả khi full load nhiều giờ.

- Bộ nhớ 12GB GDDR6X, băng thông lớn — thoải mái cho đồ hoạ, dựng video, AI
- Chuẩn PCIe 4.0, cổng HDMI 2.1 + 3 x DisplayPort 1.4a, xuất tối đa 4 màn hình
- Đề nghị nguồn từ 650W; kèm giá đỡ VGA chống võng

Bảo hành 36 tháng chính hãng, có số serial riêng để tra cứu online.`,
  "HI-MB-001": `ASUS PRIME B760M-A WiFi DDR5 là bo mạch chủ phổ thông "chuẩn ASUS" cho dàn máy Intel thế hệ 12–14: ổn định, đầy đủ tính năng, giá hợp lý.

Hỗ trợ 4 khe RAM DDR5 (tối đa 128GB), 2 khe M.2 PCIe 4.0 cho SSD tốc độ cao, sẵn WiFi 6 và Bluetooth 5.2 nên không cần mua thêm card mạng.

- Socket LGA1700 — dùng được CPU Intel Gen 12, 13, 14
- Dàn tản VRM + heatsink M.2 giúp linh kiện chạy mát
- Kích thước mATX, lắp vừa hầu hết thùng máy phổ thông

Bảo hành 36 tháng.`,
  "HI-CPU-001": `Intel Core i5-13400F là CPU "quốc dân" cho cấu hình gaming tầm trung năm nay: 10 nhân (6P + 4E) / 16 luồng, xung boost tới 4.6GHz, thừa sức kéo mọi tựa game phổ biến ở 1080p–2K khi ghép với VGA tầm trung trở lên.

Bản "F" không có nhân đồ hoạ tích hợp nên rẻ hơn — phù hợp khi bạn chắc chắn dùng card rời.

- Tiết kiệm điện, mát, kèm sẵn tản nhiệt zin
- Socket LGA1700, chạy tốt trên bo mạch B760

Bảo hành 36 tháng.`,
  "HI-SSD-001": `Samsung 980 1TB là SSD NVMe gọn nhẹ, nâng cấp tức thì cho laptop hay PC còn dùng ổ cứng cơ: mở máy, mở ứng dụng, copy dữ liệu nhanh hơn nhiều lần.

Tốc độ đọc tuần tự tới 3.500 MB/s, công nghệ TurboWrite giúp ghi file lớn vẫn nhanh.

- Chuẩn M.2 2280, PCIe Gen3 x4 — tương thích rộng
- Độ bền 600 TBW, bảo hành 5 năm chính hãng Samsung
- Có số serial riêng, tra cứu bảo hành online`,
  "HI-EXT-001": `Ổ cứng di động SSD Samsung T7 1TB — nhỏ bằng chiếc thẻ ATM, nhẹ 58g, bỏ túi mang đi mọi nơi mà vẫn cho tốc độ như SSD gắn trong.

Chép một bộ phim 4K chỉ vài giây; sao lưu cả thư mục ảnh RAW trong tích tắc nhờ chuẩn USB 3.2 Gen 2 (tối đa 1.050 MB/s).

- Vỏ nhôm nguyên khối, chịu rơi từ độ cao 2m
- Cắm là chạy trên Windows, macOS, Android; kèm cáp USB-C và USB-A
- Bảo hành 36 tháng`,
  "HI-KB-001": `AKKO 3068B Plus là bàn phím cơ 65% ba chế độ kết nối (Bluetooth 5.0 / 2.4G không dây / cắm dây USB-C), gọn gàng cho bàn làm việc và mang đi linh hoạt.

Hot-swap 5 chân cho phép đổi switch không cần hàn; keycap PBT Doubleshot bền, không bóng mờ chữ theo thời gian.

- Layout 68 phím — tiết kiệm diện tích nhưng vẫn đủ phím mũi tên
- Pin 3000mAh, gõ vài ngày mới phải sạc
- Kê tay và bộ switch/keycap có thể nâng cấp sau

Bảo hành 12 tháng.`,
  "HI-MN-001": `ViewSonic VX2758-2KP-MHD là màn hình 27" tấm nền IPS độ phân giải 2K QHD, tần số quét 165Hz — nâng cấp đáng giá cho cả game thủ lẫn người làm đồ hoạ.

Hình ảnh sắc nét, màu chuẩn, góc nhìn rộng; 165Hz + FreeSync cho chuyển động mượt, không xé hình khi chơi game.

- Độ phản hồi 1ms (MPRT), viền mỏng 3 cạnh dễ ghép nhiều màn
- Cổng: 2 x HDMI + 1 x DisplayPort
- Chế độ lọc ánh sáng xanh, chống nhấp nháy — đỡ mỏi mắt khi dùng lâu

Bảo hành 36 tháng, có số serial riêng.`,
  "HI-SW-001": `Phần mềm quản lý bán hàng Hilitek — gói bản quyền 1 năm, dành cho cửa hàng muốn quản lý kho, đơn hàng, công nợ và báo cáo doanh thu ở một nơi.

Đội ngũ Hilitek hỗ trợ cài đặt và hướng dẫn sử dụng từ xa; cập nhật tính năng miễn phí trong suốt thời hạn.

- Quản lý sản phẩm, tồn kho theo số serial, nhập – xuất – kiểm kho
- Đơn bán, đổi trả, bảo hành; báo cáo lãi lỗ theo ngày
- Phân quyền nhân viên; xuất Excel

Bảo hành / hỗ trợ 12 tháng.`,
};

export const MOCK_PRODUCTS = raw.map((p) => ({
  ...p,
  id: p.sku,
  slug: slugify(`${p.name}-${p.sku}`),
  images: [],
  specChips: p.specChips || [],
  specs: p.specs || [],
  description: DESCRIPTIONS[p.sku] || "",
}));

export const MOCK_CATEGORIES = [...new Set(MOCK_PRODUCTS.map((p) => p.category))];
export const MOCK_BRANDS = [...new Set(MOCK_PRODUCTS.map((p) => p.brand))].sort((a, b) =>
  a.localeCompare(b, "vi")
);
