using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace SportZone_API.Models;

public partial class SportZoneContext : DbContext
{
    public SportZoneContext()
    {
    }

    public SportZoneContext(DbContextOptions<SportZoneContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Admin> Admins { get; set; }

    public virtual DbSet<Booking> Bookings { get; set; }

    public virtual DbSet<CategoryField> CategoryFields { get; set; }

    public virtual DbSet<Customer> Customers { get; set; }

    public virtual DbSet<Discount> Discounts { get; set; }

    public virtual DbSet<ExternalLogin> ExternalLogins { get; set; }

    public virtual DbSet<Facility> Facilities { get; set; }

    public virtual DbSet<Field> Fields { get; set; }

    public virtual DbSet<FieldBookingSchedule> FieldBookingSchedules { get; set; }

    public virtual DbSet<FieldOwner> FieldOwners { get; set; }

    public virtual DbSet<Image> Images { get; set; }

    public virtual DbSet<Notification> Notifications { get; set; }

    public virtual DbSet<Order> Orders { get; set; }

    public virtual DbSet<OrderFieldId> OrderFieldIds { get; set; }

    public virtual DbSet<OrderService> OrderServices { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<Service> Services { get; set; }

    public virtual DbSet<Staff> Staff { get; set; }

    public virtual DbSet<User> Users { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("server =(local); database = SportZone;uid=sa;pwd=123;TrustServerCertificate=true");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Admin>(entity =>
        {
            entity.HasKey(e => e.UId).HasName("PK__Admin__B51D3DEAEBC5D332");

            entity.ToTable("Admin");

            entity.Property(e => e.UId)
                .ValueGeneratedNever()
                .HasColumnName("u_id");
            entity.Property(e => e.Dob).HasColumnName("dob");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("name");
            entity.Property(e => e.Phone)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("phone");

            entity.HasOne(d => d.UIdNavigation).WithOne(p => p.Admin)
                .HasForeignKey<Admin>(d => d.UId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Admin__u_id__4316F928");
        });

        modelBuilder.Entity<Booking>(entity =>
        {
            entity.HasKey(e => e.BookingId).HasName("PK__Booking__5DE3A5B12B94DC32");

            entity.ToTable("Booking");

            entity.Property(e => e.BookingId).HasColumnName("booking_id");
            entity.Property(e => e.CreateAt)
                .HasColumnType("datetime")
                .HasColumnName("create_at");
            entity.Property(e => e.CustomerId).HasColumnName("customer_id");
            entity.Property(e => e.EndTime)
                .HasColumnType("datetime")
                .HasColumnName("end_time");
            entity.Property(e => e.FieldId).HasColumnName("field_id");
            entity.Property(e => e.GuestName)
                .HasMaxLength(100)
                .HasColumnName("guest_name");
            entity.Property(e => e.GuestPhone)
                .HasMaxLength(20)
                .HasColumnName("guest_phone");
            entity.Property(e => e.StartTime)
                .HasColumnType("datetime")
                .HasColumnName("start_time");
            entity.Property(e => e.Status)
                .HasMaxLength(100)
                .HasColumnName("status");
            entity.Property(e => e.StatusPayment)
                .HasMaxLength(50)
                .HasColumnName("status_payment");
            entity.Property(e => e.Title)
                .HasMaxLength(100)
                .HasColumnName("title");

            entity.HasOne(d => d.Customer).WithMany(p => p.Bookings)
                .HasForeignKey(d => d.CustomerId)
                .HasConstraintName("FK__Booking__custome__787EE5A0");

            entity.HasOne(d => d.Field).WithMany(p => p.Bookings)
                .HasForeignKey(d => d.FieldId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Booking__field_i__778AC167");
        });

        modelBuilder.Entity<CategoryField>(entity =>
        {
            entity.HasKey(e => e.CategoryFieldId).HasName("PK__Category__6A073F0974D74F69");

            entity.ToTable("Category_field");

            entity.Property(e => e.CategoryFieldId).HasColumnName("category_field_id");
            entity.Property(e => e.CategoryFieldName)
                .HasMaxLength(50)
                .HasColumnName("Category_field_name");
        });

        modelBuilder.Entity<Customer>(entity =>
        {
            entity.HasKey(e => e.CustomerId).HasName("PK__Customer__CD65CB8512ADF6DE");

            entity.ToTable("Customer");

            entity.Property(e => e.CustomerId)
                .ValueGeneratedNever()
                .HasColumnName("customer_id");
            entity.Property(e => e.Dob).HasColumnName("dob");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("name");
            entity.Property(e => e.Phone)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("phone");
            entity.Property(e => e.UId).HasColumnName("u_id");

            entity.HasOne(d => d.UIdNavigation).WithMany(p => p.Customers)
                .HasForeignKey(d => d.UId)
                .HasConstraintName("FK__Customer__u_id__3D5E1FD2");
        });

        modelBuilder.Entity<Discount>(entity =>
        {
            entity.HasKey(e => e.DiscountId).HasName("PK__Discount__BDBE9EF9B7A2BF9F");

            entity.ToTable("Discount");

            entity.Property(e => e.DiscountId).HasColumnName("discount_id");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.DiscountPercentage)
                .HasColumnType("decimal(5, 2)")
                .HasColumnName("discount_percentage");
            entity.Property(e => e.EndDate).HasColumnName("end_date");
            entity.Property(e => e.FacId).HasColumnName("fac_id");
            entity.Property(e => e.IsActive).HasColumnName("is_active");
            entity.Property(e => e.Quantity).HasColumnName("quantity");
            entity.Property(e => e.StartDate).HasColumnName("start_date");

            entity.HasOne(d => d.Fac).WithMany(p => p.Discounts)
                .HasForeignKey(d => d.FacId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Discount__fac_id__03F0984C");
        });

        modelBuilder.Entity<ExternalLogin>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__External__3213E83F0373EE16");

            entity.ToTable("External_Logins");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.AccessToken)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("access_token");
            entity.Property(e => e.ExternalProvider)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("external_provider");
            entity.Property(e => e.ExternalUserId)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("external_user_id");
            entity.Property(e => e.UId).HasColumnName("u_id");

            entity.HasOne(d => d.UIdNavigation).WithMany(p => p.ExternalLogins)
                .HasForeignKey(d => d.UId)
                .HasConstraintName("FK__External_L__u_id__45F365D3");
        });

        modelBuilder.Entity<Facility>(entity =>
        {
            entity.HasKey(e => e.FacId).HasName("PK__Facility__978BA2C30E816289");

            entity.ToTable("Facility");

            entity.Property(e => e.FacId).HasColumnName("fac_id");
            entity.Property(e => e.Address)
                .HasMaxLength(255)
                .HasColumnName("address");
            entity.Property(e => e.CloseTime).HasColumnName("close_time");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.OpenTime).HasColumnName("open_time");
            entity.Property(e => e.Subdescription).HasColumnName("subdescription");
            entity.Property(e => e.UId).HasColumnName("u_id");

            entity.HasOne(d => d.UIdNavigation).WithMany(p => p.Facilities)
                .HasForeignKey(d => d.UId)
                .HasConstraintName("FK__Facility__u_id__5CD6CB2B");
        });

        modelBuilder.Entity<Field>(entity =>
        {
            entity.HasKey(e => e.FieldId).HasName("PK__Field__1BB6F43ED5AF6FC2");

            entity.ToTable("Field");

            entity.Property(e => e.FieldId).HasColumnName("field_id");
            entity.Property(e => e.CategoryId).HasColumnName("category_id");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.FacId).HasColumnName("fac_id");
            entity.Property(e => e.FieldName)
                .HasMaxLength(50)
                .HasColumnName("field_name");
            entity.Property(e => e.IsBookingEnable).HasColumnName("is_booking_enable");
            entity.Property(e => e.Price)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("price");

            entity.HasOne(d => d.Category).WithMany(p => p.Fields)
                .HasForeignKey(d => d.CategoryId)
                .HasConstraintName("FK__Field__category___628FA481");

            entity.HasOne(d => d.Fac).WithMany(p => p.Fields)
                .HasForeignKey(d => d.FacId)
                .HasConstraintName("FK__Field__fac_id__619B8048");
        });

