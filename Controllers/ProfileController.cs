using Azure.Core;
using warehousemanager.Data;
using warehousemanager.DTO;
using warehousemanager.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace warehousemanager.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProfileController : ControllerBase
    {
        private readonly LogisticContext _context;
        private readonly TokenService _token;
        private readonly PasswordService _pserv;

        public ProfileController(LogisticContext context, TokenService token, PasswordService pserv)
        {
            _context = context;
            _token = token;
            _pserv = pserv;
        }

        //Method used to get all profile information
        [HttpGet(Name = "GetProfile")]
        public async Task<ActionResult<ProfileResponse>> GetProfile()
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            var user = await _context._users
                .Include(u => u.Role) //used to populate the User
                .FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return BadRequest();

            var address = new AddressRequest
            {
                Street = user.Street,
                City = user.City,
                Country = user.Country
            };

            return Ok(new ProfileResponse
            {
                Id = user.UsersId,
                Fname = user.Fname,
                Lname = user.Lname,
                Email = user.Email,
                address = address,
                Role = user.Role?.RoleName ?? string.Empty
            });
        }

        //Used for full update of the profile (First name, last name, and address)
        [HttpPut("fullupdate")]
        public async Task<IActionResult> FullUpdate([FromBody] ProfileUpdateRequest request)
        {
            if (request == null) return BadRequest();
            if (request.Address == null) return BadRequest();

            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            var user = await _context._users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return BadRequest();

            user.Fname = request.Fname;
            user.Lname = request.Lname;
            user.Street = request.Address.Street;
            user.City = request.Address.City;
            user.Country = request.Address.Country;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // Dynamic update via query params (same style as ShopController search)
        // Example: PATCH /api/Profile/dynamicupdate?fname=John&street=Main%20St
        [Authorize]
        [HttpPatch("dynamicupdate")]
        public async Task<ActionResult<ProfileResponse>> DynamicUpdate(
            [FromQuery] string? fname,
            [FromQuery] string? lname,
            [FromQuery] string? street,
            [FromQuery] string? city,
            [FromQuery] string? country)
        {
            if (string.IsNullOrEmpty(fname)
                && string.IsNullOrEmpty(lname)
                && string.IsNullOrEmpty(street)
                && string.IsNullOrEmpty(city)
                && string.IsNullOrEmpty(country))
            {
                return BadRequest(new { Message = "No update values provided" });
            }

            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            var user = await _context._users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return BadRequest();

            if (!string.IsNullOrEmpty(fname)) user.Fname = fname;
            if (!string.IsNullOrEmpty(lname)) user.Lname = lname;
            if (!string.IsNullOrEmpty(street)) user.Street = street;
            if (!string.IsNullOrEmpty(city)) user.City = city;
            if (!string.IsNullOrEmpty(country)) user.Country = country;

            await _context.SaveChangesAsync();

            var address = new AddressRequest
            {
                Street = user.Street,
                City = user.City,
                Country = user.Country
            };

            return Ok(new ProfileResponse
            {
                Id = user.UsersId,
                Fname = user.Fname,
                Lname = user.Lname,
                Email = user.Email,
                address = address,
                Role = user.Role?.RoleName ?? string.Empty
            });
        }

        //This function deals with changing password, it verifies the old password, and then validates the new one, hashes it ad updates the password
        [Authorize]
        [HttpPatch("changepass")]
        public async Task<IActionResult> ChangePassword(string oldpass, string newpass)
        {
            if (string.IsNullOrEmpty(oldpass))
            {
                return BadRequest(new {Messgae = "New Password cannot be empty"});
            }
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            var user = await _context._users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return BadRequest();

            //verify the old password matches
            var status = _pserv.VerifyPassword(oldpass, user.Password); 
            if (!status)
            {
                return Unauthorized(new { Message = "Wrong Password" });
            }

            //we need to valdiate new pass
            var error = "";
            var passStatus = _pserv.ValidatePassword(newpass, out error);
            if (!passStatus)
            {
                return BadRequest(new { Message = "Invalid password, pkease choose another one" });
            }
            //else password is valid set it as the new password
            user.Password = _pserv.Hash(newpass);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        //This function will deal with changing the email, user must enter his password and the new email
        [Authorize]
        [HttpPatch("changemail")]
        public async Task<IActionResult> ChangeEmail([FromBody] ChangeEmailRequest request)
        {
            if (request == null)
            {
                return BadRequest();
            }
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            var user = await _context._users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return BadRequest();

            var status = _pserv.VerifyPassword(request.Password, user.Password);
            if (!status)
            {
                return Unauthorized(new { Message = "Invalid Password" });
            }

            //else password correct, we can check if the email
            try
            {
                user.Email = request.EmailAddress;
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (DbUpdateException)
            {
                return Conflict(new { Message = "Email already in use" });
            }
        }
    }
}
