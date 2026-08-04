# Studocu Tool - Hướng dẫn cài đặt & sử dụng

> Làm theo từng bước hướng dẫn nha

---

## Tool làm được gì?

| Nút | Chức năng |
|-----|-----------|
| **Tạo file PDF** | Tải toàn bộ tài liệu Studocu thành file PDF lưu về máy |
| **Bypass khóa & mờ** | Phá khóa tài liệu bị làm mờ, vượt giới hạn lượt xem |

---

## Video hướng dẫn cài đặt và sử dụng

Xem video hướng dẫn chi tiết từng bước tại đây:

➡️ **[Xem video hướng dẫn](https://drive.google.com/file/d/1ZnkiOkylGSVlh_TasVI4U3hs1oqXot9d/view?usp=drivesdk)**

---

## Tải tool từ GitHub về máy 

### Bước 1: Tải file

Trên trang GitHub này, tìm nút **"Code"** màu xanh lá cây ở góc trên bên phải.

Click vào nút đó, chọn **"Download ZIP"**.

File ZIP sẽ được tải về máy, thường nằm trong thư mục **Downloads** (Tải xuống).

### Bước 2: Giải nén

Vào thư mục Downloads, tìm file ZIP vừa tải về (có tên kiểu `studocu-tool-main.zip`).

Click chuột phải vào file ZIP, chọn **"Extract All..."** (Giải nén tất cả) hoặc **"Giải nén tại đây"**.

Sau khi giải nén, một thư mục mới sẽ được tạo ra. Mở thư mục đó lên, bạn sẽ thấy bên trong có các file như `manifest.json`, `background.js`, `popup.html`...

**Nhớ đường dẫn đến thư mục vừa giải nén này**, vì bước sau sẽ cần dùng đến.

---

## Cách cài vào Chrome

### Bước 1: Mở trang Extension của Chrome

Mở trình duyệt Chrome lên.

Copy dòng bên dưới, paste vào thanh địa chỉ (thanh dài trên cùng), rồi nhấn phím **Enter**:

```
chrome://extensions/
```

Màn hình sẽ chuyển sang trang quản lý Extension (Tiện ích mở rộng).

### Bước 2: Bật Developer Mode

Nhìn lên **góc phải trên cùng** màn hình. Bạn sẽ thấy một công tắc nhỏ bên cạnh dòng **"Developer mode"** (Chế độ nhà phát triển).

Click vào công tắc đó để **bật nó lên**. Khi bật, nó sẽ chuyển sang màu xanh.

### Bước 3: Load tool vào Chrome

Sau khi bật Developer mode, ở góc trái trên sẽ hiện ra mấy nút mới.

Bấm vào nút **"Load unpacked"** (Tải tiện ích đã giải nén).

Một cửa sổ chọn thư mục hiện ra. Bạn cần chọn đúng **thư mục đã giải nén ở trên** (thư mục chứa file `manifest.json`).

Lưu ý: Phải chọn đúng thư mục chứa file `manifest.json`, không chọn thư mục cha hay thư mục con khác. Nếu chọn sai, Chrome sẽ báo lỗi.

Bấm **"Select Folder"** (Chọn thư mục).

> Xong! Extension tên là **"Studocu Cleaner"** đã xuất hiện trong danh sách.

### Bước 4: Ghim ra thanh toolbar cho tiện

- Trên thanh toolbar Chrome (góc trên phải), click vào icon **hình mảnh ghép** 🧩
- Danh sách đổ xuống, tìm **"Studocu Cleaner"**
- Click vào **hình đinh ghim** 📌 bên cạnh để ghim ra ngoài
- Từ giờ icon sẽ luôn hiện trên thanh toolbar, dùng cho nhanh

---

## Cách dùng

### Phá khóa tài liệu bị mờ

Khi bạn vào Studocu đọc tài liệu mà bị làm mờ, bị chặn, hết lượt xem:

1. Click vào **icon Studocu Cleaner** trên thanh toolbar
2. Một cửa sổ popup nhỏ hiện ra với 2 nút
3. Click vào nút **"Bypass khóa & mờ"** (nút có viền)
4. Đợi 1-2 giây, trang web sẽ tự reload (tải lại)
5. Sau khi reload, tài liệu không còn bị khóa nữa

Nếu sau 3 giây trang chưa tự reload, nhấn phím **F5** để reload thủ công.

### Tải tài liệu thành PDF

Khi bạn muốn tải toàn bộ tài liệu về máy:

1. Mở tài liệu Studocu muốn tải
2. **Quan trọng:** Cuộn chuột từ từ từ trên xuống **cuối cùng** của trang. Phải cuộn đến khi không xuống được nữa. Việc này để web load (tải) hết nội dung tất cả các trang
3. Click vào icon Studocu Cleaner
4. Click nút **"Tạo file PDF"** (nút đen)
5. Một hộp thoại báo số trang tìm thấy, click **OK**
6. Cửa sổ in (Print) của Chrome hiện ra. Tại mục Destination chọn **"Save as PDF"**, rồi click **Save**
7. Chọn nơi lưu file, đặt tên, click **Save** lần nữa

---
## Lỗi thường gặp

| Lỗi | Cách sửa |
|------|----------|
| Bypass không reload | Bấm lại nút Bypass thêm 1 lần, hoặc tự nhấn F5 |
| Báo "Không tìm thấy trang nào" | Bạn chưa cuộn hết tài liệu. Cuộn từ đầu xuống cuối rồi bấm lại |
| Tool không hoạt động | Vào `chrome://extensions/`, tìm Studocu Cleaner, bấm nút Reload (🔄) |
| Extension bị tắt | Vào `chrome://extensions/`, kiểm tra công tắc đã bật chưa |
| Bị Cloudflare chặn | Đợi 2-5 phút rồi thử lại. Đừng bấm Bypass quá 3 lần liên tục |
| Load unpacked báo lỗi | Kiểm tra lại xem có chọn đúng thư mục chứa file `manifest.json` không |

---

## Cập nhật tool khi có bản mới

1. Tải bản mới từ GitHub về (lặp lại bước tải và giải nén như trên)
2. Copy toàn bộ file trong thư mục mới đè vào thư mục cũ
3. Vào `chrome://extensions/`
4. Tìm Studocu Cleaner, bấm nút Reload (🔄)
5. Xong, không cần cài lại từ đầu

---

## Gỡ cài đặt

1. Vào `chrome://extensions/`
2. Tìm Studocu Cleaner
3. Bấm nút **Remove** (Xóa)
4. Xác nhận Remove lần nữa

---

> **Made by HPahm · sleep 3am**
