import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
// auth
import { AuthGuard } from 'src/auth/guard';
// layouts
import DashboardLayout from 'src/layouts/dashboard';
// components
import { LoadingScreen } from 'src/components/loading-screen';
import SchoolDetailsView from 'src/sections/school/view/school-details-view';
import SchoolDetailsPage from 'src/pages/dashboard/schools/details';
import UserDetailsPage from 'src/pages/dashboard/user/details';
import SchoolAdminDetailsPage from 'src/pages/dashboard/schools/school_admin_details';
import UserDetailsAdminPage from 'src/pages/dashboard/schools/user-details';
import HomeSliderListPage from 'src/pages/dashboard/home-slider/home-slider-list';
import HomeSliderCreatePage from 'src/pages/dashboard/home-slider/new';
import CityListPage from 'src/pages/dashboard/city/city';
import StateListPage from 'src/pages/dashboard/state/state';
import DialectListPage from 'src/pages/dashboard/dialect/dialect';
import HomeListingDetailsPage from 'src/pages/dashboard/homelisting/details';
import BookingListView from 'src/sections/booking/view/booking-list-view';
import BookingDetailsPage from 'src/pages/dashboard/booking/booking';
import BookingDetailsComponent from 'src/sections/booking/view/booking-details-view';
import BookingSchoolAdminListView from 'src/sections/bookin-school-admin/view/booking-list-view';
import BookingSchoolAdminDetailsComponent from 'src/sections/bookin-school-admin/view/booking-details-view';
import CityDetailsView from 'src/sections/city/view/city-details-view';

// ----------------------------------------------------------------------

// OVERVIEW
const IndexPage = lazy(() => import('src/pages/dashboard/app'));
const OverviewEcommercePage = lazy(() => import('src/pages/dashboard/ecommerce'));
// PRODUCT

const ProductListPage = lazy(() => import('src/pages/dashboard/product/list'));

// ORDER
const OrderListPage = lazy(() => import('src/pages/dashboard/order/list'));
const OrderDetailsPage = lazy(() => import('src/pages/dashboard/order/details'));
// USER
const UserProfilePage = lazy(() => import('src/pages/dashboard/user/profile'));
const UserCardsPage = lazy(() => import('src/pages/dashboard/user/cards'));
const UserListPage = lazy(() => import('src/pages/dashboard/user/list'));
const UserAccountPage = lazy(() => import('src/pages/dashboard/user/account'));
const UserCreatePage = lazy(() => import('src/pages/dashboard/user/new'));
const UserEditPage = lazy(() => import('src/pages/dashboard/user/edit'));
// BLOG
const BlogPostsPage = lazy(() => import('src/pages/dashboard/post/list'));
const BlogPostPage = lazy(() => import('src/pages/dashboard/post/details'));
const BlogNewPostPage = lazy(() => import('src/pages/dashboard/post/new'));
const BlogEditPostPage = lazy(() => import('src/pages/dashboard/post/edit'));
// JOB
const JobDetailsPage = lazy(() => import('src/pages/dashboard/job/details'));
const JobListPage = lazy(() => import('src/pages/dashboard/job/list'));
const JobCreatePage = lazy(() => import('src/pages/dashboard/job/new'));
const JobEditPage = lazy(() => import('src/pages/dashboard/job/edit'));
// Category
const CategoryListPage = lazy(() => import('src/pages/dashboard/category/list'));

// School
const SchoolListPage = lazy(() => import('src/pages/dashboard/schools/list'));

// Home Listing
const HomeListingListPage = lazy(() => import('src/pages/dashboard/homelisting/list'));

// Package
const PackageListPage = lazy(() => import('src/pages/dashboard/package/list'));
const PackageDetailsPage = lazy(() => import('src/pages/dashboard/package/details'));
// TOUR
const TourDetailsPage = lazy(() => import('src/pages/dashboard/tour/details'));
const TourListPage = lazy(() => import('src/pages/dashboard/tour/list'));
const TourCreatePage = lazy(() => import('src/pages/dashboard/tour/new'));
const TourEditPage = lazy(() => import('src/pages/dashboard/tour/edit'));
// APP
const KanbanPage = lazy(() => import('src/pages/dashboard/kanban'));
// TEST RENDER PAGE BY ROLE
const PermissionDeniedPage = lazy(() => import('src/pages/dashboard/permission'));
// BLANK PAGE
const BlankPage = lazy(() => import('src/pages/dashboard/blank'));

// SYSTEM
// LANGUAGE
const LanguageListPage = lazy(() => import('src/pages/dashboard/language/list'));

// COUPON
const CouponListPage = lazy(() => import('src/pages/dashboard/coupon/list'));
// ----------------------------------------------------------------------

