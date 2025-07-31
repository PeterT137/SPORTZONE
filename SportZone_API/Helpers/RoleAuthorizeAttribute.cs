using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Security.Claims;

namespace SportZone_API.Attributes
{
    public class RoleAuthorizeAttribute : Attribute, IAuthorizationFilter
    {
        private readonly string _roleId;

        public RoleAuthorizeAttribute(string roleId)
        {
            _roleId = roleId;
        }

        public void OnAuthorization(AuthorizationFilterContext context)
        {
            if (!context.HttpContext.User.Identity.IsAuthenticated)
            {
                context.Result = new UnauthorizedResult();
                return;
            }

            var userRole = context.HttpContext.User.FindFirst("Role")?.Value;

            if (userRole != _roleId)
            {
                context.Result = new ForbidResult();
                return;
            }
        }
    }
}