import { Product } from "../types";

const IMG = {
  electronics1: "https://images.unsplash.com/photo-1615655406736-b37c4fabf923?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  electronics2: "https://images.unsplash.com/photo-1593344484962-796055d4a3a4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  electronics3: "https://images.unsplash.com/photo-1620783770629-122b7f187703?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  furniture1: "https://images.unsplash.com/photo-1653972233229-1b8c042d6d8e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  furniture2: "https://images.unsplash.com/photo-1649511134921-67afc567280c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  furniture3: "https://images.unsplash.com/photo-1653972233499-eaad56990299?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  clothing1: "https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  clothing2: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  clothing3: "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  food1: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  food2: "https://images.unsplash.com/photo-1628102491629-778571d893a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  food3: "https://images.unsplash.com/photo-1506617420156-8e4536971650?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  tools1: "https://images.unsplash.com/photo-1426927308491-6380b6a9936f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  tools2: "https://images.unsplash.com/photo-1522832712787-3fbd36c9fe2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  sports1: "https://images.unsplash.com/photo-1485809052957-5113b0ff51af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  sports2: "https://images.unsplash.com/photo-1778273781968-17657081722c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  sports3: "https://images.unsplash.com/photo-1758971793186-b7cbe0c4246a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  books1: "https://images.unsplash.com/photo-1532012197267-da84d127e765?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
  books2: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
};

