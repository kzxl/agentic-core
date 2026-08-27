---
desc: Comprehensive C# WPF Desktop UI Standards — Fluent Design, Dark/Light Themes, Compact Density & Modern Controls
rules: [R_WPF, R_CORE]
---
# 🎨 C# WPF Desktop UI & Theming Standards

## 1. Visual Hierarchy & Color Palette Tokens (Design Tokens)

Tất cả màu sắc và Brush phải tuân theo hệ thống token phân tầng, nghiêm cấm hardcode giá trị hex rời rạc hoặc dùng `SystemColors`:

| Token Name | Dark Value | Light Value | Vai Trò & Mục Đích Sử Dụng |
| :--- | :--- | :--- | :--- |
| **`BgDark`** / `BgPrimary` | `#11131F` | `#F8F9FC` | Nền cửa sổ chính (Window background) |
| **`BgCard`** / `BgSurface` | `#181A28` | `#FFFFFF` | Thẻ nội dung, Toolbar, Panel bao bọc |
| **`BgInput`** | `#1D2034` | `#F1F3F9` | Hộp nhập liệu TextBox, ComboBox, ListBox |
| **`BgHover`** | `#262A44` | `#E8EDF8` | Trạng thái Hover của Button/Item |
| **`BgActive`** | `#32385C` | `#D9E2F5` | Trạng thái Pressed / Selected |
| **`BorderDefault`** | `#2E344E` | `#DCE1EE` | Viền chuẩn phân cách giữa các Card và Control |
| **`BorderSubtle`** | `#23273C` | `#EAEFF8` | Đường phân cách nhẹ (Divider, Inner border) |
| **`PrimaryAccent`** | `#818CF8` | `#4F46E5` | Màu chủ đạo (CTA buttons, Active tabs, Focus indicator) |
| **`PrimaryAccentDark`**| `#6366F1` | `#4338CA` | Gradient / Pressed state của CTA Button |
| **`SecondaryAccent`**| `#A78BFA` | `#7C3AED` | Điểm nhấn phụ, huy hiệu nổi bật (Badges) |
| **`TextPrimary`** | `#F1F5F9` | `#0F172A` | Tiêu đề, nhãn chính (100% opacity) |
| **`TextSecondary`** | `#94A3B8` | `#475569` | Văn bản phụ, nội dung mô tả (~70% opacity) |
| **`TextMuted`** | `#64748B` | `#94A3B8` | Placeholder, phím tắt, timestamp (~45% opacity) |
| **`SuccessAccent`** | `#A6E3A1` | `#16A34A` | Trạng thái thành công, bản dịch hoàn tất, Save |
| **`DangerAccent`** | `#F38BA8` | `#DC2626` | Trạng thái lỗi, cảnh báo nguy hiểm, Delete |
| **`WarningAccent`** | `#F9E2AF` | `#D97706` | Cảnh báo cần lưu ý, thông báo chờ |

---

## 2. Density & Sizing Standards (Mật Độ Hiển Thị)

Tùy theo loại ứng dụng mà chọn chế độ kích thước chuẩn hoặc nhỏ gọn:

### A. Compact Density (Ứng dụng Tiện ích, Desktop Utility, ERP Data-Heavy)
* **Button Height:** `26 – 28px` (Padding: `8,3` đến `10,4`, FontSize: `11.5 – 12px`)
* **ComboBox / TextBox:** `28 – 30px` (Padding: `8,4`, FontSize: `12 – 12.5px`)
* **CornerRadius:** `4px` (Controls con), `6 – 8px` (Cards), `10 – 12px` (Popups)
* **Slim ScrollBar:** Chiều rộng `5px`, nền trong suốt, Thumb bo góc tinh tế.

### B. Standard Density (Ứng dụng Quản Trị, Dashboard, Consumer Apps)
* **Button Height:** `34 – 38px` (Padding: `14,7`, FontSize: `13 – 14px`)
* **ComboBox / TextBox:** `36 – 40px` (Padding: `12,8`, FontSize: `14px`)
* **CornerRadius:** `6 – 8px` (Controls), `12 – 14px` (Cards)
* **ScrollBar:** Chiều rộng `8 – 10px`.

---

## 3. Window Chrome & Extended TitleBar Patterns

* **Tích hợp TitleBar vào Client Area:**
  * Mở rộng vùng hiển thị lên sát mép trên để tích hợp Logo, Bộ lọc ngôn ngữ/dữ liệu và Action Buttons vào cùng 1 hàng Toolbar.
  * Tiết kiệm từ `40 – 60px` chiều cao màn hình, tạo trải nghiệm hiện đại chuẩn Fluent/WinUI.
* **Bóng đổ & Glassmorphism:**
  * Sử dụng `DropShadowEffect` nhẹ: `BlurRadius="16-24"`, `ShadowDepth="2-4"`, `Opacity="0.3-0.45"`, `Color="#FF0B0D14"`.
  * Hỗ trợ nền bán trong suốt `#F2181A28` khi dùng PopupWindow / Floating Overlay.

---

## 4. Modern Control Templates & UX Patterns

### ① Button Variants
* **`ModernButton`:** Nền tối `#1F2236`, viền mảnh `BorderDefault`, hover chuyển sang `BgHover`, cursor hand.
* **`AccentButton`:** Nền Gradient `PrimaryAccent` $\rightarrow$ `PrimaryAccentDark`, chữ đậm, nổi bật cho hành động chính (Submit / Translate / Save).
* **`IconButton`:** Nền trong suốt (`Transparent`), không viền, chỉ hiện hover khi rê chuột.

### ② In-Window Notification (`InfoBar` Pattern)
* Nghiêm cấm bật `MessageBox.Show()` gián đoạn luồng làm việc trừ khi xác nhận thao tác xóa vĩnh viễn.
* Thay thế bằng **InfoBar Banner** đặt trên đầu View (Severity: `Info`, `Success`, `Warning`, `Error`) có nút `✕` tự đóng hoặc dismiss sau 3-5 giây.

### ③ In-Window Dialog (`ContentDialog` Pattern)
* Thay vì mở nhiều cửa sổ modal con tách rời, sử dụng Layer Backdrop làm mờ trong MainWindow và đặt UserControl Form chính giữa.

---

## 5. DevExpress & Third-Party Dark Theme Synchronization
* Đồng bộ palette với DevExpress qua SVG Palette Mapping (`DevExpress.Xpf.Core.ApplicationThemeHelper`).
* Sử dụng icon định dạng Vector (SVG / Geometry Path / Segoe MDL2 Assets) thay vì ảnh Bitmap (PNG/JPG) cố định để đảm bảo tự đổi màu theo theme.
