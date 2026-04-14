using System.ComponentModel.DataAnnotations;

namespace MarketplaceApi.DTOs.Orders;

public class OrderDto
{
    public int Id { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal TotalPrice { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public string CustomerId { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;

    public int ServiceId { get; set; }
    public string ServiceTitle { get; set; } = string.Empty;
    public string? ServiceImage { get; set; }

    public string VendorId { get; set; } = string.Empty;
    public string VendorName { get; set; } = string.Empty;

    public bool HasReview { get; set; }
}

public class CreateOrderDto
{
    [Required] public int ServiceId { get; set; }
    public string? Notes { get; set; }
}

public class UpdateOrderStatusDto
{
    [Required] public string Status { get; set; } = string.Empty;
}
