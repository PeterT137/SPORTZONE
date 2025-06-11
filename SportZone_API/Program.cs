using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SportZone_API.DTOs;
using SportZone_API.Models;
using SportZone_API.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddDbContext<SportZoneContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("MyCnn")));
builder.Services.AddScoped<RegisterService>();
builder.Services.AddScoped<ForgotPasswordService>();
builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();
builder.Services.AddDistributedMemoryCache();
builder.Services.Configure<SendEmail>(builder.Configuration.GetSection("SendEmail"));

// Cấu hình session
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(15);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});
builder.Services.AddHttpContextAccessor();

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

app.UseSession(); // Bắt buộc để sử dụng session

app.UseAuthorization();

app.MapControllers();

app.Run();
