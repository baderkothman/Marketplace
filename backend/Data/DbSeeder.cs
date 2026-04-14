using MarketplaceApi.Models;
using Microsoft.AspNetCore.Identity;

namespace MarketplaceApi.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
        var db = services.GetRequiredService<AppDbContext>();

        // Ensure DB is created
        await db.Database.EnsureCreatedAsync();

        // Seed roles
        string[] roles = ["Admin", "Vendor", "Customer"];
        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
                await roleManager.CreateAsync(new IdentityRole(role));
        }

        // Seed admin user
        const string adminEmail = "admin@marketplace.com";
        if (await userManager.FindByEmailAsync(adminEmail) is null)
        {
            var admin = new ApplicationUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                FullName = "System Admin",
                EmailConfirmed = true
            };
            var result = await userManager.CreateAsync(admin, "Admin@123");
            if (result.Succeeded)
                await userManager.AddToRoleAsync(admin, "Admin");
        }

        // Seed categories
        if (!db.Categories.Any())
        {
            db.Categories.AddRange(
                new Category { Name = "Web Development", Description = "Websites, web apps, and APIs" },
                new Category { Name = "Graphic Design", Description = "Logos, branding, and visual design" },
                new Category { Name = "Digital Marketing", Description = "SEO, social media, and ads" },
                new Category { Name = "Video & Animation", Description = "Videos, motion graphics, and editing" },
                new Category { Name = "Writing & Translation", Description = "Content, copywriting, and translation" },
                new Category { Name = "Mobile Development", Description = "iOS and Android applications" }
            );
            await db.SaveChangesAsync();
        }
    }
}
