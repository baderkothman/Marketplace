using System.ComponentModel.DataAnnotations;

namespace MarketplaceApi.DTOs.Auth;

public class RegisterDto
{
    [Required] public string FullName { get; set; } = string.Empty;
    [Required, EmailAddress] public string Email { get; set; } = string.Empty;

    [Required, MinLength(12)]
    [RegularExpression(
        @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{12,}$",
        ErrorMessage = "Password must be at least 12 characters and include uppercase, lowercase, number, and symbol.")]
    public string Password { get; set; } = string.Empty;

    [Required] public string Role { get; set; } = "Customer";
}
