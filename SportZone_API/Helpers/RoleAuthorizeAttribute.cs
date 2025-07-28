using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Security.Claims;

public class RoleAuthorizeAttribute : Attribute, IAuthorizationFilter
{
    private readonly string[] _allowedRoles;

    public RoleAuthorizeAttribute(params string[] roles)
    {
        _allowedRoles = roles;
    }

    public void OnAuthorization(AuthorizationFilterContext context)
    {
        var user = context.HttpContext.User;

        if (!user.Identity?.IsAuthenticated ?? false)
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        var roleNames = user.FindAll(ClaimTypes.Role).Select(c => c.Value);
        var roleIdClaim = user.FindFirst("RoleId")?.Value;

        bool hasRole =
            _allowedRoles.Any(r => roleNames.Contains(r, StringComparer.OrdinalIgnoreCase)) ||
            (_allowedRoles.Any(r => int.TryParse(r, out int id)) && roleIdClaim == _allowedRoles.FirstOrDefault(r => int.TryParse(r, out _)));

        if (!hasRole)
        {
            context.Result = new JsonResult(new
            {
                success = false,
                message = "Bạn không có quyền truy cập vào tài nguyên này"
            })
            {
                StatusCode = StatusCodes.Status403Forbidden
            };
        }
    }
}