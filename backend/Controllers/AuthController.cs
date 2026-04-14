using MarketplaceApi.DTOs.Auth;
using MarketplaceApi.Models;
using MarketplaceApi.Services;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace MarketplaceApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[EnableRateLimiting("auth")]
[ResponseCache(NoStore = true, Location = ResponseCacheLocation.None)]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ITokenService _tokenService;

    public AuthController(UserManager<ApplicationUser> userManager, ITokenService tokenService)
    {
        _userManager = userManager;
        _tokenService = tokenService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var role = dto.Role.Trim();
        if (!new[] { "Customer", "Vendor" }.Contains(role))
            return BadRequest(new { message = "Invalid role. Choose Customer or Vendor." });

        var email = dto.Email.Trim().ToLowerInvariant();
        var existing = await _userManager.FindByEmailAsync(email);
        if (existing is not null)
            return Conflict(new { message = "Email already registered." });

        var user = new ApplicationUser
        {
            UserName = email,
            Email = email,
            FullName = dto.FullName.Trim(),
            EmailConfirmed = true,
            LockoutEnabled = true
        };

        var result = await _userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
            return BadRequest(new { errors = result.Errors.Select(e => e.Description) });

        await _userManager.AddToRoleAsync(user, role);

        var roles = await _userManager.GetRolesAsync(user);
        return Ok(new AuthResponseDto
        {
            Token = _tokenService.GenerateToken(user, roles),
            UserId = user.Id,
            Email = user.Email!,
            FullName = user.FullName,
            Role = roles.FirstOrDefault() ?? role,
            ExpiresAt = _tokenService.GetExpiryDate()
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var user = await _userManager.FindByEmailAsync(dto.Email.Trim().ToLowerInvariant());
        if (user is null)
            return Unauthorized(new { message = "Invalid email or password." });

        if (!user.IsActive)
            return Unauthorized(new { message = "Account is deactivated." });

        if (await _userManager.IsLockedOutAsync(user))
            return StatusCode(StatusCodes.Status423Locked, new { message = "Account locked after repeated failures. Try again later." });

        if (!await _userManager.CheckPasswordAsync(user, dto.Password))
        {
            await _userManager.AccessFailedAsync(user);
            if (await _userManager.IsLockedOutAsync(user))
                return StatusCode(StatusCodes.Status423Locked, new { message = "Account locked after repeated failures. Try again later." });

            return Unauthorized(new { message = "Invalid email or password." });
        }

        await _userManager.ResetAccessFailedCountAsync(user);
        var roles = await _userManager.GetRolesAsync(user);

        return Ok(new AuthResponseDto
        {
            Token = _tokenService.GenerateToken(user, roles),
            UserId = user.Id,
            Email = user.Email!,
            FullName = user.FullName,
            Role = roles.FirstOrDefault() ?? "Customer",
            ExpiresAt = _tokenService.GetExpiryDate()
        });
    }
}
