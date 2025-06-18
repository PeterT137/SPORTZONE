using System;
using System.Collections.Generic;

namespace SportZone_API.Models;

public partial class Field
{
    public int FieldId { get; set; }

    public int? FacId { get; set; }

    public int? CategoryId { get; set; }

    public string? FieldName { get; set; }

    public string? Description { get; set; }

    public decimal? Price { get; set; }

    public bool? IsBookingEnable { get; set; }

    public virtual CategoryField? Category { get; set; }

    public virtual Facility? Fac { get; set; }
}