export const products: Product[] = [
  // Electronics
  { id: 1, name: "Pro Wireless Headphones", category: "Electronics", price: 89.99, originalPrice: 119.99, image: IMG.electronics1, rating: 4.5, reviews: 328, stock: 45, isNew: false, popularity: 95, addedDate: 1700000000 },
  { id: 2, name: "Smart LED Desk Lamp", category: "Electronics", price: 45.99, image: IMG.electronics2, rating: 4.3, reviews: 156, stock: 80, isNew: true, popularity: 72, addedDate: 1747000000 },
  { id: 3, name: "USB-C Hub 7-in-1", category: "Electronics", price: 39.99, originalPrice: 49.99, image: IMG.electronics3, rating: 4.6, reviews: 412, stock: 120, isNew: false, popularity: 78, addedDate: 1710000000 },
  { id: 4, name: "Compact Bluetooth Speaker", category: "Electronics", price: 59.99, image: IMG.electronics1, rating: 4.4, reviews: 289, stock: 67, isNew: false, popularity: 84, addedDate: 1705000000 },
  { id: 5, name: "Mechanical Keyboard TKL", category: "Electronics", price: 129.99, originalPrice: 159.99, image: IMG.electronics2, rating: 4.7, reviews: 198, stock: 3, isNew: true, popularity: 88, addedDate: 1745000000 },
  { id: 6, name: "Wireless Gaming Mouse", category: "Electronics", price: 79.99, image: IMG.electronics3, rating: 4.5, reviews: 367, stock: 4, isNew: false, popularity: 86, addedDate: 1708000000 },
  { id: 7, name: "4K Webcam HD Pro", category: "Electronics", price: 99.99, originalPrice: 129.99, image: IMG.electronics1, rating: 4.2, reviews: 142, stock: 35, isNew: true, popularity: 70, addedDate: 1746000000 },
  { id: 8, name: "Fast Wireless Charger Pad", category: "Electronics", price: 29.99, originalPrice: 39.99, image: IMG.electronics2, rating: 4.4, reviews: 521, stock: 90, isNew: true, popularity: 75, addedDate: 1744000000 },

  // Furniture
  { id: 9, name: "Minimalist Coffee Table", category: "Furniture", price: 249.99, image: IMG.furniture1, rating: 4.6, reviews: 89, stock: 25, isNew: false, popularity: 82, addedDate: 1703000000 },
  { id: 10, name: "Ergonomic Office Chair", category: "Furniture", price: 399.99, originalPrice: 499.99, image: IMG.furniture2, rating: 4.8, reviews: 214, stock: 18, isNew: false, popularity: 92, addedDate: 1700000000 },
  { id: 11, name: "Floating Shelf Set (3pc)", category: "Furniture", price: 69.99, image: IMG.furniture3, rating: 4.3, reviews: 178, stock: 60, isNew: true, popularity: 68, addedDate: 1744000000 },
  { id: 12, name: "Velvet Sofa 3-Seater", category: "Furniture", price: 799.99, originalPrice: 999.99, image: IMG.furniture1, rating: 4.7, reviews: 56, stock: 2, isNew: false, popularity: 75, addedDate: 1706000000 },
  { id: 13, name: "Bamboo Bookshelf 5-Tier", category: "Furniture", price: 149.99, image: IMG.furniture2, rating: 4.4, reviews: 132, stock: 40, isNew: true, popularity: 65, addedDate: 1743000000 },
  { id: 14, name: "Solid Oak Dining Table", category: "Furniture", price: 649.99, originalPrice: 799.99, image: IMG.furniture3, rating: 4.9, reviews: 41, stock: 8, isNew: false, popularity: 79, addedDate: 1702000000 },

  // Clothing
  { id: 15, name: "Classic White T-Shirt", category: "Clothing", price: 24.99, image: IMG.clothing1, rating: 4.5, reviews: 689, stock: 200, isNew: false, popularity: 88, addedDate: 1699000000 },
  { id: 16, name: "Slim Fit Chinos", category: "Clothing", price: 54.99, originalPrice: 69.99, image: IMG.clothing2, rating: 4.4, reviews: 423, stock: 85, isNew: false, popularity: 80, addedDate: 1702000000 },
  { id: 17, name: "Cozy Knit Sweater", category: "Clothing", price: 79.99, image: IMG.clothing3, rating: 4.6, reviews: 201, stock: 55, isNew: true, popularity: 73, addedDate: 1742000000 },
  { id: 18, name: "Minimalist Snapback Cap", category: "Clothing", price: 29.99, image: IMG.clothing1, rating: 4.2, reviews: 156, stock: 4, isNew: false, popularity: 66, addedDate: 1701000000 },
  { id: 19, name: "Linen Button-Up Shirt", category: "Clothing", price: 49.99, originalPrice: 64.99, image: IMG.clothing2, rating: 4.5, reviews: 298, stock: 70, isNew: true, popularity: 74, addedDate: 1741000000 },
  { id: 20, name: "Premium Denim Jacket", category: "Clothing", price: 94.99, originalPrice: 119.99, image: IMG.clothing3, rating: 4.7, reviews: 312, stock: 30, isNew: true, popularity: 81, addedDate: 1743000000 },

  // Food & Beverages
  { id: 21, name: "Organic Green Tea (20 bags)", category: "Food & Beverages", price: 12.99, image: IMG.food1, rating: 4.7, reviews: 567, stock: 150, isNew: false, popularity: 87, addedDate: 1698000000 },
  { id: 22, name: "Cold Brew Coffee Kit", category: "Food & Beverages", price: 34.99, image: IMG.food2, rating: 4.5, reviews: 321, stock: 90, isNew: false, popularity: 83, addedDate: 1704000000 },
  { id: 23, name: "Mixed Nuts & Seeds Pack", category: "Food & Beverages", price: 18.99, image: IMG.food3, rating: 4.4, reviews: 189, stock: 75, isNew: true, popularity: 69, addedDate: 1740000000 },
  { id: 24, name: "Artisan Hot Sauce Set (3pc)", category: "Food & Beverages", price: 24.99, image: IMG.food1, rating: 4.6, reviews: 142, stock: 2, isNew: false, popularity: 71, addedDate: 1707000000 },
  { id: 25, name: "Extra Virgin Olive Oil 500ml", category: "Food & Beverages", price: 19.99, originalPrice: 24.99, image: IMG.food2, rating: 4.8, reviews: 445, stock: 110, isNew: false, popularity: 80, addedDate: 1700000000 },
  { id: 26, name: "Sparkling Water 12-Pack", category: "Food & Beverages", price: 15.99, image: IMG.food3, rating: 4.3, reviews: 234, stock: 200, isNew: true, popularity: 67, addedDate: 1739000000 },

  // Tools & Hardware
  { id: 27, name: "Cordless Screwdriver Set", category: "Tools & Hardware", price: 89.99, originalPrice: 109.99, image: IMG.tools1, rating: 4.6, reviews: 312, stock: 45, isNew: false, popularity: 85, addedDate: 1700000000 },
  { id: 28, name: "Hex Key Allen Set (25pc)", category: "Tools & Hardware", price: 19.99, image: IMG.tools2, rating: 4.4, reviews: 267, stock: 130, isNew: true, popularity: 62, addedDate: 1738000000 },
  { id: 29, name: "Retractable Measuring Tape", category: "Tools & Hardware", price: 14.99, image: IMG.tools1, rating: 4.3, reviews: 198, stock: 3, isNew: false, popularity: 59, addedDate: 1699000000 },
  { id: 30, name: "Adjustable Wrench Set (3pc)", category: "Tools & Hardware", price: 34.99, image: IMG.tools2, rating: 4.5, reviews: 145, stock: 60, isNew: true, popularity: 64, addedDate: 1737000000 },
  { id: 31, name: "Digital Spirit Level", category: "Tools & Hardware", price: 49.99, image: IMG.tools1, rating: 4.7, reviews: 88, stock: 5, isNew: true, popularity: 67, addedDate: 1742000000 },

  // Sports & Outdoors
  { id: 32, name: "Hiking Daypack 30L", category: "Sports & Outdoors", price: 79.99, originalPrice: 99.99, image: IMG.sports1, rating: 4.7, reviews: 423, stock: 38, isNew: false, popularity: 90, addedDate: 1701000000 },
  { id: 33, name: "Resistance Band Set (5pc)", category: "Sports & Outdoors", price: 29.99, image: IMG.sports2, rating: 4.6, reviews: 567, stock: 120, isNew: false, popularity: 83, addedDate: 1703000000 },
  { id: 34, name: "Insulated Water Bottle 750ml", category: "Sports & Outdoors", price: 34.99, image: IMG.sports3, rating: 4.5, reviews: 312, stock: 95, isNew: true, popularity: 76, addedDate: 1740000000 },
  { id: 35, name: "Baseball Glove Pro", category: "Sports & Outdoors", price: 129.99, originalPrice: 159.99, image: IMG.sports2, rating: 4.8, reviews: 78, stock: 1, isNew: false, popularity: 71, addedDate: 1709000000 },
  { id: 36, name: "Yoga Mat Non-Slip 6mm", category: "Sports & Outdoors", price: 49.99, image: IMG.sports1, rating: 4.6, reviews: 445, stock: 80, isNew: true, popularity: 77, addedDate: 1741000000 },
  { id: 37, name: "Trail Running Shoes", category: "Sports & Outdoors", price: 119.99, originalPrice: 149.99, image: IMG.sports3, rating: 4.7, reviews: 234, stock: 22, isNew: true, popularity: 85, addedDate: 1745000000 },

  // Books & Stationery
  { id: 38, name: "The Design Thinking Playbook", category: "Books & Stationery", price: 29.99, image: IMG.books1, rating: 4.7, reviews: 389, stock: 65, isNew: false, popularity: 76, addedDate: 1700000000 },
  { id: 39, name: "Genuine Leather Notebook A5", category: "Books & Stationery", price: 24.99, originalPrice: 34.99, image: IMG.books2, rating: 4.6, reviews: 256, stock: 5, isNew: false, popularity: 72, addedDate: 1702000000 },
  { id: 40, name: "Bullet Journal Premium Set", category: "Books & Stationery", price: 19.99, image: IMG.books1, rating: 4.5, reviews: 178, stock: 4, isNew: true, popularity: 67, addedDate: 1739000000 },
  { id: 41, name: "Premium Fountain Pen Set", category: "Books & Stationery", price: 49.99, image: IMG.books2, rating: 4.8, reviews: 134, stock: 28, isNew: false, popularity: 73, addedDate: 1705000000 },
  { id: 42, name: "Watercolor Sketchbook A4", category: "Books & Stationery", price: 22.99, image: IMG.books1, rating: 4.5, reviews: 167, stock: 55, isNew: true, popularity: 64, addedDate: 1741000000 },
];
