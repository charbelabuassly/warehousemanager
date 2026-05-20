using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using warehousemanager.Data;
using warehousemanager.Models;
using warehousemanager.Services;

namespace warehousemanager.Controllers.website
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewsController : ControllerBase
    {
        private readonly LogisticContext _context;
        private readonly TokenService _token;

        public ReviewsController(LogisticContext context, TokenService token)
        {
            _context = context;
            _token = token;
        }

        //First method will allow us to add a review
        [Authorize]
        [HttpPost]
        public async Task<ActionResult<Reviews>> AddReview(Reviews review)
        {
            if (review == null)
            {
                return BadRequest(new { Message = "No data available in request" });
            }
            try
            {
                var email = User.FindFirst(ClaimTypes.Email)?.Value;
                if (string.IsNullOrWhiteSpace(email)) return Unauthorized(new { Message = "Missing email claim" });

                var user = await _context._users.FirstOrDefaultAsync(u => u.Email == email);
                if (user == null) return Unauthorized(new { Message = "User not found" });

                if (!_token.VerifyClient(user)) return Unauthorized(new { Message = "You are not authorized" });

                //Since the user is now verified we can proceed by adding his review
                var rev = await _context._reviews.FirstOrDefaultAsync(r => (r.UsersId == review.UsersId && r.ProductsId == review.ProductsId));
                if (rev != null)
                {
                    return Conflict("You have already reviewed this product.");
                }

                //Else no reviews we can safely add the review
                _context._reviews.Add(review);
                await _context.SaveChangesAsync();

                return Created(string.Empty, new
                {
                    Message = "Review added successfully.",
                    Review = review
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Message = "Failed to load products",
                    Detail = ex.Message
                });
            }
        }

        [Authorize]
        [HttpGet("{productId}")]
        public async Task<ActionResult> GetProductRating(int productId)
        {
            if (productId <= 0)
                return BadRequest(new { Message = "Invalid product ID." });
            try
            {
                var email = User.FindFirst(ClaimTypes.Email)?.Value;
                if (string.IsNullOrWhiteSpace(email))
                    return Unauthorized(new { Message = "Missing email claim" });

                var user = await _context._users.FirstOrDefaultAsync(u => u.Email == email);
                if (user == null)
                    return Unauthorized(new { Message = "User not found" });

                if (!_token.VerifyClient(user))
                    return Unauthorized(new { Message = "You are not authorized" });

                var product = await _context._products.FirstOrDefaultAsync(p => p.ProductsId == productId);
                if (product == null)
                    return NotFound(new { Message = $"Product with ID {productId} was not found." });

                var reviews = await _context._reviews
                    .Where(r => r.ProductsId == productId)
                    .ToListAsync();

                if (!reviews.Any())
                    return NotFound(new { Message = "No reviews found for this product." });

                var average = reviews.Average(r => r.Rating);

                return Ok(new
                {
                    ProductId = productId,
                    AverageRating = Math.Round(average, 2),
                    TotalReviews = reviews.Count
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Message = "Failed to retrieve product rating.",
                    Detail = ex.Message
                });
            }
        }
        [Authorize]
        [HttpDelete("{userId}/{productId}")]
        public async Task<ActionResult> DeleteReview(int productId, int userId)
        {
            if (productId <= 0 || userId <= 0)
                return BadRequest(new { Message = "Invalid product or user ID." });
            try
            {
                var email = User.FindFirst(ClaimTypes.Email)?.Value;
                if (string.IsNullOrWhiteSpace(email))
                    return Unauthorized(new { Message = "Missing email claim" });

                var user = await _context._users.FirstOrDefaultAsync(u => u.Email == email);
                if (user == null)
                    return Unauthorized(new { Message = "User not found" });

                if (!_token.VerifyClient(user))
                    return Unauthorized(new { Message = "You are not authorized" });

                // Ensure users can only delete their own reviews
                if (user.UsersId != userId)
                    return Forbid();

                var review = await _context._reviews
                    .FirstOrDefaultAsync(r => r.ProductsId == productId && r.UsersId == userId);

                if (review == null)
                    return NotFound(new { Message = "Review not found." });

                _context._reviews.Remove(review);
                await _context.SaveChangesAsync();

                return Ok(new { Message = "Review deleted successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Message = "Failed to delete review.",
                    Detail = ex.Message
                });
            }
        }

    }
}
