╔══════════════════════════════════════════════════════════════════╗
║  CHỖ ĐỂ THÊM LOGO HILITEK                                         ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  Chép file logo của bạn vào ĐÚNG thư mục này, đặt tên:            ║
║                                                                  ║
║        logo.png                                                   ║
║                                                                  ║
║  (logo.jpg / logo.jpeg / logo.webp / logo.svg cũng được)          ║
║                                                                  ║
║  => Header + Footer sẽ tự dùng logo này, không cần sửa code.      ║
║     File logo.svg hiện tại chỉ là bản vẽ tạm, sẽ tự bị thay.      ║
║                                                                  ║
║  Đường dẫn đầy đủ:                                                ║
║  D:\C\Hili\Du an website quan ly ban hang Hilitek\                ║
║        hilitek-app\public\logo.png                                ║
║                                                                  ║
║  Nếu logo đã có sẵn chữ "Hilitek": mở                             ║
║  src/storefront/config.js  -> đổi  wordmark: true  thành  false   ║
╚══════════════════════════════════════════════════════════════════╝

Thư mục public/ chứa file tĩnh, phục vụ ở gốc website ("/logo.png", ...).
Poster trang chủ cũng đặt ở đây, ví dụ public/posters/hero.jpg
rồi khai báo trong HOME_POSTERS ở src/storefront/config.js.
