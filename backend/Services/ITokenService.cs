using MarketplaceApi.Models;

namespace MarketplaceApi.Services;

public interface ITokenService
{
    string GenerateToken(ApplicationUser user, IList<string> roles);
    DateTime GetExpiryDate();
}
