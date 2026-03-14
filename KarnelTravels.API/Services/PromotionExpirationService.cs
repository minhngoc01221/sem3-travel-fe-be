using KarnelTravels.API.Data;
using KarnelTravels.API.Entities;
using Microsoft.EntityFrameworkCore;

namespace KarnelTravels.API.Services;

public class PromotionExpirationService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<PromotionExpirationService> _logger;
    private readonly TimeSpan _checkInterval = TimeSpan.FromMinutes(5); // Check every 5 minutes

    public PromotionExpirationService(
        IServiceScopeFactory scopeFactory,
        ILogger<PromotionExpirationService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Promotion Expiration Service started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CheckAndExpirePromotions();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while checking promotion expirations");
            }

            await Task.Delay(_checkInterval, stoppingToken);
        }
    }

    private async Task CheckAndExpirePromotions()
    {
        using var scope = _scopeFactory.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<KarnelTravelsDbContext>();

        var now = DateTime.Now;

        // Find promotions that should be deactivated (past end date but still marked as active)
        var expiredPromotions = await context.Promotions
            .Where(p => p.IsActive && p.EndDate < now)
            .ToListAsync();

        if (expiredPromotions.Any())
        {
            foreach (var promotion in expiredPromotions)
            {
                promotion.IsActive = false;
                promotion.UpdatedAt = DateTime.UtcNow;
                _logger.LogInformation("Promotion {Code} has been deactivated (expired)", promotion.Code);
            }

            await context.SaveChangesAsync();
            _logger.LogInformation("Deactivated {Count} expired promotions", expiredPromotions.Count);
        }

        // Find promotions that should be activated (start date reached)
        var upcomingPromotions = await context.Promotions
            .Where(p => !p.IsActive && p.StartDate <= now && p.EndDate >= now)
            .ToListAsync();

        if (upcomingPromotions.Any())
        {
            foreach (var promotion in upcomingPromotions)
            {
                promotion.IsActive = true;
                promotion.UpdatedAt = DateTime.UtcNow;
                _logger.LogInformation("Promotion {Code} has been activated (start date reached)", promotion.Code);
            }

            await context.SaveChangesAsync();
            _logger.LogInformation("Activated {Count} promotions (start date reached)", upcomingPromotions.Count);
        }
    }
}
