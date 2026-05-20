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

export type ProductDTO = {
  id: number;
  name: string;
  description?: string;
  price: number;
  discount: number;
  categoryId: number;
  stockStatus?: string;
  imageURL: string
};

export type UserRole = "customer" | "admin" | "delivery";

export interface CartItem {
  product: ProductDTO;
  quantity: number;
}
