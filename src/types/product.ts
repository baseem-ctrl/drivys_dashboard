// ----------------------------------------------------------------------

export type IProductFilterValue = string | string[] | number | number[];

export type IProductFilters = {
  rating?: string;
  gender?: string[];
  category?: string;
  colors?: string[];
  name?: string;
  stock?: string[];
  publish?: string[];
  price_min?: number | null;
  price_max?: number | null;
};

// ----------------------------------------------------------------------

export type IProductReviewNewForm = {
  rating: number | null;
  review: string;
  name: string;
  email: string;
};

export type IProductReview = {
  id: string;
  name: string;
  rating: number;
  comment: string;
  helpful: number;
  avatarUrl: string;
  isPurchased: boolean;
  attachments?: string[];
  postedAt: Date;
};

export type IProductItem = {
  id: string;
  sku: string;
  name: string;
  price: number;
  discount_price: number;
  discount_end: number;
  cost_price: number;
  weight: number;
  max_quantity_per_customer: number;
  ability_to_write_note: number;
  in_stock: number;
  product_translations: {}[];
  product_pictures: {}[];
  tags: string[];
  gender: string;
  sizes: string[];
  publish: string;
  coverUrl: string;
  images: string[];
  colors: string[];
  quantity: number;
  category: string;
  code: string;
  available: number;
  totalSold: number;
  description: string;
  totalRatings: number;
  totalReviews: number;
  inventoryType: string;
  subDescription: string;
  priceSale: number | null;
  reviews: IProductReview[];
  createdAt: Date;
  ratings: {
    name: string;
    starCount: number;
    reviewCount: number;
  }[];
  saleLabel: {
    enabled: boolean;
    content: string;
  };
  newLabel: {
    enabled: boolean;
    content: string;
  };
};

export type IProductTableFilterValue = string | string[];

export type IProductTableFilters = {
  name: string;
  stock: string[];
  publish: string[];
};

export type IProductTranslation = {
  id: number;
  product_id: string;
  locale: string;
  name: string;
  subtitle: string;
  promotional_title: string;
  product_page_description: string;
};

export type IProductPicture = {
  id: number;
  order: string;
  picture: {
    id: number;
    virtual_path: string;
    virtual_large_path: string | null;
    description: string;
  };
};

export type IProduct = {
  id: string;
  sku: string;
  categroy_ids: [];
  price: string;
  discount_price: string;
  discount_end: string;
  cost_price: string;
  weight: string;
  weight_unit: string;
  max_quantity_per_customer: string;
  ability_to_write_note: string;
  in_stock: string;
  mpn: string;
  gtin: string;
  product_translations: IProductTranslation[];
  product_pictures: IProductPicture[];
  newProduct: boolean;
  picture: {
    id: number;
    virtual_path: string;
    virtual_large_path: string | null;
    description: string;
  };
};

type TranslationsObj = {
  name: string;
  description: string;
  locale: string;
};

export type IDeliveryItem = {
  id: string;
  day_of_week: string;
  max_orders: string;
  published: string;
  start_time: string;
  end_time: string;
  translations: TranslationsObj[];
};