        modelBuilder.Entity<FieldBookingSchedule>(entity =>
        {
            entity.HasKey(e => e.ScheduleId).HasName("PK__Field_bo__C46A8A6F3411879A");

            entity.ToTable("Field_booking_schedule");

            entity.Property(e => e.ScheduleId).HasColumnName("schedule_id");
            entity.Property(e => e.BookingId).HasColumnName("booking_id");
            entity.Property(e => e.EndTime)
                .HasColumnType("datetime")
                .HasColumnName("end_time");
            entity.Property(e => e.FieldId).HasColumnName("field_id");
            entity.Property(e => e.Notes).HasColumnName("notes");
            entity.Property(e => e.StartTime)
                .HasColumnType("datetime")
                .HasColumnName("start_time");

            entity.HasOne(d => d.Booking).WithMany(p => p.FieldBookingSchedules)
                .HasForeignKey(d => d.BookingId)
                .HasConstraintName("FK__Field_boo__booki__7D439ABD");

            entity.HasOne(d => d.Field).WithMany(p => p.FieldBookingSchedules)
                .HasForeignKey(d => d.FieldId)
                .HasConstraintName("FK__Field_boo__field__7C4F7684");
        });

        modelBuilder.Entity<FieldOwner>(entity =>
        {
            entity.HasKey(e => e.UId).HasName("PK__Field_Ow__B51D3DEAD5116068");

            entity.ToTable("Field_Owner");

            entity.Property(e => e.UId)
                .ValueGeneratedNever()
                .HasColumnName("u_id");
            entity.Property(e => e.Dob).HasColumnName("dob");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("name");
            entity.Property(e => e.Phone)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("phone");

            entity.HasOne(d => d.UIdNavigation).WithOne(p => p.FieldOwner)
                .HasForeignKey<FieldOwner>(d => d.UId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Field_Owne__u_id__403A8C7D");
        });

        modelBuilder.Entity<Image>(entity =>
        {
            entity.HasKey(e => e.ImgId).HasName("PK__Image__6F16A71C31863106");

            entity.ToTable("Image");

            entity.Property(e => e.ImgId).HasColumnName("img_id");
            entity.Property(e => e.FacId).HasColumnName("fac_id");
            entity.Property(e => e.ImageUrl)
                .HasMaxLength(255)
                .HasColumnName("imageURL");

            entity.HasOne(d => d.Fac).WithMany(p => p.Images)
                .HasForeignKey(d => d.FacId)
                .HasConstraintName("FK__Image__fac_id__656C112C");
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(e => e.NotiId).HasName("PK__Notifica__FDA4F30A041D0B66");

            entity.ToTable("Notification");

            entity.Property(e => e.NotiId).HasColumnName("noti_id");
            entity.Property(e => e.Content).HasColumnName("content");
            entity.Property(e => e.CreateAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime")
                .HasColumnName("create_at");
            entity.Property(e => e.IsRead)
                .HasDefaultValue(false)
                .HasColumnName("is_read");
            entity.Property(e => e.Type)
                .HasMaxLength(50)
                .HasColumnName("type");
            entity.Property(e => e.Uid).HasColumnName("uid");

            entity.HasOne(d => d.UidNavigation).WithMany(p => p.Notifications)
                .HasForeignKey(d => d.Uid)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Notificatio__uid__74AE54BC");
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => e.OrderId).HasName("PK__Order__46596229B3B2F0E1");

            entity.ToTable("Order");

            entity.Property(e => e.OrderId).HasColumnName("order_id");
            entity.Property(e => e.BookingId).HasColumnName("booking_id");
            entity.Property(e => e.ContentPayment).HasColumnName("content_payment");
            entity.Property(e => e.CreateAt)
                .HasColumnType("datetime")
                .HasColumnName("create_at");
            entity.Property(e => e.CustomerId).HasColumnName("customer_id");
            entity.Property(e => e.DiscountId).HasColumnName("discount_id");
            entity.Property(e => e.FacId).HasColumnName("fac_id");
            entity.Property(e => e.GuestName)
                .HasMaxLength(100)
                .HasColumnName("guest_name");
            entity.Property(e => e.GuestPhone)
                .HasMaxLength(20)
                .HasColumnName("guest_phone");
            entity.Property(e => e.StatusPayment)
                .HasMaxLength(50)
                .HasColumnName("status_payment");
            entity.Property(e => e.TotalAmount)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("total_amount");

            entity.HasOne(d => d.Booking).WithMany(p => p.Orders)
                .HasForeignKey(d => d.BookingId)
                .HasConstraintName("FK__Order__booking_i__09A971A2");

            entity.HasOne(d => d.Customer).WithMany(p => p.Orders)
                .HasForeignKey(d => d.CustomerId)
                .HasConstraintName("FK__Order__customer___06CD04F7");

            entity.HasOne(d => d.Discount).WithMany(p => p.Orders)
                .HasForeignKey(d => d.DiscountId)
                .HasConstraintName("FK__Order__discount___08B54D69");

            entity.HasOne(d => d.Fac).WithMany(p => p.Orders)
                .HasForeignKey(d => d.FacId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Order__fac_id__07C12930");
        });

        modelBuilder.Entity<OrderFieldId>(entity =>
        {
            entity.HasKey(e => e.OrderFieldId1).HasName("PK__Order_fi__3E76E2B5B80470B9");

            entity.ToTable("Order_field_id");

            entity.Property(e => e.OrderFieldId1).HasColumnName("order_field_id");
            entity.Property(e => e.FieldId).HasColumnName("field_id");
            entity.Property(e => e.OrderId).HasColumnName("order_id");

            entity.HasOne(d => d.Field).WithMany(p => p.OrderFieldIds)
                .HasForeignKey(d => d.FieldId)
                .HasConstraintName("FK__Order_fie__field__123EB7A3");

            entity.HasOne(d => d.Order).WithMany(p => p.OrderFieldIds)
                .HasForeignKey(d => d.OrderId)
                .HasConstraintName("FK__Order_fie__order__114A936A");
        });

        modelBuilder.Entity<OrderService>(entity =>
        {
            entity.HasKey(e => e.OrderServiceId).HasName("PK__Order_Se__88196EDDA9DCE202");

            entity.ToTable("Order_Service");

            entity.Property(e => e.OrderServiceId).HasColumnName("order_service_id");
            entity.Property(e => e.OrderId).HasColumnName("order_id");
            entity.Property(e => e.Price)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("price");
            entity.Property(e => e.Quantity).HasColumnName("quantity");
            entity.Property(e => e.ServiceId).HasColumnName("service_id");

            entity.HasOne(d => d.Order).WithMany(p => p.OrderServices)
                .HasForeignKey(d => d.OrderId)
                .HasConstraintName("FK__Order_Ser__order__0D7A0286");

            entity.HasOne(d => d.Service).WithMany(p => p.OrderServices)
                .HasForeignKey(d => d.ServiceId)
                .HasConstraintName("FK__Order_Ser__servi__0E6E26BF");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.RoleId).HasName("PK__Role__760965CC467F450A");

            entity.ToTable("Role");

            entity.Property(e => e.RoleId)
                .ValueGeneratedNever()
                .HasColumnName("role_id");
            entity.Property(e => e.RoleName)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("role_name");
        });

        modelBuilder.Entity<Service>(entity =>
        {
            entity.HasKey(e => e.ServiceId).HasName("PK__Service__3E0DB8AF597A3E39");

            entity.ToTable("Service");

            entity.Property(e => e.ServiceId).HasColumnName("service_id");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.FacId).HasColumnName("fac_id");
            entity.Property(e => e.Image)
                .HasMaxLength(255)
                .HasColumnName("image");
            entity.Property(e => e.Price)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("price");
            entity.Property(e => e.ServiceName)
                .HasMaxLength(100)
                .HasColumnName("service_name");
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasColumnName("status");

            entity.HasOne(d => d.Fac).WithMany(p => p.Services)
                .HasForeignKey(d => d.FacId)
                .HasConstraintName("FK__Service__fac_id__00200768");
        });

