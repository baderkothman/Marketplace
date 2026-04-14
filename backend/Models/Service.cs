namespace MarketplaceApi.Models;

public class Service
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string? DeliveryTime { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public string VendorId { get; set; } = string.Empty;
    public ApplicationUser Vendor { get; set; } = null!;

    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!;

    public ICollection<ServiceImage> Images { get; set; } = new List<ServiceImage>();
    public ICollection<Order> Orders { get; set; } = new List<Order>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();

    public double AverageRating => Reviews.Any() ? Reviews.Average(r => r.Rating) : 0;
    public int TotalReviews => Reviews.Count;
    public int TotalOrders => Orders.Count;
}
