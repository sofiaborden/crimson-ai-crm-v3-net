using Microsoft.AspNetCore.StaticFiles;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddCors(options =>
{
    options.AddPolicy("CrimsonCorsPolicy", policy =>
    {
        policy.WithOrigins(
            "http://localhost:5173",
            "http://localhost:5174",
            "https://crimson-ai-crm-2.onrender.com",
            "https://crimson-ai-crm-v3-net.onrender.com"
        )
        .AllowAnyMethod()
        .AllowAnyHeader();
    });
});

builder.Services.AddHttpClient();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

var app = builder.Build();

// Configure the HTTP request pipeline
app.UseCors("CrimsonCorsPolicy");

// Serve static files from wwwroot (React build)
var provider = new FileExtensionContentTypeProvider();
provider.Mappings[".js"] = "application/javascript";
app.UseStaticFiles(new StaticFileOptions
{
    ContentTypeProvider = provider
});

app.UseRouting();
app.MapControllers();

// SPA fallback routing - serve index.html for all non-API routes
app.MapFallbackToFile("index.html");

app.Run();

