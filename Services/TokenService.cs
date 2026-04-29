using warehousemanager.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace warehousemanager.Services
{
    public class TokenService
    {
        public readonly IConfiguration _config; //DI will automatically inject all configs from appsetting when we need this object

        //Injection Placeholder
        public TokenService(IConfiguration config)
        {
            _config = config;
        }

        public string GenerateToken(Users user)
        {
            try
            {
                // We are securely grabbing the key from the application.json
                var key = new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
                // creds, this provides 
                var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256); //This object contains the instructions for generating the sign of the payload

                //Preparing the payload
                var claims = new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.UsersId.ToString()),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Role, user.RoleId.ToString())
                };
                //Better to keep amount of data as little as possible. 

                //Building the token
                var token = new JwtSecurityToken(
                    issuer: _config["Jwt:Issuer"],
                    audience: _config["Jwt:Audience"],
                    claims: claims,
                    expires: DateTime.UtcNow.AddDays(
                        double.Parse(_config["Jwt:ExpiryDays"]!)),
                    signingCredentials: creds
                );

                return new JwtSecurityTokenHandler().WriteToken(token);
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException("Failed to generate token", ex);
            }

        }

        public bool VerifyAdmin(Users user)
        {
            if (user == null)
            {
                return false;
            }
            if (user.RoleId != 2)
            {
                return false;
            }
            return true;
        }

    }
}