const allroutes = [
  { element: <OverviewEcommercePage />, index: true },
  { path: 'ecommerce', element: <OverviewEcommercePage /> },

  {
    path: 'user',
    children: [
      { element: <UserProfilePage />, index: true },
      { path: 'profile', element: <UserProfilePage /> },
      { path: 'cards', element: <UserCardsPage /> },
      { path: 'list', element: <UserListPage /> },
      { path: 'new', element: <UserCreatePage /> },
      { path: ':id/edit', element: <UserEditPage /> },
      { path: 'account', element: <UserAccountPage /> },
      { path: ':id', element: <UserDetailsPage /> },
    ],
  },
  {
    path: 'product',
    children: [{ element: <ProductListPage />, index: true }],
  },
  {
    path: 'order',
    children: [
      { element: <OrderListPage />, index: true },
      { path: 'list', element: <OrderListPage /> },
      { path: ':id', element: <OrderDetailsPage /> },
    ],
  },
  {
    path: 'slider',
    children: [
      { element: <HomeSliderListPage />, index: true },
      { path: 'list', element: <HomeSliderListPage /> },
      { path: 'new', element: <HomeSliderCreatePage /> },
    ],
  },
  {
    path: 'post',
    children: [
      { element: <BlogPostsPage />, index: true },
      { path: 'list', element: <BlogPostsPage /> },
      { path: ':title', element: <BlogPostPage /> },
      { path: ':title/edit', element: <BlogEditPostPage /> },
      { path: 'new', element: <BlogNewPostPage /> },
    ],
  },
  {
    path: 'job',
    children: [
      { element: <JobListPage />, index: true },
      { path: 'list', element: <JobListPage /> },
      { path: ':id', element: <JobDetailsPage /> },
      { path: 'new', element: <JobCreatePage /> },
      { path: ':id/edit', element: <JobEditPage /> },
    ],
  },
  {
    path: 'category',
    children: [{ element: <CategoryListPage />, index: true }],
  },
  {
    path: 'school',
    children: [
      { element: <SchoolListPage />, index: true },
      { path: ':id', element: <SchoolDetailsPage /> },
      { path: 'admin', element: <SchoolAdminDetailsPage /> },
      { path: 'admin/:id', element: <UserDetailsAdminPage /> },
    ],
  },
  {
    path: 'homelisting',
    children: [
      { element: <HomeListingListPage />, index: true },
      { path: ':id', element: <HomeListingDetailsPage /> },
      { path: 'admin', element: <SchoolAdminDetailsPage /> },
      { path: 'admin/:id', element: <UserDetailsAdminPage /> },
    ],
  },

  {
    path: 'package',
    children: [
      { element: <PackageListPage />, index: true },
      { path: ':id', element: <PackageDetailsPage /> },
    ],
  },

  // to do
  {
    path: 'coupon',
    children: [{ path: 'list', element: <CouponListPage />, index: true }],
  },

  {
    path: 'system',
    children: [
      { element: <LanguageListPage />, index: true },
      { path: 'language', element: <LanguageListPage /> },
      { path: 'city', element: <CityListPage /> },
      { path: 'city/:id', element: <CityDetailsView /> },
      { path: 'state', element: <StateListPage /> },

      { path: 'dialect', element: <DialectListPage /> },
      // { path: ':id', element: <JobDetailsPage /> },
      // { path: 'new', element: <JobCreatePage /> },
      // { path: ':id/edit', element: <JobEditPage /> },
    ],
  },

  {
    path: 'tour',
    children: [
      { element: <TourListPage />, index: true },
      { path: 'list', element: <TourListPage /> },
      { path: ':id', element: <TourDetailsPage /> },
      { path: 'new', element: <TourCreatePage /> },
      { path: ':id/edit', element: <TourEditPage /> },
    ],
  },
  { path: 'kanban', element: <KanbanPage /> },
  { path: 'permission', element: <PermissionDeniedPage /> },
  { path: 'blank', element: <BlankPage /> },
  {
    path: 'booking',
    children: [
      { element: <BookingListView />, index: true },
      { path: ':id', element: <BookingDetailsComponent /> },
      // { path: 'new', element: <HomeSliderCreatePage /> },
    ],
  },
];

const schooladminRoutes = [
  { element: <OverviewEcommercePage />, index: true },
  { path: 'ecommerce', element: <OverviewEcommercePage /> },

  {
    path: 'school',
    children: [
      { path: 'admin', element: <SchoolAdminDetailsPage /> },
      { path: 'admin/:id', element: <UserDetailsAdminPage /> },
    ],
  },
  {
    path: 'booking',
    children: [
      { element: <BookingSchoolAdminListView />, index: true },
      { path: ':id', element: <BookingSchoolAdminDetailsComponent /> },
      // { path: 'new', element: <HomeSliderCreatePage /> },
    ],
  },
];
const userType = localStorage.getItem('user_type');
const routes = (() => {
  switch (userType) {
    case 'SCHOOL_ADMIN':
      return schooladminRoutes;
    default:
      return allroutes;
  }
})();

export const dashboardRoutes = [
  {
    path: 'dashboard',
    element: (
      <AuthGuard>
        <DashboardLayout>
          <Suspense fallback={<LoadingScreen />}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      </AuthGuard>
    ),
    children: routes,
  },
];
