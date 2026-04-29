using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using warehousemanager.Data;
using warehousemanager.DTO;
using warehousemanager.Services;

namespace warehousemanager.Controllers.admin
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportController : ControllerBase
    {
        private readonly LogisticContext _context;
        private readonly TokenService _token;

        public ReportController(LogisticContext context, TokenService token)
        {
            _context = context;
            _token = token;
        }

        //This function will generate a report showing the revenue for each product
        [Authorize]
        [HttpGet("all-products-report")]
        public async Task<ActionResult<List<RevenuePerProductResponse>>> GetRevenuePerProduct()
        {

            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            if (string.IsNullOrWhiteSpace(email)) return Unauthorized(new { Message = "Missing email claim" });

            var user = await _context._users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null) return Unauthorized(new { Message = "User not found" });

            if (!_token.VerifyAdmin(user))
            {
               return Unauthorized(new { Message = "You are not authorized" });
            }

            var rpp = await _context._orderItems.GroupBy(oi => oi.ProductsId)
                //Select is like .map() in js
                .Select(g => new RevenuePerProductResponse
                {
                    ProductId = g.Key ,// The key is basically just what the group index is here
                    ProductName = g.First().Product.Name,  //Including a navigational property in a select function acts as a join meaning each row get joined with their respective row in the designated table, no need to use .include()
                    Revenue = g.Sum(i => i.Quantity * i.PriceAtPurchase) //This is called a selector sum, we basically do a summation of the elts in the list with a specific formula applied on them
                }).ToListAsync(); //We change to list in order to return it

            //This is just a: select productid, productname, SUM(oi.quantity*oi.priceatpurchase) as revenue from OrderItems oi Join On Product where oi.productid = Product.ProductId groupby oi.productId
            //So we can include nav properties freely 

            return Ok(rpp);

        }


    }
}
