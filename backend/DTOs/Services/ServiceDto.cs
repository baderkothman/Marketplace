using System.ComponentModel.DataAnnotations;

namespace MarketplaceApi.DTOs.Services;

public class ServiceDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string? DeliveryTime { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public double AverageRating { get; set; }
    public int TotalReviews { get; set; }
    public int TotalOrders { get; set; }

    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;

    public string VendorId { get; set; } = string.Empty;
    public string VendorName { get; set; } = string.Empty;
    public string? VendorAvatar { get; set; }
    public string? VendorBio { get; set; }

    public List<string> ImageUrls { get; set; } = new();
}

public class CreateServiceDto
{
    [Required] public string Title { get; set; } = string.Empty;
    [Required] public string Description { get; set; } = string.Empty;
    [Required, Range(0.01, 100000)] public decimal Price { get; set; }
    public string? DeliveryTime { get; set; }
    [Required] public int CategoryId { get; set; }
    public List<string> ImageUrls { get; set; } = new();
}

public class UpdateServiceDto
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    [Range(0.01, 100000)] public decimal? Price { get; set; }
    public string? DeliveryTime { get; set; }
    public int? CategoryId { get; set; }
    public bool? IsActive { get; set; }
    public List<string>? ImageUrls { get; set; }
}

public class ServiceQueryParams
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 12;
    public string? Search { get; set; }
    public int? CategoryId { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public string SortBy { get; set; } = "newest"; // newest, price_asc, price_desc, rating
}
