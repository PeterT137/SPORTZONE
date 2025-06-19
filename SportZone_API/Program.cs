using SportZone_API.Repository.Interfaces;
using SportZone_API.Repository;
using SportZone_API.Services.Interfaces;
using SportZone_API.Services;
using Microsoft.EntityFrameworkCore;
using SportZone_API.Models;
using Microsoft.AspNetCore.Identity;
using SportZone_API.Helper;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
var connectionString = builder.Configuration.GetConnectionString("MyCnn");

// Thêm DbContext vào DI container
builder.Services.AddDbContext<SportZoneContext>(options =>
    options.UseSqlServer(connectionString));

// Thêm Identity services cho password hashing
builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();

// Thêm AutoMapper
builder.Services.AddAutoMapper(typeof(MappingProfile));

builder.Services.AddScoped<IAuthRepository, AuthRepository>();
builder.Services.AddScoped<IFieldRepository, FieldRepository>();
//builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IFieldService, FieldService>();
//builder.Services.AddScoped<IUserService, UserService>();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.WriteIndented = true;
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.Preserve;
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
    });
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
