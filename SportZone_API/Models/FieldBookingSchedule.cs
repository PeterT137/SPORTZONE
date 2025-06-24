using System;
using System.Collections.Generic;

namespace SportZone_API.Models;

public partial class FieldBookingSchedule
{
    public int ScheduleId { get; set; }

    public int? FieldId { get; set; }

    public int? BookingId { get; set; }

    public DateTime? StartTime { get; set; }

    public DateTime? EndTime { get; set; }

    public string? Notes { get; set; }

    public virtual Booking? Booking { get; set; }

    public virtual Field? Field { get; set; }
}
