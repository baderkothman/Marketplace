using System.ComponentModel.DataAnnotations;

namespace MarketplaceApi.DTOs.Reviews;

public class ReviewDto
{
    public int Id { get; set; }
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    public string CustomerId { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string? CustomerAvatar { get; set; }

    public int ServiceId { get; set; }
    public int OrderId { get; set; }
}

public class CreateReviewDto
{
    [Required] public int OrderId { get; set; }
    [Required, Range(1, 5)] public int Rating { get; set; }
    [Required] public string Comment { get; set; } = string.Empty;
}
