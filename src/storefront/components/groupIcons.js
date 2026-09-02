import { Cpu, Gamepad2, HardDrive, Monitor, AppWindow, Package } from "lucide-react";

/**
 * Bảng icon cho nhóm danh mục (MENU[].icon trong config.js).
 * Muốn thêm icon: import từ lucide-react rồi thêm vào bảng này, đặt tên tương ứng
 * trong config. Danh sách icon: https://lucide.dev/icons
 */
const MAP = { Cpu, Gamepad2, HardDrive, Monitor, AppWindow, Package };

export function groupIcon(name) {
  return MAP[name] || Package;
}
