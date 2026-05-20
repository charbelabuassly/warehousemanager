
export type ProductDTO = {
  id: number;
  name: string;
  description?: string;
  price: number;
  discount: number;
  categoryId: number;
  categoryName: string;
  stockStatus: string;
  imageURL: string
};

export type UserRole = "customer" | "admin" | "delivery";

export interface CartItem {
  product: ProductDTO;
  quantity: number;
}

export type ProductPageResponse = {
  items: ProductDTO[];
  totalCount: number;
};