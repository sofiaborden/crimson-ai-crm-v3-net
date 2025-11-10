using Microsoft.AspNetCore.Mvc;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace CrimsonAiCrmApi.Controllers;

[ApiController]
[Route("api")]
public class BioController : ControllerBase
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;
    private readonly ILogger<BioController> _logger;

    public BioController(
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration,
        ILogger<BioController> logger)
    {
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
        _logger = logger;
    }

    [HttpPost("generate-bio")]
    public async Task<IActionResult> GenerateBio([FromBody] BioRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return BadRequest(new { success = false, error = "Name is required" });
            }

            var apiKey = _configuration["PERPLEXITY_API_KEY"] ?? Environment.GetEnvironmentVariable("PERPLEXITY_API_KEY");
            
            _logger.LogInformation("🔍 Server-side API call for: {Name}", request.Name);
            _logger.LogInformation("🔍 API Key available: {HasKey}", !string.IsNullOrEmpty(apiKey));

            // Check if we're using a placeholder/invalid API key
            var isPlaceholderKey = string.IsNullOrEmpty(apiKey) ||
                                  apiKey.Contains("your_perplexity_api_key_here") ||
                                  apiKey.StartsWith("pplx-b8c1c2e8c9d4f5a6");

            if (isPlaceholderKey)
            {
                _logger.LogWarning("⚠️ Using placeholder API key - returning mock data");
                return Ok(GetMockResponse(request));
            }

            // Build the Perplexity API request
            var perplexityRequest = BuildPerplexityRequest(request);
            
            var httpClient = _httpClientFactory.CreateClient();
            httpClient.Timeout = TimeSpan.FromSeconds(15);

            var jsonContent = JsonSerializer.Serialize(perplexityRequest);
            var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

            httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {apiKey}");

            var response = await httpClient.PostAsync("https://api.perplexity.ai/chat/completions", content);
            var responseBody = await response.Content.ReadAsStringAsync();

            _logger.LogInformation("🔍 Perplexity API Response Status: {StatusCode}", response.StatusCode);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("🔍 Perplexity API Error: {Response}", responseBody);
                
                // Return fallback response on API error
                return Ok(GetFallbackResponse(request));
            }

            var data = JsonSerializer.Deserialize<PerplexityResponse>(responseBody);
            
            return Ok(ProcessPerplexityResponse(data, request));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating bio");
            return Ok(GetFallbackResponse(request));
        }
    }

    private object BuildPerplexityRequest(BioRequest request)
    {
        var searchQuery = $"{request.Name}";
        if (!string.IsNullOrEmpty(request.Employer))
            searchQuery += $" {request.Employer}";
        if (!string.IsNullOrEmpty(request.Location))
            searchQuery += $" {request.Location}";

        return new
        {
            model = "sonar-pro",
            temperature = 0.2,
            max_tokens = 1000,
            top_p = 0.9,
            search_domain_filter = new[] {
                "linkedin.com", "bloomberg.com", "forbes.com", "crunchbase.com",
                "sec.gov", "fec.gov", "opensecrets.org", "wikipedia.org"
            },
            return_images = false,
            return_related_questions = false,
            search_recency_filter = "month",
            top_k = 0,
            stream = false,
            presence_penalty = 0,
            frequency_penalty = 1,
            messages = new[]
            {
                new
                {
                    role = "system",
                    content = "You are a professional researcher creating concise donor profiles. Provide 2-5 factual sentences about the person's professional background, notable achievements, and current role. Focus on verifiable information."
                },
                new
                {
                    role = "user",
                    content = $"Create a brief professional bio (2-5 sentences) for {searchQuery}. Include their current role, notable achievements, and professional background. Be factual and concise."
                }
            }
        };
    }

    private object ProcessPerplexityResponse(PerplexityResponse? data, BioRequest request)
    {
        if (data?.Choices == null || data.Choices.Length == 0)
        {
            return GetFallbackResponse(request);
        }

        var content = data.Choices[0]?.Message?.Content ?? "";
        var citations = data.Citations ?? Array.Empty<string>();

        // Split content into sentences
        var sentences = content
            .Split(new[] { ". ", ".\n", "! ", "? " }, StringSplitOptions.RemoveEmptyEntries)
            .Select(s => s.Trim())
            .Where(s => !string.IsNullOrWhiteSpace(s))
            .Select(s => s.EndsWith(".") || s.EndsWith("!") || s.EndsWith("?") ? s : s + ".")
            .Take(5)
            .ToArray();

        var citationObjects = citations.Select(url => new
        {
            title = ExtractDomainFromUrl(url),
            url = url
        }).ToArray();

        return new
        {
            success = true,
            headlines = sentences,
            citations = citationObjects,
            model = "sonar-pro"
        };
    }

    private object GetMockResponse(BioRequest request)
    {
        var mockHeadlines = new[]
        {
            $"{request.Name} is a professional based in {request.Location ?? "the United States"}.",
            !string.IsNullOrEmpty(request.Employer) 
                ? $"Currently affiliated with {request.Employer}." 
                : "Has an established career in their field.",
            "Known for contributions to their industry and community."
        };

        return new
        {
            success = true,
            headlines = mockHeadlines,
            citations = new[]
            {
                new { title = "Public Records", url = "https://example.com" }
            },
            model = "mock-data"
        };
    }

    private object GetFallbackResponse(BioRequest request)
    {
        var fallbackHeadlines = new List<string>();

        if (!string.IsNullOrEmpty(request.Occupation) && !string.IsNullOrEmpty(request.Employer))
        {
            fallbackHeadlines.Add($"{request.Name} serves as {request.Occupation} at {request.Employer}.");
        }
        else if (!string.IsNullOrEmpty(request.Employer))
        {
            fallbackHeadlines.Add($"{request.Name} is affiliated with {request.Employer}.");
        }
        else
        {
            fallbackHeadlines.Add($"{request.Name} is a professional in their field.");
        }

        if (!string.IsNullOrEmpty(request.Industry))
        {
            fallbackHeadlines.Add($"Professional with experience in {request.Industry}.");
        }

        if (!string.IsNullOrEmpty(request.Location))
        {
            fallbackHeadlines.Add($"Based in {request.Location} with established career background.");
        }

        return new
        {
            success = true,
            headlines = fallbackHeadlines.ToArray(),
            citations = new[]
            {
                new { title = "Employment Information", url = "#" }
            },
            model = "fallback"
        };
    }

    private string ExtractDomainFromUrl(string url)
    {
        try
        {
            var uri = new Uri(url);
            return uri.Host.Replace("www.", "");
        }
        catch
        {
            return "Source";
        }
    }
}

// Request/Response Models
public class BioRequest
{
    [JsonPropertyName("name")]
    public string Name { get; set; } = "";
    
    [JsonPropertyName("occupation")]
    public string? Occupation { get; set; }
    
    [JsonPropertyName("employer")]
    public string? Employer { get; set; }
    
    [JsonPropertyName("location")]
    public string? Location { get; set; }
    
    [JsonPropertyName("email")]
    public string? Email { get; set; }
    
    [JsonPropertyName("industry")]
    public string? Industry { get; set; }
    
    [JsonPropertyName("useSearchResults")]
    public bool? UseSearchResults { get; set; }
    
    [JsonPropertyName("testingMode")]
    public string? TestingMode { get; set; }
}

public class PerplexityResponse
{
    [JsonPropertyName("choices")]
    public Choice[]? Choices { get; set; }
    
    [JsonPropertyName("citations")]
    public string[]? Citations { get; set; }
}

public class Choice
{
    [JsonPropertyName("message")]
    public Message? Message { get; set; }
}

public class Message
{
    [JsonPropertyName("content")]
    public string? Content { get; set; }
}

