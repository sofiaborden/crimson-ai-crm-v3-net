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
        var userPrompt = $@"Generate a comprehensive, fact-based professional bio for {request.Name} using ONLY verifiable public data from reputable sources (LinkedIn, company websites, news outlets, professional profiles, university records). Do NOT include any URLs, citation markers, or sources in the main bio text.

REQUIREMENTS:
- 2-5 sentence narrative bio covering: current role and employer, tenure/years of service (e.g., ""since 2018""), notable projects or achievements, educational background when available, professional specializations
- Use specific dates, years, project names, and quantifiable details when available
- NO speculation or inference - only verified facts
- Multiple citation sources preferred

Person Details:
Name: {request.Name}
{(!string.IsNullOrEmpty(request.Occupation) ? $"Title: {request.Occupation}" : "")}
{(!string.IsNullOrEmpty(request.Employer) ? $"Company: {request.Employer}" : "")}
{(!string.IsNullOrEmpty(request.Location) ? $"Location: {request.Location}" : "")}
{(!string.IsNullOrEmpty(request.Email) ? $"Email: {request.Email}" : "")}

Return a JSON object containing:
- 'bio': A 2-5 sentence comprehensive professional bio (no URLs in text)
- 'sources': An array of objects with 'title' and 'url' for each public source used

Example format:
{{
  ""bio"": ""John Smith serves as Chief Technology Officer at TechCorp since 2018, where he leads digital transformation initiatives across the organization and oversees a team of 50+ engineers. He previously held senior engineering roles at Microsoft and Amazon, specializing in cloud infrastructure and enterprise software development. Smith holds a Master's degree in Computer Science from Stanford University and has been recognized as a Top 40 Under 40 technology leader by TechWeek Magazine."",
  ""sources"": [
    {{""title"": ""LinkedIn Profile"", ""url"": ""https://linkedin.com/in/johnsmith""}},
    {{""title"": ""TechCorp Leadership Page"", ""url"": ""https://techcorp.com/leadership/john-smith""}},
    {{""title"": ""Stanford Alumni Directory"", ""url"": ""https://alumni.stanford.edu/directory/john-smith""}}
  ]
}}";

        return new
        {
            model = "sonar-pro",
            temperature = 0.2,
            max_tokens = 1000,
            top_p = 0.9,
            return_citations = true,
            search_recency_filter = "month",
            search_depth = "deep",
            search_domain_filter = new[] {
                "linkedin.com", "bloomberg.com", "forbes.com", "crunchbase.com",
                "sec.gov", "theorg.com", "about.me", "reuters.com", "wsj.com"
            },
            response_format = new
            {
                type = "json_schema",
                json_schema = new
                {
                    schema = new
                    {
                        type = "object",
                        properties = new
                        {
                            bio = new
                            {
                                type = "string",
                                description = "A comprehensive professional bio with 2-5 factual sentences covering: current role and employer, tenure/years of service, notable projects or achievements, educational background when available, and professional specializations. Do NOT include any URLs or citation markers in this text."
                            },
                            sources = new
                            {
                                type = "array",
                                description = "Array of sources used to create the bio",
                                items = new
                                {
                                    type = "object",
                                    properties = new
                                    {
                                        title = new
                                        {
                                            type = "string",
                                            description = "Title or name of the source"
                                        },
                                        url = new
                                        {
                                            type = "string",
                                            description = "Full URL of the source"
                                        }
                                    },
                                    required = new[] { "title", "url" }
                                }
                            }
                        },
                        required = new[] { "bio", "sources" }
                    }
                }
            },
            messages = new[]
            {
                new
                {
                    role = "system",
                    content = "You are a research assistant that creates comprehensive factual bios about people for political fundraising outreach. You must return a JSON object with a detailed bio and separate sources array. Focus on profession, title, company affiliations, years of service, notable projects, educational background, recognitions, and achievements. Use ONLY verifiable public data from reputable sources."
                },
                new
                {
                    role = "user",
                    content = userPrompt
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

        try
        {
            // Parse the JSON response
            var jsonDoc = JsonDocument.Parse(content);
            var root = jsonDoc.RootElement;

            // Extract bio and sources from JSON
            var bio = root.GetProperty("bio").GetString() ?? "";
            var sources = new List<object>();

            if (root.TryGetProperty("sources", out var sourcesElement) && sourcesElement.ValueKind == JsonValueKind.Array)
            {
                foreach (var source in sourcesElement.EnumerateArray())
                {
                    var title = source.TryGetProperty("title", out var titleProp) ? titleProp.GetString() : "Source";
                    var url = source.TryGetProperty("url", out var urlProp) ? urlProp.GetString() : "#";

                    sources.Add(new { title, url });
                }
            }

            // Split bio into sentences for headlines
            var sentences = bio
                .Split(new[] { ". ", ".\n", "! ", "? " }, StringSplitOptions.RemoveEmptyEntries)
                .Select(s => s.Trim())
                .Where(s => !string.IsNullOrWhiteSpace(s))
                .Select(s => s.EndsWith(".") || s.EndsWith("!") || s.EndsWith("?") ? s : s + ".")
                .Take(5)
                .ToArray();

            return new
            {
                success = true,
                headlines = sentences,
                citations = sources.ToArray(),
                model = "sonar-pro"
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error parsing JSON response from Perplexity");

            // Fallback: treat content as plain text
            var sentences = content
                .Split(new[] { ". ", ".\n", "! ", "? " }, StringSplitOptions.RemoveEmptyEntries)
                .Select(s => s.Trim())
                .Where(s => !string.IsNullOrWhiteSpace(s))
                .Select(s => s.EndsWith(".") || s.EndsWith("!") || s.EndsWith("?") ? s : s + ".")
                .Take(5)
                .ToArray();

            return new
            {
                success = true,
                headlines = sentences,
                citations = new object[] { new { title = "Public Records", url = "#" } },
                model = "sonar-pro"
            };
        }
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

