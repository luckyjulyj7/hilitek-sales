// Cloudflare Worker không chạy được sharp (thư viện ảnh viết bằng C++). Ảnh tải từ link ngoài được
// trình duyệt nén thay (xem src/lib/mediaUpload.js rehostExternalImage, ?raw=1).
export default function sharp() {
  throw new Error("sharp không có trên Cloudflare");
}
