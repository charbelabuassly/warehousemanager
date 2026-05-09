using warehousemanager.Data;
using warehousemanager.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);
var jwtSettings = builder.Configuration.GetSection("Jwt"); //Get all related settings to the JWT
var issuer = jwtSettings["Issuer"];
var audience = jwtSettings["Audience"];
var key = jwtSettings["Key"];
// Telling EF how to build these services
builder.Services.AddScoped<PasswordService>();
builder.Services.AddScoped<TokenService>();
builder.Services.AddScoped<Scheduler>();
//This is done to resolve the warning
if (string.IsNullOrEmpty(key))
{
    throw new Exception("JWT Key is missing in configuration");
}
// Add services to the container.

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins(
                    "http://localhost:5173", "https://localhost:5173",
                    "http://localhost:4173", "https://localhost:4173",
                    "http://localhost:3000", "https://localhost:3000")
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials(); // Often needed if using cookies or strict tokens, but good to have
        });
});

builder.Services.AddControllers()
    .AddJsonOptions(options => {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddDbContext<LogisticContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConx"))); //Telling EF to read the Connection from appsettings.json for one source of truth 

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    //In the above section we tell ASP to use JWT tokens for Authentication
}).AddJwtBearer(options =>
{
    //Manual Configs
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true, //Checks if authority (my api) geenrated the token
        ValidateAudience = true, //Checks if the token sender is from a valid app
        ValidateLifetime = true, //Checks for expiry
        ValidateIssuerSigningKey = true, //Make sure the token was not tampered with
        ValidIssuer = issuer, //Authoritve name of the VALID JWT CREATOR
        ValidAudience = audience, //Enforce that this token is meant to be used by the logistic api
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key))
    };
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization(); //That means that ASP will intercept every single request, check if authenticated or not
//via the token, since we configured it to do so, BUT WILL NOT ENFORCE AUTHORIZATION unless we use [Authroized] on the route
app.MapControllers();

app.Run();
