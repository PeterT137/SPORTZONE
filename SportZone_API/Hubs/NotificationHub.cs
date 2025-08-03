using Microsoft.AspNetCore.SignalR;
using System.Security.Claims; 
using System.Threading.Tasks;
using System.Collections.Concurrent;
using System.Linq;

namespace SportZone_API.Hubs
{
    public class NotificationHub : Hub
    {
        // Dictionary để lưu trữ ánh xạ userId -> connectionId
        // Dùng ConcurrentDictionary để an toàn trong môi trường đa luồng
        private static readonly ConcurrentDictionary<string, string> _connectedUsers =
            new ConcurrentDictionary<string, string>();

        public override async Task OnConnectedAsync()
        {
            // Lấy User ID từ claim "NameIdentifier"
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var connectionId = Context.ConnectionId;

            if (!string.IsNullOrEmpty(userId))
            {
                // Thêm hoặc cập nhật connectionId của user vào dictionary
                _connectedUsers[userId] = connectionId;

                // Lấy role của user từ claim
                var roleId = Context.User?.FindFirst("Role")?.Value;
                if (roleId == "3") // Giả sử "3" là RoleId của Admin
                {
                    // Thêm admin vào group "Admin"
                    await Groups.AddToGroupAsync(connectionId, "Admin");
                }
            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var connectionId = Context.ConnectionId;

            if (!string.IsNullOrEmpty(userId))
            {
                // Xóa connectionId của user khi họ ngắt kết nối
                _connectedUsers.TryRemove(userId, out _);

                // Nếu user là Admin, xóa khỏi group "Admin"
                var roleId = Context.User?.FindFirst("Role")?.Value;
                if (roleId == "3")
                {
                    await Groups.RemoveFromGroupAsync(connectionId, "Admin");
                }
            }
            await base.OnDisconnectedAsync(exception);
        }
        public async Task JoinFacilityGroup(string facilityId)
        {
            if (!string.IsNullOrEmpty(facilityId))
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, $"facility-{facilityId}");
            }
        }

        // THÊM: Phương thức để client rời khỏi nhóm theo FacId
        public async Task LeaveFacilityGroup(string facilityId)
        {
            if (!string.IsNullOrEmpty(facilityId))
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"facility-{facilityId}");
            }
        }
        // Phương thức cho client gửi thông báo tới một user cụ thể (nếu cần)
        public async Task SendNotificationToClient(string connectionId, string message)
        {
            await Clients.Client(connectionId).SendAsync("ReceiveNotification", message);
        }

        public async Task SendNotificationToGroup(string groupName, string message)
        {
            await Clients.Group(groupName).SendAsync("ReceiveNotification", message);
        }
    }
}