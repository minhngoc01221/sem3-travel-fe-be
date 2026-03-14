using Microsoft.EntityFrameworkCore;
using KarnelTravels.API.Entities;

namespace KarnelTravels.API.Data;

public class KarnelTravelsDbContext : DbContext
{
    public KarnelTravelsDbContext(DbContextOptions<KarnelTravelsDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Address> Addresses => Set<Address>();
    public DbSet<TouristSpot> TouristSpots => Set<TouristSpot>();
    public DbSet<Hotel> Hotels => Set<Hotel>();
    public DbSet<HotelRoom> HotelRooms => Set<HotelRoom>();
    public DbSet<Restaurant> Restaurants => Set<Restaurant>();
    public DbSet<Resort> Resorts => Set<Resort>();
    public DbSet<ResortRoom> ResortRooms => Set<ResortRoom>();
    public DbSet<Transport> Transports => Set<Transport>();
    public DbSet<TourPackage> TourPackages => Set<TourPackage>();
    public DbSet<TourItinerary> TourItineraries => Set<TourItinerary>();
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<Promotion> Promotions => Set<Promotion>();
    public DbSet<Contact> Contacts => Set<Contact>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<Favorite> Favorites => Set<Favorite>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Role).HasConversion<int>();
        });

        // Address
        modelBuilder.Entity<Address>(entity =>
        {
            entity.HasOne(a => a.User)
                .WithMany(u => u.Addresses)
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // TouristSpot
        modelBuilder.Entity<TouristSpot>(entity =>
        {
            entity.HasIndex(e => e.Name);
            entity.HasIndex(e => e.City);
        });

        // Hotel
        modelBuilder.Entity<Hotel>(entity =>
        {
            entity.HasIndex(e => e.Name);
            entity.HasIndex(e => e.City);
            entity.HasMany(h => h.Rooms)
                .WithOne(r => r.Hotel)
                .HasForeignKey(r => r.HotelId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Restaurant
        modelBuilder.Entity<Restaurant>(entity =>
        {
            entity.HasIndex(e => e.Name);
            entity.HasIndex(e => e.City);
        });

        // Resort
        modelBuilder.Entity<Resort>(entity =>
        {
            entity.HasIndex(e => e.Name);
            entity.HasIndex(e => e.City);
            entity.HasMany(r => r.Rooms)
                .WithOne(rr => rr.Resort)
                .HasForeignKey(rr => rr.ResortId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Transport
        modelBuilder.Entity<Transport>(entity =>
        {
            entity.HasIndex(e => e.FromCity);
            entity.HasIndex(e => e.ToCity);
            entity.HasIndex(e => e.Type);
        });

        // TourPackage
        modelBuilder.Entity<TourPackage>(entity =>
        {
            entity.HasIndex(e => e.Name);
            entity.HasIndex(e => e.Destination);
            entity.HasMany(t => t.Itineraries)
                .WithOne(i => i.TourPackage)
                .HasForeignKey(i => i.TourPackageId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Booking
        modelBuilder.Entity<Booking>(entity =>
        {
            entity.HasIndex(e => e.BookingCode).IsUnique();
            entity.HasIndex(e => e.Status);
            entity.HasOne(b => b.User)
                .WithMany(u => u.Bookings)
                .HasForeignKey(b => b.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(b => b.TourPackage)
                .WithMany(t => t.Bookings)
                .HasForeignKey(b => b.TourPackageId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(b => b.Hotel)
                .WithMany(h => h.Bookings)
                .HasForeignKey(b => b.HotelId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(b => b.HotelRoom)
                .WithMany(r => r.Bookings)
                .HasForeignKey(b => b.HotelRoomId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(b => b.Resort)
                .WithMany(r => r.Bookings)
                .HasForeignKey(b => b.ResortId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(b => b.ResortRoom)
                .WithMany(rr => rr.Bookings)
                .HasForeignKey(b => b.ResortRoomId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(b => b.Transport)
                .WithMany(t => t.Bookings)
                .HasForeignKey(b => b.TransportId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(b => b.Promotion)
                .WithMany(p => p.Bookings)
                .HasForeignKey(b => b.PromotionId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(b => b.Restaurant)
                .WithMany(r => r.Bookings)
                .HasForeignKey(b => b.RestaurantId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.Property(e => e.Type).HasConversion<int>();
            entity.Property(e => e.Status).HasConversion<int>();
            entity.Property(e => e.PaymentStatus).HasConversion<int>();
        });

        // Promotion
        modelBuilder.Entity<Promotion>(entity =>
        {
            entity.HasIndex(e => e.Code).IsUnique();
            entity.Property(e => e.DiscountType).HasConversion<int>();
        });

        // Contact
        modelBuilder.Entity<Contact>(entity =>
        {
            entity.HasIndex(e => e.Status);
            entity.HasOne(c => c.User)
                .WithMany(u => u.Contacts)
                .HasForeignKey(c => c.UserId)
                .OnDelete(DeleteBehavior.SetNull);
            entity.Property(e => e.Status).HasConversion<int>();
        });

        // Review
        modelBuilder.Entity<Review>(entity =>
        {
            entity.HasIndex(e => e.Type);
            entity.HasOne(r => r.User)
                .WithMany(u => u.Reviews)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(r => r.TouristSpot)
                .WithMany(ts => ts.Reviews)
                .HasForeignKey(r => r.TouristSpotId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(r => r.Hotel)
                .WithMany(h => h.Reviews)
                .HasForeignKey(r => r.HotelId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(r => r.Restaurant)
                .WithMany(rest => rest.Reviews)
                .HasForeignKey(r => r.RestaurantId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(r => r.Resort)
                .WithMany(res => res.Reviews)
                .HasForeignKey(r => r.ResortId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(r => r.TourPackage)
                .WithMany(t => t.Reviews)
                .HasForeignKey(r => r.TourPackageId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(r => r.Booking)
                .WithMany(b => b.Reviews)
                .HasForeignKey(r => r.BookingId)
                .OnDelete(DeleteBehavior.SetNull);
            entity.Property(e => e.Type).HasConversion<int>();
        });

        // Favorite
        modelBuilder.Entity<Favorite>(entity =>
        {
            entity.HasOne(f => f.User)
                .WithMany(u => u.Favorites)
                .HasForeignKey(f => f.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.Property(e => e.ItemType).HasConversion<int>();
        });
    }
}
