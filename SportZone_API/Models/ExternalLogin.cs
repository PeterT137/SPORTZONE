using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace SportZone_API.Models;

public partial class ExternalLogin
{
    public int Id { get; set; }

    public int? UId { get; set; }

    public string? ExternalProvider { get; set; }

    public string? ExternalUserId { get; set; }

    public string? AccessToken { get; set; }
    [JsonIgnore]
    public virtual User? UIdNavigation { get; set; }
}