        modelBuilder.Entity<Staff>(entity =>
        {
            entity.HasKey(e => e.UId).HasName("PK__Staff__B51D3DEACC3A20CE");

            entity.Property(e => e.UId)
                .ValueGeneratedNever()
                .HasColumnName("u_id");
            entity.Property(e => e.Dob).HasColumnName("dob");
            entity.Property(e => e.EndTime)
                .HasColumnType("datetime")
                .HasColumnName("end_time");
            entity.Property(e => e.Image)
                .HasMaxLength(255)
                .HasColumnName("image");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .HasColumnName("name");
            entity.Property(e => e.Phone)
                .HasMaxLength(20)
                .HasColumnName("phone");
            entity.Property(e => e.StartTime)
                .HasColumnType("datetime")
                .HasColumnName("start_time");

            entity.HasOne(d => d.UIdNavigation).WithOne(p => p.Staff)
                .HasForeignKey<Staff>(d => d.UId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK__Staff__u_id__6FE99F9F");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UId).HasName("PK__User__B51D3DEAB3C7A2A5");

            entity.ToTable("User");

            entity.Property(e => e.UId).HasColumnName("u_id");
            entity.Property(e => e.IsExternalLogin).HasColumnName("is_external_login");
            entity.Property(e => e.IsVerify).HasColumnName("is_verify");
            entity.Property(e => e.RoleId).HasColumnName("role_id");
            entity.Property(e => e.UCreateDate)
                .HasColumnType("datetime")
                .HasColumnName("u_create_date");
            entity.Property(e => e.UEmail)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("u_email");
            entity.Property(e => e.UPassword)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("u_password");
            entity.Property(e => e.UStatus)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasColumnName("u_status");

            entity.HasOne(d => d.Role).WithMany(p => p.Users)
                .HasForeignKey(d => d.RoleId)
                .HasConstraintName("FK__User__role_id__3A81B327");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
