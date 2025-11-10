# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore dependencies
COPY CrimsonAiCrmApi/CrimsonAiCrmApi.csproj CrimsonAiCrmApi/
RUN dotnet restore CrimsonAiCrmApi/CrimsonAiCrmApi.csproj

# Copy everything else and build
COPY CrimsonAiCrmApi/ CrimsonAiCrmApi/
WORKDIR /src/CrimsonAiCrmApi
RUN dotnet build -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Copy published app
COPY --from=publish /app/publish .

# Copy React build to wwwroot
COPY dist/ wwwroot/

# Expose port (Render will set PORT env var)
EXPOSE 8080

# Set environment variable for port binding
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "CrimsonAiCrmApi.dll"]

