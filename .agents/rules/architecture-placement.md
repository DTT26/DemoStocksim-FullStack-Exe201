# Quy tắc phân tách Kiến trúc Backend vs Frontend

## 1. Nguyên tắc cốt lõi
- **Tuyệt đối không đặt file bậy bạ** hoặc sai vị trí kiến trúc.
- Phải luôn xác định rõ tính năng/code thuộc về **Backend** hay **Frontend** trước khi tạo hoặc chỉnh sửa file.

---

## 2. Phân định rõ ràng:

### A. Backend (`backend/`)
Chứa **toàn bộ nghiệp vụ (Business Logic)**, dữ liệu nhạy cảm, lưu trữ và bảo mật:
- **Models / Schemas** (`backend/src/models/`): Định nghĩa Mongoose Schema, cơ sở dữ liệu MongoDB.
- **Business Logic & Calculation** (`backend/src/services/`):
  - Logic tính toán rủi ro, PnL, điều kiện pass/fail thử thách quỹ, quota reset.
  - Proxy gọi dữ liệu ngoài (sàn chứng khoán, VNDirect, Binance...) kèm caching & xử lý dữ liệu.
- **Controllers & Routing** (`backend/src/controllers/`, `backend/src/routes/`): Xử lý request, response, xác thực token JWT, phân quyền user.

### B. Frontend (`frontend/`)
Chỉ chứa **giao diện (UI)**, hiển thị và tương tác người dùng:
- **Components / Views** (`frontend/src/features/`, `frontend/src/components/`): Các file `.tsx` render React UI.
- **API Clients** (`frontend/src/services/`): File `.ts` dùng `fetch` hoặc `axios` gọi sang Backend lấy data (ví dụ `challengeApi.ts`, `vnStockApi.ts`).
- **Data Types / Interfaces** (`frontend/src/features/**/types.ts`): Chỉ chứa `type` và `interface` để TypeScript typecheck UI.
- **Utilities** (`frontend/src/utils/`): Các hàm format hiển thị (format ngày tháng, format tiền tệ, icon/logo).
- **KHÔNG ĐƯỢC**:
  - Không tạo các file mock data tự tính toán nghiệp vụ (`*Data.ts`) ở Frontend khi đã có Backend.
  - Không lưu trạng thái nghiệp vụ (điểm thi, số dư, kết quả pass/fail) ở `localStorage` để thay thế database Backend.

---

## 3. Quy trình trước khi code file mới
1. Đặt câu hỏi: *"File này lưu dữ liệu/tính toán nghiệp vụ hay chỉ hiển thị giao diện?"*
2. Nếu là nghiệp vụ, database, xác thực -> **100% đặt ở `backend/src/`**.
3. Nếu là giao diện, tương tác người dùng, client caller -> **Đặt đúng thư mục trong `frontend/src/`**.
