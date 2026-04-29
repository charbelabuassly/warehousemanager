namespace warehousemanager.Services
{
    public class PasswordService
    {
        public string Hash(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password);
        }

        public bool VerifyPassword(string password, string hash)
        {
            return BCrypt.Net.BCrypt.Verify(password, hash);
        }

        public bool ValidatePassword(string password, out string error)
        {
            //Check if length < 8
            if (password.Length < 8)
            {
                error = "Password must be at least 8 letters long";
                return false;
            }
            //Check if no letter is uppercase
            if (!(password.Any(char.IsUpper)))
            {
                error = "Password must have at least one uppercase letter";
                return false;
            }
            //Check if no letter is lowercase
            if (!(password.Any(char.IsLower)))
            {
                error = "Password must have at least one lowercase letter";
                return false;
            }
            //Check if no numbers/digits are in the password
            if (!(password.Any(char.IsDigit)))
            {
                error = "Password must have at least one number";
                return false;
            }
            //Check if there is at least one special symbol/char
            if (!password.Any(char.IsSymbol) && !password.Any(char.IsPunctuation))
            {
                error = "Password must contain at least one special character";
                return false;
            }
            error = "";
            return true;
        }
    }
}
