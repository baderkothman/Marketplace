namespace MarketplaceApi.Models;

public class ServiceImage
{
    public int Id { get; set; }
    public string Url { get; set; } = string.Empty;
    public bool IsPrimary { get; set; } = false;

    public int ServiceId { get; set; }
    public Service Service { get; set; } = null!;
}
