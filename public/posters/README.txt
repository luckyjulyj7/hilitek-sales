╔══════════════════════════════════════════════════════════════════╗
║  CHỖ ĐỂ ẢNH POSTER / BANNER TRANG CHỦ                             ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  Chép file ảnh vào ĐÚNG thư mục này (public/posters/).            ║
║  Đặt tên gợi ý:                                                   ║
║                                                                  ║
║     hero.jpg        -> poster chính (to nhất, bên trái)  892x460  ║
║     phu-1.jpg       -> poster phụ 1 (cột phải trên)      300x226  ║
║     phu-2.jpg       -> poster phụ 2 (cột phải dưới)      300x226  ║
║     banner-1.jpg    -> banner ngang 1                    394x150  ║
║     banner-2.jpg    -> banner ngang 2                    394x150  ║
║     banner-3.jpg    -> banner ngang 3                    394x150  ║
║                                                                  ║
║  Rồi mở  src/storefront/config.js  -> phần HOME_POSTERS,          ║
║  điền `image` (và `href` nếu muốn bấm vào chuyển trang), ví dụ:   ║
║                                                                  ║
║    hero: { w:892, h:460, label:"Poster chính",                   ║
║           image:"/posters/hero.jpg",                             ║
║           href:"#/danh-muc?sort=discount" },                     ║
║                                                                  ║
║  href có thể là: "#/danh-muc?group=Gaming Gear", "#/san-pham/...",║
║  hoặc link ngoài "https://...". Bỏ trống href = ảnh không bấm.    ║
║                                                                  ║
║  Ảnh nên đúng tỉ lệ khung (không thì bị cắt cho vừa).             ║
╠══════════════════════════════════════════════════════════════════╣
║  BANNER DỌC TRANG SẢN PHẨM (cột phải trang chi tiết)   300x520    ║
║                                                                  ║
║     banner-doc.svg      -> bản vector (nét ở mọi kích thước)      ║
║     banner-doc.png      -> 300x520                                ║
║     banner-doc@2x.png   -> 600x1040 (in ấn / mạng xã hội)         ║
║                                                                  ║
║  Set trong app quản lý: Website -> Cấu hình web ->               ║
║  "Banner dọc trang sản phẩm - ảnh" = /posters/banner-doc.svg     ║
║  (hoặc .png). Muốn sửa chữ/màu: sửa file .svg rồi tạo lại .png.  ║
╚══════════════════════════════════════════════════════════════════╝
