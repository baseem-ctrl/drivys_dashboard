export type ICityItem = {
  name: string;
  locale: string;
  published: string;
  is_published: string;
  city_translations: {
    name: string;
    locale: string;
  }[];
};
export type IUserTableFilterValue = string | string[];
export type ICityTableFilters = {
  name: string;
  locale: string;
};
