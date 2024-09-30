import axios, { AxiosRequestConfig } from 'axios';
// config
import { HOST_API } from 'src/config-global';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: HOST_API });

// Request interceptor to set the Authorization header
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong')
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const barrySmasher = async (args: string | [string, AxiosRequestConfig]) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosInstance.delete(url, { ...config });

  return res.data;
};

// ----------------------------------------------------------------------

export const fetcher = async (args: string | [string, AxiosRequestConfig]) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosInstance.get(url, { ...config });

  return res.data;
};

// ----------------------------------------------------------------------

export const drivysCreator = async (args: string | [string, AxiosRequestConfig]) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosInstance.post(url, config);
  return res.data;
};

// ----------------------------------------------------------------------

export const drivysCreatorPut = async (args: string | [string, AxiosRequestConfig]) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosInstance.put(url, config);
  return res.data;
};

// ----------------------------------------------------------------------

export const drivysFetcher = async (args: string | [string, AxiosRequestConfig]) => {
  const [url, config] = Array.isArray(args) ? args : [args];
  const res = await axiosInstance.get(url, { ...config });
  return res.data;
};

// ----------------------------------------------------------------------

export const endpoints = {
  chat: '/api/chat',
  kanban: '/api/kanban',
  calendar: '/api/calendar',
  auth: {
    me: 'admin/auth/who-am-i',
    login: 'admin/auth/login',
    register: '/api/auth/register',
  },
  mail: {
    list: '/api/mail/list',
    details: '/api/mail/details',
    labels: '/api/mail/labels',
  },
  post: {
    list: '/api/post/list',
    details: '/api/post/details',
    latest: '/api/post/latest',
    search: '/api/post/search',
  },
  product: {
    create: 'admin/product/create-product-translation',
    update: 'admin/product/update-product-mapping',
    list: 'admin/product/get-product-list',
    details: '/api/product/details',
    search: '/api/product/search',
    delete: 'admin/product/delete-product/',
    delete_pic: 'admin/product/delete-product-pictures',
  },
  allimage: {
    create: 'auth/picture/upload-picture-multi',
    createSingle: 'auth/picture/upload-picture',
    list: 'auth/picture/get-picture',
  },
  category: {
    create: 'admin/category/create-category-translation',
    list: 'admin/category/get-category-list-with-translation',
    delete: 'admin/category/delete-category-translation-pictures',
    deleteId: 'admin/category/delete-category/',
  },
  language: {
    list: 'admin/user/languages',
    delete: 'admin/user/languages/',
    create: 'admin/user/languages',
    update: 'admin/user/languages/',
  },
  coupon: {
    list: 'admin/discount/get-discount-list',
    delete: 'admin/discount/delete-discount/',
    createUpdate: 'admin/discount/create-discount',
  },
  school: {
    list: 'admin/vendor/get-vendor-list',
    details: 'admin/vendor/get-vendor/',
    delete: 'admin/vendor/delete-vendor/',
    create: 'admin/vendor/create-vendor-translation',
    update: 'admin/delivery-slot/create-delivery-slot-translation',
    admin: 'admin/user/get-list',
    address: 'admin/vendor/address/create-update-address',
  },
};
