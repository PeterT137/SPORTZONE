using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SportZone_API.DTOs;
using SportZone_API.Services.Interfaces;
using SportZone_API.Models;
using SportZone_API.Services;
using Swashbuckle.AspNetCore.Annotations;
using SportZone_API.Repository.Interfaces;

namespace SportZone_API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [AllowAnonymous]
    public class PaymentController : ControllerBase
    {
        private readonly IVNPayService _vnpayService;
        private readonly IBookingService _bookingService;
        private readonly IOrderService _orderService;
        private readonly IOrderFieldIdService _orderFieldIdService;
        private readonly IFieldService _fieldService;

        public PaymentController(IVNPayService vnpayService, 
                               IBookingService bookingService,
                               IOrderService orderService,
                               IOrderFieldIdService orderFieldIdService,
                               IFieldService fieldService)
        {
            _vnpayService = vnpayService;
            _bookingService = bookingService;
            _orderService = orderService;
            _orderFieldIdService = orderFieldIdService;
            _fieldService = fieldService;
        }

        // Dictionary để lưu booking data tạm thời (trong thực tế nên dùng Redis hoặc database)
        private static readonly Dictionary<string, PendingBookingDto> _pendingBookings = new Dictionary<string, PendingBookingDto>();

        [HttpPost("calculate-and-pay")]
        [SwaggerOperation(Summary = "Tính toán tổng tiền và tạo URL thanh toán: Customer", Description = "Tính toán tổng tiền từ booking data và tạo URL thanh toán VNPay")]
        public async Task<IActionResult> CalculateAndPay([FromBody] BookingCreateDTO bookingData)
        {
            try
            {
                // Tính toán tổng tiền từ booking data
                var calculateResult = await _bookingService.CalculateTotalAmount(new CalculateAmountDTO
                {
                    SelectedSlotIds = bookingData.SelectedSlotIds,
                    ServiceIds = bookingData.ServiceIds,
                    DiscountId = bookingData.DiscountId
                });

                if (!calculateResult.Success)
                {
                    return BadRequest(new { error = calculateResult.Message });
                }

               
                decimal depositAmount = calculateResult.Data * 0.5m;

                // Tạo OrderId
                string orderId = $"ORDER_{DateTime.Now:yyyyMMddHHmmss}_{Guid.NewGuid().ToString().Substring(0, 8)}";

                // Lưu booking data tạm thời
                var pendingBooking = new PendingBookingDto
                {
                    BookingData = bookingData,
                    OrderId = orderId,
                    CreatedAt = DateTime.Now
                };
                _pendingBookings[orderId] = pendingBooking;

                // Tạo VNPay request
                var vnpayRequest = new VNPayRequestDto
                {
                    Amount = depositAmount,
                    OrderId = orderId,
                    OrderInfo = $"Dat coc dat san - {bookingData.Title ?? "Booking"}",
                    ReturnUrl = "https://localhost:7057/api/Payment/vnpay-return"
                };

                // Tạo URL thanh toán
                var paymentResult = await _vnpayService.CreatePaymentUrl(vnpayRequest);

                if (!paymentResult.Success)
                {
                    return BadRequest(new { error = paymentResult.Message });
                }

                return Ok(new
                {
                    success = true,
                    message = "Tính toán tiền đặt cọc và tạo URL thanh toán thành công.",
                    totalAmount = calculateResult.Data,
                    depositAmount = depositAmount,
                    paymentUrl = paymentResult.Data.PaymentUrl,
                    orderId = paymentResult.Data.OrderId
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau." });
            }
        }

        [HttpGet("vnpay-return")]     
        public async Task<IActionResult> VNPayReturn()
        {
            try
            {
                Console.WriteLine($"VNPay Return URL: {Request.QueryString}");
                
                //  query parameters 
                var vnpay = new VnPayLibrary();
                
                foreach (var param in Request.Query)
                {
                    if (!string.IsNullOrEmpty(param.Key) && param.Key.StartsWith("vnp_"))
                    {
                        vnpay.AddResponseData(param.Key, param.Value);
                    }
                }

                
                string vnp_ResponseCode = vnpay.GetResponseData("vnp_ResponseCode");
                string vnp_TransactionStatus = vnpay.GetResponseData("vnp_TransactionStatus");
                string vnp_SecureHash = vnpay.GetResponseData("vnp_SecureHash");
                string vnp_TxnRef = vnpay.GetResponseData("vnp_TxnRef");
                string vnp_Amount = vnpay.GetResponseData("vnp_Amount");
                string vnp_BankCode = vnpay.GetResponseData("vnp_BankCode");
                string vnp_TransactionNo = vnpay.GetResponseData("vnp_TransactionNo");

                Console.WriteLine($"Response Code: {vnp_ResponseCode}");
                Console.WriteLine($"Transaction Status: {vnp_TransactionStatus}");
                Console.WriteLine($"TxnRef: {vnp_TxnRef}");
                Console.WriteLine($"Amount: {vnp_Amount}");

                // Xác thực chữ ký
                bool checkSignature = vnpay.ValidateSignature(vnp_SecureHash, "RYJE8DNUWL15UQJV7PDEDBC3P5IW3FCJ");
                
                Console.WriteLine($"Signature Valid: {checkSignature}");

                if (checkSignature)
                {
                    if (vnp_ResponseCode == "00" && vnp_TransactionStatus == "00")
                    {
                        // Thanh toán thành công
                        Console.WriteLine("Thanh toán thành công!");
                        
                        // Tìm booking data từ OrderId
                        if (_pendingBookings.TryGetValue(vnp_TxnRef, out var pendingBooking))
                        {
                            try
                            {
                                // Tạo booking
                                var booking = await _bookingService.CreateBookingAsync(pendingBooking.BookingData);
                                
                                // Tự động tạo Order và OrderFieldId khi Booking thành công
                                try
                                {
                                    // Lấy booking entity để truyền cho OrderService
                                    var bookingEntity = await _bookingService.GetBookingDetailAsync(booking.BookingId);
                                    if (bookingEntity != null)
                                    {
                                        var fieldinfo = await _fieldService.GetFieldEntityByIdAsync(booking.FieldId);
                                        var facilityId = fieldinfo?.FacId;
                                        // Tạo Order từ Booking
                                        var bookingModel = new Booking
                                        {
                                            BookingId = booking.BookingId,
                                            FieldId = booking.FieldId,
                                            UId = booking.UserId,
                                            GuestName = booking.GuestName,
                                            GuestPhone = booking.GuestPhone,
                                            CreateAt = booking.CreateAt,
                                            Field = new Field { FacId = facilityId }
                                        };

                                        var order = await _orderService.CreateOrderFromBookingAsync(bookingModel);

                                        // Tạo OrderFieldId linking Order với Field
                                        await _orderFieldIdService.CreateOrderFieldIdAsync(order.OrderId, booking.FieldId);
                                    }
                                }
                                catch (Exception orderEx)
                                {
                                    Console.WriteLine($"Lỗi khi tạo Order/OrderFieldId: {orderEx.Message}");
                                }

                                // Xóa booking data tạm thời
                                _pendingBookings.Remove(vnp_TxnRef);

                                Console.WriteLine($"Booking đã được tạo thành công! BookingId: {booking.BookingId}");
                                
                                // Redirect với thông tin booking
                                return Redirect($"https://localhost:3000/payment-success?bookingId={booking.BookingId}&message=Booking created successfully");
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine($"Lỗi khi tạo booking: {ex.Message}");
                                return Redirect("https://localhost:3000/payment-failed?error=Failed to create booking");
                            }
                        }
                        else
                        {
                            Console.WriteLine($"Không tìm thấy booking data cho OrderId: {vnp_TxnRef}");
                            return Redirect("https://localhost:3000/payment-failed?error=Booking data not found");
                        }
                    }
                    else
                    {
                        // Thanh toán thất bại
                        Console.WriteLine($"Thanh toán thất bại. Response Code: {vnp_ResponseCode}");
                        return Redirect("https://localhost:3000/payment-failed");
                    }
                }
                else
                {
                    // Chữ ký không hợp lệ
                    Console.WriteLine("Chữ ký không hợp lệ!");
                    return Redirect("https://localhost:3000/payment-failed");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi xử lý VNPay return: {ex.Message}");
                return Redirect("https://localhost:3000/payment-failed");
            }
        }
    }
} 