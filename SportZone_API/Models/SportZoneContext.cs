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

    public virtual DbSet<Customer> Customers { get; set; }

    public virtual DbSet<ExternalLogin> ExternalLogins { get; set; }

    public virtual DbSet<FieldOwner> FieldOwners { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

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
