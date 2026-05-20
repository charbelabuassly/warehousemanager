import ClientPage from "./clientPage";
import {ProductDTO} from "@/app/types"

export default async function ProductsPage() {
  const trendingRes = await fetch("http://localhost:5157/api/shop/trending?page=1", {
    cache: "no-store"
  });

  const newestRes = await fetch("http://localhost:5157/api/shop/new?page=1", {
    cache: "no-store"
  });

  const discountedRes = await fetch("http://localhost:5157/api/shop/discount?page=1", {
    cache: "no-store"
  });

  const trending : ProductDTO[] = await trendingRes.json();
  const newest : ProductDTO[] = await newestRes.json();
  const discounted : ProductDTO[] = await discountedRes.json();

  return <ClientPage trending={trending} newest={newest} discounted={discounted} />;
}