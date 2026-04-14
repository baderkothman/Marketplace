using MarketplaceApi.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace MarketplaceApi.Data;

public static class DbSeeder
{
    public const string AdminPassword = "Admin#Serviqo2026!";
    public const string VendorPassword = "Vendor#Serviqo2026!";
    public const string CustomerPassword = "Customer#Serviqo2026!";

    public static async Task SeedAsync(IServiceProvider services)
    {
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
        var db = services.GetRequiredService<AppDbContext>();

        await db.Database.EnsureCreatedAsync();
        await EnsureRolesAsync(roleManager);
        var categories = await SeedCategoriesAsync(db);

        await EnsureUserAsync(userManager, new SeedUser("System Admin", "admin@marketplace.com", "Platform operations lead.", "https://randomuser.me/api/portraits/men/32.jpg"), "Admin", AdminPassword);

        var vendors = await EnsureVendorsAsync(userManager);
        var customers = await EnsureCustomersAsync(userManager);

        await SeedServicesAsync(db, vendors, categories);
        await SeedOrdersAsync(db, customers);
        await SeedReviewsAsync(db);
    }

    private static async Task EnsureRolesAsync(RoleManager<IdentityRole> roleManager)
    {
        foreach (var role in new[] { "Admin", "Vendor", "Customer" })
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole(role));
            }
        }
    }

    private static async Task<Dictionary<string, int>> SeedCategoriesAsync(AppDbContext db)
    {
        var seeds = new[]
        {
            new SeedCategory("Web Development", "Web apps, portals, APIs, and storefronts.", "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80"),
            new SeedCategory("Mobile Development", "iOS, Android, and cross-platform product work.", "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=900&q=80"),
            new SeedCategory("UI/UX Design", "Design systems, product flows, and interface polish.", "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=900&q=80"),
            new SeedCategory("Branding & Graphic Design", "Identity work, campaigns, packaging, and decks.", "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80"),
            new SeedCategory("Digital Marketing", "Paid media, lifecycle, SEO, and growth systems.", "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80"),
            new SeedCategory("Video & Animation", "Explainers, reels, edits, and motion assets.", "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=900&q=80"),
            new SeedCategory("Writing & Translation", "Copywriting, localization, and case studies.", "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=80"),
            new SeedCategory("Photography & Content Production", "Product, lifestyle, and content shoots.", "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80")
        };

        foreach (var seed in seeds)
        {
            var existing = await db.Categories.FirstOrDefaultAsync(c => c.Name == seed.Name);
            if (existing is null)
            {
                db.Categories.Add(new Category { Name = seed.Name, Description = seed.Description, IconUrl = seed.IconUrl });
            }
            else
            {
                existing.Description = seed.Description;
                existing.IconUrl = seed.IconUrl;
            }
        }

        await db.SaveChangesAsync();
        return await db.Categories.ToDictionaryAsync(c => c.Name, c => c.Id);
    }

    private static async Task<List<ApplicationUser>> EnsureVendorsAsync(UserManager<ApplicationUser> userManager)
    {
        var names = new[]
        {
            "Maya Chen", "Omar Haddad", "Sofia Martinez", "Daniel Brooks", "Leila Nasser",
            "Noah Bennett", "Ava Sullivan", "Youssef Karim", "Emma Clarke", "Karim Saad",
            "Nina Petrov", "Luca Rossi", "Hana Kim", "Ethan Cole", "Jana El Khoury",
            "Marcus Reed", "Rania Faris", "Julian Torres", "Fatima Zahra", "Adrian Walker"
        };

        var specialtySets = new[]
        {
            new[] { "Web Development", "UI/UX Design", "Digital Marketing" },
            new[] { "Digital Marketing", "Writing & Translation", "Branding & Graphic Design" },
            new[] { "UI/UX Design", "Mobile Development", "Branding & Graphic Design" },
            new[] { "Web Development", "Mobile Development", "UI/UX Design" },
            new[] { "Branding & Graphic Design", "Writing & Translation", "Photography & Content Production" },
            new[] { "Video & Animation", "Digital Marketing", "Photography & Content Production" },
            new[] { "UI/UX Design", "Web Development", "Mobile Development" },
            new[] { "Writing & Translation", "Digital Marketing", "Branding & Graphic Design" },
            new[] { "Photography & Content Production", "Branding & Graphic Design", "Digital Marketing" },
            new[] { "Mobile Development", "Web Development", "UI/UX Design" },
            new[] { "Branding & Graphic Design", "Photography & Content Production", "Video & Animation" },
            new[] { "Digital Marketing", "Writing & Translation", "Video & Animation" },
            new[] { "UI/UX Design", "Web Development", "Branding & Graphic Design" },
            new[] { "Web Development", "Mobile Development", "Digital Marketing" },
            new[] { "Photography & Content Production", "Video & Animation", "Branding & Graphic Design" },
            new[] { "Writing & Translation", "Digital Marketing", "Web Development" },
            new[] { "Digital Marketing", "UI/UX Design", "Writing & Translation" },
            new[] { "Video & Animation", "Photography & Content Production", "Digital Marketing" },
            new[] { "Mobile Development", "UI/UX Design", "Writing & Translation" },
            new[] { "Web Development", "Branding & Graphic Design", "Digital Marketing" }
        };

        var users = new List<ApplicationUser>(20);
        for (var i = 0; i < names.Length; i++)
        {
            var bio = $"{specialtySets[i][0]} specialist known for clear communication, premium delivery, and tidy handoff files.";
            var avatar = i % 2 == 0
                ? $"https://randomuser.me/api/portraits/women/{12 + i}.jpg"
                : $"https://randomuser.me/api/portraits/men/{12 + i}.jpg";

            users.Add(await EnsureUserAsync(userManager, new SeedUser(names[i], $"vendor{i + 1:00}@marketplace.com", bio, avatar), "Vendor", VendorPassword));
        }

        return users;
    }

    private static async Task<List<ApplicationUser>> EnsureCustomersAsync(UserManager<ApplicationUser> userManager)
    {
        var firstNames = new[]
        {
            "Liam", "Olivia", "Elias", "Mila", "Samir", "Zoe", "Noor", "Adam", "Layla", "Jonah",
            "Sara", "Nadine", "Tariq", "Mira", "Owen", "Lina", "Nicolas", "Yara", "Ryan", "Chloe",
            "Hassan", "Ariana", "Jude", "Salma", "Leo", "Dalia", "Ivy", "Kareem", "Mason", "Reem",
            "Rami", "Talia", "Zayn", "Hana", "Evan", "Mariam", "Sami", "Elena", "Nour", "Maya",
            "Amir", "Clara", "Mazen", "Rita", "Zaid", "Celine", "Nabil", "Farah", "Peter", "Lara"
        };

        var lastNames = new[]
        {
            "Haddad", "Sayegh", "Turner", "Boulos", "Rahman", "Mansour", "Patel", "Rivera", "Khalil", "Hart",
            "Mitchell", "Abboud", "Faris", "Baker", "Morris", "Najjar", "Parker", "Khoury", "Diaz", "Barakat",
            "Miller", "Sabbagh", "Nguyen", "Rashid", "Hale", "Thomas", "Issa", "Lopez", "Ward", "Amin",
            "Shaw", "Saab", "Carter", "Abbott", "Costa", "Malik", "Younes", "Grant", "Salem", "Howard",
            "George", "Silva", "Kanaan", "Bennett", "Sfeir", "Ali", "Mercer", "Hanna", "Sader", "Nasser"
        };

        var users = new List<ApplicationUser>(50);
        for (var i = 0; i < 50; i++)
        {
            var fullName = $"{firstNames[i]} {lastNames[i]}";
            var email = $"{ToSlug(firstNames[i])}.{ToSlug(lastNames[i])}@marketplace.com";
            var bio = "Marketplace buyer using the platform for launch work, growth experiments, and customer-facing assets.";
            var avatar = i % 2 == 0
                ? $"https://randomuser.me/api/portraits/men/{20 + i}.jpg"
                : $"https://randomuser.me/api/portraits/women/{20 + i}.jpg";

            users.Add(await EnsureUserAsync(userManager, new SeedUser(fullName, email, bio, avatar), "Customer", CustomerPassword));
        }

        return users;
    }

    private static async Task<ApplicationUser> EnsureUserAsync(UserManager<ApplicationUser> userManager, SeedUser seed, string role, string password)
    {
        var email = seed.Email.Trim().ToLowerInvariant();
        var user = await userManager.FindByEmailAsync(email);

        if (user is null)
        {
            user = new ApplicationUser
            {
                UserName = email,
                Email = email,
                FullName = seed.FullName,
                Bio = seed.Bio,
                AvatarUrl = seed.AvatarUrl,
                EmailConfirmed = true,
                LockoutEnabled = true,
                IsActive = true
            };

            var created = await userManager.CreateAsync(user, password);
            if (!created.Succeeded)
                throw new InvalidOperationException(string.Join(", ", created.Errors.Select(e => e.Description)));
        }
        else
        {
            user.UserName = email;
            user.Email = email;
            user.FullName = seed.FullName;
            user.Bio = seed.Bio;
            user.AvatarUrl = seed.AvatarUrl;
            user.EmailConfirmed = true;
            user.LockoutEnabled = true;
            user.IsActive = true;
            await userManager.UpdateAsync(user);
        }

        if (!await userManager.CheckPasswordAsync(user, password))
        {
            var token = await userManager.GeneratePasswordResetTokenAsync(user);
            var reset = await userManager.ResetPasswordAsync(user, token, password);
            if (!reset.Succeeded)
                throw new InvalidOperationException(string.Join(", ", reset.Errors.Select(e => e.Description)));
        }

        if (!await userManager.IsInRoleAsync(user, role))
        {
            var currentRoles = await userManager.GetRolesAsync(user);
            if (currentRoles.Count > 0) await userManager.RemoveFromRolesAsync(user, currentRoles);
            await userManager.AddToRoleAsync(user, role);
        }

        await userManager.ResetAccessFailedCountAsync(user);
        await userManager.SetLockoutEndDateAsync(user, null);
        return user;
    }

    private static async Task SeedServicesAsync(AppDbContext db, IReadOnlyList<ApplicationUser> vendors, IReadOnlyDictionary<string, int> categories)
    {
        if (await db.Services.CountAsync() >= 60) return;

        var servicePlans = new[]
        {
            new[] { "Web Development", "UI/UX Design", "Digital Marketing" },
            new[] { "Digital Marketing", "Writing & Translation", "Branding & Graphic Design" },
            new[] { "UI/UX Design", "Mobile Development", "Branding & Graphic Design" },
            new[] { "Web Development", "Mobile Development", "UI/UX Design" },
            new[] { "Branding & Graphic Design", "Writing & Translation", "Photography & Content Production" },
            new[] { "Video & Animation", "Digital Marketing", "Photography & Content Production" },
            new[] { "UI/UX Design", "Web Development", "Mobile Development" },
            new[] { "Writing & Translation", "Digital Marketing", "Branding & Graphic Design" },
            new[] { "Photography & Content Production", "Branding & Graphic Design", "Digital Marketing" },
            new[] { "Mobile Development", "Web Development", "UI/UX Design" },
            new[] { "Branding & Graphic Design", "Photography & Content Production", "Video & Animation" },
            new[] { "Digital Marketing", "Writing & Translation", "Video & Animation" },
            new[] { "UI/UX Design", "Web Development", "Branding & Graphic Design" },
            new[] { "Web Development", "Mobile Development", "Digital Marketing" },
            new[] { "Photography & Content Production", "Video & Animation", "Branding & Graphic Design" },
            new[] { "Writing & Translation", "Digital Marketing", "Web Development" },
            new[] { "Digital Marketing", "UI/UX Design", "Writing & Translation" },
            new[] { "Video & Animation", "Photography & Content Production", "Digital Marketing" },
            new[] { "Mobile Development", "UI/UX Design", "Writing & Translation" },
            new[] { "Web Development", "Branding & Graphic Design", "Digital Marketing" }
        };

        for (var i = 0; i < vendors.Count; i++)
        {
            if (await db.Services.AnyAsync(s => s.VendorId == vendors[i].Id)) continue;

            foreach (var category in servicePlans[i])
            {
                var template = GetServiceTemplate(category, i);
                db.Services.Add(new Service
                {
                    VendorId = vendors[i].Id,
                    CategoryId = categories[category],
                    Title = template.Title,
                    Description = template.Description,
                    Price = template.Price,
                    DeliveryTime = template.Delivery,
                    IsActive = (i + template.Index) % 9 != 0,
                    Images = GetImageUrls(category).Select((url, idx) => new ServiceImage { Url = url, IsPrimary = idx == 0 }).ToList()
                });
            }
        }

        await db.SaveChangesAsync();
    }

    private static async Task SeedOrdersAsync(AppDbContext db, IReadOnlyList<ApplicationUser> customers)
    {
        var services = await db.Services.OrderBy(s => s.Id).ToListAsync();
        var currentCount = await db.Orders.CountAsync();
        const int targetOrders = 180;
        if (currentCount >= targetOrders) return;

        for (var i = currentCount; i < targetOrders; i++)
        {
            var createdAt = DateTime.UtcNow.AddDays(-(i + 2));
            var status = (i % 6) switch
            {
                0 => OrderStatus.Completed,
                1 => OrderStatus.InProgress,
                2 => OrderStatus.Pending,
                3 => OrderStatus.Completed,
                4 => OrderStatus.Cancelled,
                _ => OrderStatus.Completed
            };

            var service = services[i % services.Count];
            db.Orders.Add(new Order
            {
                CustomerId = customers[(i * 3) % customers.Count].Id,
                ServiceId = service.Id,
                TotalPrice = service.Price,
                Notes = "Need a polished delivery with clean files and responsive communication.",
                Status = status,
                CreatedAt = createdAt,
                UpdatedAt = status == OrderStatus.Completed ? createdAt.AddDays(3) : createdAt.AddDays(1)
            });
        }

        await db.SaveChangesAsync();
    }

    private static async Task SeedReviewsAsync(AppDbContext db)
    {
        var comments = new[]
        {
            "Clear communication and a strong final delivery.",
            "Fast turnaround with smart revisions.",
            "Very polished outcome and easy to work with.",
            "Strong process from kickoff to handoff."
        };

        var currentCount = await db.Reviews.CountAsync();
        const int targetReviews = 120;
        if (currentCount >= targetReviews) return;

        var reviewedOrderIds = await db.Reviews.Select(r => r.OrderId).ToListAsync();
        var completedOrders = await db.Orders
            .Where(o => o.Status == OrderStatus.Completed && !reviewedOrderIds.Contains(o.Id))
            .OrderBy(o => o.Id)
            .ToListAsync();

        for (var i = 0; i < completedOrders.Count && currentCount + i < targetReviews; i++)
        {
            if (i % 4 == 1) continue;

            db.Reviews.Add(new Review
            {
                CustomerId = completedOrders[i].CustomerId,
                ServiceId = completedOrders[i].ServiceId,
                OrderId = completedOrders[i].Id,
                Rating = i % 7 == 0 ? 4 : 5,
                Comment = comments[i % comments.Length],
                CreatedAt = completedOrders[i].UpdatedAt.AddHours(12)
            });
        }

        await db.SaveChangesAsync();
    }

    private static (string Title, string Description, decimal Price, string Delivery, int Index) GetServiceTemplate(string category, int seed)
    {
        return category switch
        {
            "Web Development" => ($"Build a fast marketing site {seed % 2 + 1}", "Responsive web build with clean sections, CMS-ready structure, and analytics hooks.", 1450m + (seed % 4) * 90m, "10 days", 0),
            "Mobile Development" => ($"Ship a mobile MVP {seed % 2 + 1}", "Cross-platform app delivery with core flows, API integration, and release-ready QA.", 2100m + (seed % 4) * 110m, "16 days", 1),
            "UI/UX Design" => ($"Design a polished product experience {seed % 2 + 1}", "Product design system, key screens, flows, and interaction clarity for modern apps.", 1180m + (seed % 4) * 75m, "8 days", 2),
            "Branding & Graphic Design" => ($"Create a premium brand system {seed % 2 + 1}", "Identity kit, campaign visuals, and rollout-ready design files.", 980m + (seed % 4) * 60m, "7 days", 3),
            "Digital Marketing" => ($"Build a growth campaign system {seed % 2 + 1}", "Paid media, reporting, SEO, and lifecycle planning tailored to conversion goals.", 920m + (seed % 4) * 65m, "7 days", 4),
            "Video & Animation" => ($"Produce launch-ready motion content {seed % 2 + 1}", "Brand film edits, reels, explainers, and clean exports for web and social.", 1080m + (seed % 4) * 80m, "8 days", 5),
            "Writing & Translation" => ($"Write or localize conversion copy {seed % 2 + 1}", "Homepage copy, case studies, and localization work for customer-facing assets.", 620m + (seed % 4) * 45m, "5 days", 6),
            _ => ($"Produce premium brand photos {seed % 2 + 1}", "Commercial product or lifestyle images with retouching and export-ready files.", 990m + (seed % 4) * 70m, "6 days", 7)
        };
    }

    private static string[] GetImageUrls(string category) => category switch
    {
        "Web Development" => ["https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80"],
        "Mobile Development" => ["https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=1200&q=80"],
        "UI/UX Design" => ["https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80"],
        "Branding & Graphic Design" => ["https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1516321165247-4aa89a48be28?auto=format&fit=crop&w=1200&q=80"],
        "Digital Marketing" => ["https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?auto=format&fit=crop&w=1200&q=80"],
        "Video & Animation" => ["https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=1200&q=80"],
        "Writing & Translation" => ["https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80"],
        _ => ["https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80"]
    };

    private static string ToSlug(string value) => new(value.ToLowerInvariant().Where(char.IsLetterOrDigit).ToArray());

    private sealed record SeedCategory(string Name, string Description, string IconUrl);
    private sealed record SeedUser(string FullName, string Email, string Bio, string AvatarUrl);
}
