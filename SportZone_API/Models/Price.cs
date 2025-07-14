using System;
using System.Collections.Generic;

namespace SportZone_API.Models;

public partial class Price
{
    public int PriceId { get; set; }

    public int? FieldId { get; set; }

    public int? ScheduleId { get; set; }

    public decimal? Price1 { get; set; }

    public virtual Field? Field { get; set; }

    public virtual FieldBookingSchedule? Schedule { get; set; }
}
