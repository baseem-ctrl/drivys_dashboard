export type ILanguageItem = {
  id: string;
  name: string;
  language_culture: string;
  flag_id: string;
  published: string;
  display_order: string;
};

export type ICouponItem = {
  id: string;
  name: string;
  coupon_code: string;
  discount_type_id: string;
  starting_date: any;
  value: number;
  ending_date: any;
  limitation_times: number;
  is_active:any;
  use_percentage:boolean;
  product_ids:any;
  category_ids:any;
  products:any;
  categories:any;
};
export type ICouponFilter = {
  id: string;
  name: string;
  discount_type_id: string;
  starting_date: any;
  value: number;
  ending_date: any;
  is_active:any;

};


