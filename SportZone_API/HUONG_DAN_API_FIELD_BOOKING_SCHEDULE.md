# API Lấy FieldBookingSchedule theo Facility và Ngày

## 📋 Mô tả
API này cho phép lấy tất cả lịch đặt sân (FieldBookingSchedule) của một cơ sở (Facility) trong một ngày cụ thể, bao gồm:
- **Thông tin Facility**
- **Danh sách Fields** (sân)
- **Category của từng Field** (loại sân)
- **FieldBookingSchedule** của từng Field

## 🚀 API Endpoint

```http
GET /api/FieldBookingSchedule/facility/{facilityId}/date/{date}
```

### Tham số:
- `facilityId` (int): ID của facility
- `date` (DateOnly): Ngày cần lấy lịch (format: YYYY-MM-DD)

### Ví dụ:
```http
GET /api/FieldBookingSchedule/facility/6/date/2024-01-15
```

## 📊 Response Structure

### Success Response (200 OK):
```json
{
  "data": {
    "facilityId": 6,
    "facilityName": "Sân Bóng Champion",
    "date": "2024-01-15",
    "fields": [
      {
        "fieldId": 1,
        "fieldName": "Sân 1",
        "description": "Sân bóng đá cỏ nhân tạo",
        "isBookingEnable": true,
        "category": {
          "categoryFieldId": 1,
          "categoryFieldName": "Bóng đá 11 người"
        },
        "schedules": [
          {
            "scheduleId": 1,
            "bookingId": 101,
            "startTime": "08:00:00",
            "endTime": "10:00:00",
            "notes": "Đặt sân cho đội A",
            "status": "Booked",
            "price": 500000,
            "booking": {
              "bookingId": 101,
              "title": "Đặt sân đội A",
              "guestName": "Nguyễn Văn A",
              "guestPhone": "0987654321",
              "status": "Confirmed",
              "statusPayment": "Paid"
            }
          }
        ]
      }
    ]
  },
  "success": true,
  "message": "Lấy lịch đặt sân thành công cho facility 6 ngày 15/01/2024"
}
```

### Error Response (404 Not Found):
```json
{
  "data": null,
  "success": false,
  "message": "Không tìm thấy facility với ID: 999"
}
```

### Error Response (400 Bad Request):
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "facilityId": ["Facility ID phải lớn hơn 0"]
  }
}
```

## 🔧 Cách sử dụng

### 1. Test với Postman/cURL:
```bash
curl -X GET "https://localhost:7068/api/FieldBookingSchedule/facility/6/date/2024-01-15" \
     -H "Content-Type: application/json"
```

### 2. Test với JavaScript/Frontend:
```javascript
const facilityId = 6;
const date = '2024-01-15';

fetch(`/api/FieldBookingSchedule/facility/${facilityId}/date/${date}`)
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      console.log('Facility:', data.data.facilityName);
      console.log('Fields:', data.data.fields);
      
      // Lặp qua từng field
      data.data.fields.forEach(field => {
        console.log(`Field: ${field.fieldName}`);
        console.log(`Category: ${field.category?.categoryFieldName}`);
        console.log(`Schedules: ${field.schedules.length}`);
      });
    } else {
      console.error('Error:', data.message);
    }
  });
```

### 3. Test với file HTTP:
Sử dụng file `Test_FieldBookingSchedule_API.http` để test các trường hợp khác nhau.

## 📝 Dữ liệu trả về

### 1. **Facility Info:**
- `facilityId`: ID của cơ sở
- `facilityName`: Tên cơ sở
- `date`: Ngày được yêu cầu

### 2. **Fields Array:**
Mỗi field chứa:
- `fieldId`: ID của sân
- `fieldName`: Tên sân
- `description`: Mô tả sân
- `isBookingEnable`: Có cho phép đặt không
- `category`: Thông tin loại sân
- `schedules`: Danh sách lịch đặt

### 3. **Category Info:**
- `categoryFieldId`: ID loại sân
- `categoryFieldName`: Tên loại sân (VD: "Bóng đá 11 người")

### 4. **Schedules Array:**
Mỗi schedule chứa:
- `scheduleId`: ID lịch
- `bookingId`: ID đặt sân
- `startTime`: Giờ bắt đầu
- `endTime`: Giờ kết thúc
- `notes`: Ghi chú
- `status`: Trạng thái
- `price`: Giá tiền
- `booking`: Thông tin đặt sân

## ⚠️ Lưu ý

1. **Date Format**: Sử dụng format `YYYY-MM-DD` (VD: 2024-01-15)
2. **Facility ID**: Phải là số nguyên dương
3. **Empty Data**: Nếu không có lịch nào, `schedules` sẽ là array rỗng
4. **Category**: Có thể null nếu field chưa có category

## 🧪 Test Cases

1. **Facility có dữ liệu**: `GET /api/FieldBookingSchedule/facility/6/date/2024-01-15`
2. **Facility không có dữ liệu**: `GET /api/FieldBookingSchedule/facility/999/date/2024-01-15`
3. **Ngày không có lịch**: `GET /api/FieldBookingSchedule/facility/6/date/2024-12-31`
4. **Facility ID không hợp lệ**: `GET /api/FieldBookingSchedule/facility/0/date/2024-01-15`

## ✅ Hoàn thành

API đã được tạo với đầy đủ:
- ✅ Repository method
- ✅ Service method  
- ✅ Controller endpoint
- ✅ DTOs cho response
- ✅ Error handling
- ✅ Test files
- ✅ Documentation 