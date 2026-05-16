export type Category =
  | "All Products"
  | "Electronics"
  | "Furniture"
  | "Clothing"
  | "Food & Beverages"
  | "Tools & Hardware"
  | "Sports & Outdoors"
  | "Books & Stationery";

export type ProductCategory = Exclude<Category, "All Products">;

export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  category: ProductCategory;
  image: string;
  rating: number;
  reviews: number;
  stock: number;
  isNew: boolean;
  popularity: number;
  addedDate: number;
}

export type UserRole = "customer" | "admin" | "delivery";

export interface CartItem {
  product: Product;
  quantity: number;
}
