using warehousemanager.Data;
using warehousemanager.DTO;
using warehousemanager.Models;
using warehousemanager.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace warehousemanager.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccessController : ControllerBase
    {
        private PasswordService _pserv;
        private LogisticContext _context;
        private TokenService _token; 
        public AccessController(PasswordService pserv, LogisticContext context, TokenService token)
        {
            _pserv = pserv;
            _context = context;
            _token = token;
        }

        // --------
        // SIGN UP
        // --------
        [HttpPost("signup")]
        public async Task<ActionResult<AuthResponse>> SignUp([FromBody] SignUpRequest request)
        {
            if (request == null)
            {
                return BadRequest();
            }
            //First we need to check if the password is valid or not
            string error = "";
            bool status = _pserv.ValidatePassword(request.Password, out error);
            if (!status)
            {
                //Invalid password
                return BadRequest(new { Message = error });
            }

            //Now that we have validated the password, we will add the user to the db, and generate a token
            Users user = new Users()
            {
                Email = request.Email,
                Fname = request.FirstName,
                Lname = request.LastName,
                Password = _pserv.Hash(request.Password),

                // map AddressRequest into Users model
                Street = request.Address.Street,
                City = request.Address.City,
                Country = request.Address.Country
            };

            //This will be added to the the db now
            _context._users.Add(user);
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                // Most likely duplicate email (unique index)
                return BadRequest(new { Message = "Email already exists" });
            }

            //UsersId has now been filled automatically
            var token = _token.GenerateToken(user); //Will; raise an exception if an error occurs
            return Created(string.Empty, new AuthResponse { Token = token, Message = "Signed in successfully", Role = user.RoleId });
        }

        // --------
        // LOG IN
        // --------
        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
        {
            if (request == null)
            {
                return BadRequest();
            }
            //Grab the user by their email =>
            var user = await _context._users.FirstOrDefaultAsync(u => u.Email == request.Email); //Gamma like function, which tells the ASP to check any user in the dbset Users for an email same to the one we entered
            if (user == null)
            {
                return Unauthorized(new { Message = "Invalid credentials" });
            }
            if (!user.IsActive)
            {
                return Unauthorized(new { Message = "Account is inactive" });
            }
            //IF user was found we need to verify the passwords match
            var status = _pserv.VerifyPassword(request.Password, user.Password);
            if (!status)
            {
                return Unauthorized(new { Message = "Invalid credentials" });
            }
            //Passwords match, we return a new jwt token
            var token = _token.GenerateToken(user); //Will; raise an exception if an error occurs
            return Ok(new AuthResponse { Token = token, Message = "Logged in successfully", Role = user.RoleId });
        }
    }
}
