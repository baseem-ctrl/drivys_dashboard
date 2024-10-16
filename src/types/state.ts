export type IStateItem = {
  name: string;
  locale: string;
  published: string;
  id: string;
  order: string;
  is_published: string;
  translations: {
    name: string;
    locale: string;
  }[];
};
