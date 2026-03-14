using Microsoft.EntityFrameworkCore;
using KarnelTravels.API.Entities;
using Route = KarnelTravels.API.Entities.Route;

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
    public DbSet<HotelRoomAvailability> HotelRoomAvailabilities => Set<HotelRoomAvailability>();
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
    public DbSet<VehicleType> VehicleTypes => Set<VehicleType>();
    public DbSet<TransportProvider> TransportProviders => Set<TransportProvider>();
    public DbSet<Vehicle> Vehicles => Set<Vehicle>();
    public DbSet<Route> Routes => Set<Route>();
    public DbSet<Schedule> Schedules => Set<Schedule>();

    // Tour Management
    public DbSet<Tour> Tours => Set<Tour>();
    public DbSet<TourDestination> TourDestinations => Set<TourDestination>();
    public DbSet<TourDeparture> TourDepartures => Set<TourDeparture>();
    public DbSet<TourService> TourServices => Set<TourService>();
    public DbSet<TourGuide> TourGuides => Set<TourGuide>();
    public DbSet<TourImage> TourImages => Set<TourImage>();

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
            entity.Property(e => e.TargetType).HasConversion<int>();
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

        // VehicleType
        modelBuilder.Entity<VehicleType>(entity =>
        {
            entity.HasKey(e => e.VehicleTypeId);
            entity.HasIndex(e => e.Name);
        });

        // TransportProvider
        modelBuilder.Entity<TransportProvider>(entity =>
        {
            entity.HasKey(e => e.ProviderId);
            entity.HasIndex(e => e.Name);
            entity.HasMany(p => p.Vehicles)
                .WithOne(v => v.Provider)
                .HasForeignKey(v => v.ProviderId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Vehicle
        modelBuilder.Entity<Vehicle>(entity =>
        {
            entity.HasKey(e => e.VehicleId);
            entity.HasIndex(e => e.Name);
            entity.HasIndex(e => e.LicensePlate).IsUnique();
            entity.HasIndex(e => e.Status);
            entity.HasOne(v => v.VehicleType)
                .WithMany(vt => vt.Vehicles)
                .HasForeignKey(v => v.VehicleTypeId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.Property(e => e.Status).HasConversion<int>();
        });

        // Route
        modelBuilder.Entity<Route>(entity =>
        {
            entity.HasKey(e => e.RouteId);
            entity.HasIndex(e => e.DepartureLocation);
            entity.HasIndex(e => e.ArrivalLocation);
            entity.HasMany(r => r.Schedules)
                .WithOne(s => s.Route)
                .HasForeignKey(s => s.RouteId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Schedule
        modelBuilder.Entity<Schedule>(entity =>
        {
            entity.HasKey(e => e.ScheduleId);
            entity.HasIndex(e => e.DepartureTime);
            entity.HasIndex(e => e.Status);
            entity.HasOne(s => s.Vehicle)
                .WithMany(v => v.Schedules)
                .HasForeignKey(s => s.VehicleId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.Property(e => e.Status).HasConversion<int>();
        });

        // Tour
        modelBuilder.Entity<Tour>(entity =>
        {
            entity.HasIndex(e => e.Name);
            entity.HasIndex(e => e.Status);
            entity.Property(e => e.Status).HasConversion<int>();
            entity.HasMany(t => t.Itineraries)
                .WithOne(i => i.Tour)
                .HasForeignKey(i => i.TourId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasMany(t => t.Destinations)
                .WithOne(d => d.Tour)
                .HasForeignKey(d => d.TourId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasMany(t => t.Departures)
                .WithOne(d => d.Tour)
                .HasForeignKey(d => d.TourId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasMany(t => t.Services)
                .WithOne(s => s.Tour)
                .HasForeignKey(s => s.TourId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasMany(t => t.TourGuides)
                .WithMany(g => g.Tours)
                .UsingEntity(j => j.ToTable("TourTourGuides"));
            entity.HasMany(t => t.Images)
                .WithOne(i => i.Tour)
                .HasForeignKey(i => i.TourId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasMany(t => t.Bookings)
                .WithOne(b => b.Tour)
                .HasForeignKey(b => b.TourId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Tour Itinerary
        modelBuilder.Entity<TourItinerary>(entity =>
        {
            entity.HasIndex(e => new { e.TourId, e.DayNumber }).IsUnique();
        });

        // Tour Destination
        modelBuilder.Entity<TourDestination>(entity =>
        {
            entity.HasIndex(e => new { e.TourId, e.TouristSpotId }).IsUnique();
            entity.HasOne(d => d.TouristSpot)
                .WithMany()
                .HasForeignKey(d => d.TouristSpotId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Tour Departure
        modelBuilder.Entity<TourDeparture>(entity =>
        {
            entity.HasIndex(e => new { e.TourId, e.DepartureDate }).IsUnique();
        });

        // Tour Service
        modelBuilder.Entity<TourService>(entity =>
        {
            entity.Property(e => e.Category).HasConversion<int>();
        });

        // Tour Guide
        modelBuilder.Entity<TourGuide>(entity =>
        {
            entity.HasIndex(e => e.Email).IsUnique();
        });
    }
}
