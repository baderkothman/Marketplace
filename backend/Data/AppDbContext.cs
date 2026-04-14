using MarketplaceApi.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace MarketplaceApi.Data;

public class AppDbContext : IdentityDbContext<ApplicationUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Service> Services => Set<Service>();
    public DbSet<ServiceImage> ServiceImages => Set<ServiceImage>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<Review> Reviews => Set<Review>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Service>(e =>
        {
            e.Property(s => s.Price).HasColumnType("decimal(18,2)");
            e.HasOne(s => s.Vendor)
             .WithMany(u => u.Services)
             .HasForeignKey(s => s.VendorId)
             .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(s => s.Category)
             .WithMany(c => c.Services)
             .HasForeignKey(s => s.CategoryId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<Order>(e =>
        {
            e.Property(o => o.TotalPrice).HasColumnType("decimal(18,2)");
            e.Property(o => o.Status).HasConversion<string>();
            e.HasOne(o => o.Customer)
             .WithMany(u => u.CustomerOrders)
             .HasForeignKey(o => o.CustomerId)
             .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(o => o.Service)
             .WithMany(s => s.Orders)
             .HasForeignKey(o => o.ServiceId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        builder.Entity<Review>(e =>
        {
            e.HasOne(r => r.Customer)
             .WithMany(u => u.Reviews)
             .HasForeignKey(r => r.CustomerId)
             .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(r => r.Service)
             .WithMany(s => s.Reviews)
             .HasForeignKey(r => r.ServiceId)
             .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(r => r.Order)
             .WithOne(o => o.Review)
             .HasForeignKey<Review>(r => r.OrderId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<ServiceImage>(e =>
        {
            e.HasOne(i => i.Service)
             .WithMany(s => s.Images)
             .HasForeignKey(i => i.ServiceId)
             .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
