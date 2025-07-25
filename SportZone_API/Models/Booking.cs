﻿using System;
using System.Collections.Generic;

namespace SportZone_API.Models;

public partial class Booking
{
    public int BookingId { get; set; }

    public int FieldId { get; set; }

    public int? CustomerId { get; set; }

    public string? Title { get; set; }

    public DateTime? StartTime { get; set; }

    public DateTime? EndTime { get; set; }

    public string? Status { get; set; }

    public string? StatusPayment { get; set; }

    public DateTime? CreateAt { get; set; }

    public string? GuestName { get; set; }

    public string? GuestPhone { get; set; }

    public virtual Customer? Customer { get; set; }

    public virtual Field Field { get; set; } = null!;

    public virtual ICollection<FieldBookingSchedule> FieldBookingSchedules { get; set; } = new List<FieldBookingSchedule>();

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
}
