# Stage 1: Build React frontend
FROM node:18 AS frontend-build
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install

# Copy all frontend files
COPY . .

# Set production API URL and build
ENV VITE_API_URL=https://crimson-ai-crm-v3-net.onrender.com
RUN npm run build

# Stage 2: Build .NET backend
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS backend-build
WORKDIR /src

# Copy csproj and restore dependencies
COPY CrimsonAiCrmApi/CrimsonAiCrmApi.csproj CrimsonAiCrmApi/
RUN dotnet restore CrimsonAiCrmApi/CrimsonAiCrmApi.csproj

# Copy everything else and build
COPY CrimsonAiCrmApi/ CrimsonAiCrmApi/
WORKDIR /src/CrimsonAiCrmApi
RUN dotnet build -c Release -o /app/build

# Publish stage
FROM backend-build AS publish
RUN dotnet publish -c Release -o /app/publish

# Stage 3: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Copy published .NET app
COPY --from=publish /app/publish .

# Copy React build from frontend stage to wwwroot
COPY --from=frontend-build /app/dist ./wwwroot

# Expose port (Render will set PORT env var)
EXPOSE 8080

# Set environment variable for port binding
ENV ASPNETCORE_URLS=http://+:8080

ENTRYPOINT ["dotnet", "CrimsonAiCrmApi.dll"]

