import {
  Cpu, CircuitBoard, MemoryStick, HardDrive, PcCase, Fan, Zap, Plug, Thermometer,
  Monitor, MonitorSmartphone, Gamepad2, Joystick, Keyboard, Mouse, Headphones, Speaker, Mic, Webcam, Cctv,
  Laptop, Server, Router, Wifi, Network, Usb, Cable, Disc, Printer, Projector, HardDriveDownload,
  Camera, Tv, Smartphone, Tablet, Watch, BatteryCharging, Armchair, Lightbulb, Lamp,
  Refrigerator, Microwave, AirVent, WashingMachine,
  Wrench, Package, Boxes, Component, AppWindow, ShoppingBag, ShoppingCart, Tag, Percent,
  Sparkles, Flame, Rocket, Star, Crown, Gift, Truck, ShieldCheck,
} from "lucide-react";

/**
 * Bảng icon cho nhóm danh mục (MENU[].icon).
 *
 * ─ MUỐN THÊM ICON MỚI ─
 *   1. Mở https://lucide.dev/icons , chọn icon, copy TÊN của nó (kiểu "PascalCase", vd "Rocket").
 *   2. File này: thêm tên đó vào dòng `import { ... } from "lucide-react"` ở trên
 *      VÀ thêm vào object MAP bên dưới.
 *   3. Tên sẽ tự hiện trong ô "Icon" ở app quản lý (Website → Cấu hình web → menu).
 *   4. Chạy lại / deploy.  (Có trong ô chọn nhưng chưa thêm vào MAP -> web hiện tạm icon "Package".)
 */
const MAP = {
  // Linh kiện PC
  Cpu, CircuitBoard, MemoryStick, HardDrive, PcCase, Fan, Zap, Plug, Thermometer,
  // Màn hình / gaming
  Monitor, MonitorSmartphone, Gamepad2, Joystick, Keyboard, Mouse, Headphones, Speaker, Mic, Webcam, Cctv,
  // Máy tính / mạng / lưu trữ / phụ kiện
  Laptop, Server, Router, Wifi, Network, Usb, Cable, Disc, Printer, Projector, HardDriveDownload,
  // Thiết bị số
  Camera, Tv, Smartphone, Tablet, Watch, BatteryCharging,
  // Gia dụng / nội thất
  Armchair, Lightbulb, Lamp, Refrigerator, Microwave, AirVent, WashingMachine,
  // Chung / khuyến mãi
  Wrench, Package, Boxes, Component, AppWindow, ShoppingBag, ShoppingCart, Tag, Percent,
  Sparkles, Flame, Rocket, Star, Crown, Gift, Truck, ShieldCheck,
};

/** Danh sách tên icon — dùng cho ô chọn "Icon" trong app quản lý. */
export const GROUP_ICON_NAMES = Object.keys(MAP);

export function groupIcon(name) {
  return MAP[name] || Package;
}
