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
import NotificationsListingListPage from 'src/pages/dashboard/notifications/notifications';
import NotificationDetails from 'src/sections/notifications/view/notifications-details';
import CityDetailsView from 'src/sections/city/view/city-details-view';
import RefundListView from 'src/sections/refund/view/refund-list-view';
import RefundDetailsComponent from 'src/sections/refund/view/refund-details-view';
import PickupListPage from 'src/pages/pickup/pickup';
import SchoolTrainersListView from 'src/sections/school/login_school_admin/school-trainers-list-view';
import SchoolPackageListView from 'src/sections/school/login_school_admin/school-packages-list-view';
import RewardDetailsPage from 'src/sections/school/trainer-reward/reward-details';
import TrainerNotificationForm from 'src/sections/school/trainer-reward/create-trainer-notification';
import StudentReviewListView from 'src/sections/student-review/view/review-list-view';
import TrainerReviewListView from 'src/sections/trainer-review/view/review-list-view';
import ToDoListViewVerification from 'src/sections/todo/refund/todo-list-view-verification';
import ToDoListViewRefund from 'src/sections/todo/refund/todo-list-view-refund';
import ToDoListSchoolAdminViewVerification from 'src/sections/todo-school-admin/todo-list-view-verification';
import ToDoListViewRefundSchoolAdmin from 'src/sections/todo-school-admin/todo-list-view-refund';
import CertificateListView from 'src/sections/awaiting-certificate/view/certificate-list-view';
import LoyalityProgramListView from 'src/sections/loyality-program/view/loyality-program-list-view';
import TrainerLiveLocation from 'src/sections/trainer-live-location/trainer-location';
import TrainerPayoutPage from 'src/sections/payouts/trainer/trainer-payouts-view';
import SchoolPayoutPage from 'src/sections/payouts/school/school-payouts-view';
import { BookingDetailsTable } from 'src/sections/payouts/trainer/trainer-booking-details';
import { SchoolBookingDetailsTable } from 'src/sections/payouts/school/school-booking-details';
import TrainerProfileUpdatesListView from 'src/sections/trainer-profile-updates/view/trainer-profile-update-list-view';
import CertificateCommissionTrainer from 'src/sections/certificate-commission-trainer/view/certificate-commission-trainer-list-view';
import CertificateCommissionDrivys from 'src/sections/certificate-commission/view/certificate-commission-list-view';
import TrainerCommission from 'src/sections/trainer-commission/view/trainer-commission-list-view';
import ToDoListPendingReward from 'src/sections/todo/refund/to-do-list-pending-rewards';
import LoyaltyProgramDetails from 'src/sections/loyality-program/view/loyalty-program-details';
import OverviewCollectorPage from 'src/sections/collector/overview-collector';
import TrainerCashInHand from 'src/sections/collector/trainer-cash-in-hand/view/trainer-cash-in-hand-list-view';
import TermsPageList from 'src/sections/terms-and-conditions/terms-and-condition-list';
import BookingReportListView from 'src/sections/booking-report/view/booking-report-list-view';
import RevenueReportListView from 'src/sections/revenue-report/view/revenue-report-list-view';
import TrainerReportListView from 'src/sections/trainer-report/view/trainer-report-list-view';
import StudentReportListView from 'src/sections/student-report/view/student-report-list-view';
import SchoolReportListView from 'src/sections/school-report/view/school-report-list-view';
import RolesListView from 'src/sections/roles/view/roles-list-view';
import RolesSchoolAdminListView from 'src/sections/roles-school-admin/view/roles-list-view';
import PermissionListView from 'src/sections/permissions/view/permissions-list-view';
import PermissionSchoolAdminListView from 'src/sections/permissions-school-admin/view/permissions-list-view';

import CollectedCashList from 'src/sections/collector/collected-cash-list/view/collected-cash-list-view';
import CashInHandList from 'src/sections/cash-in-hand-list-admin/view/cash-in-hand-list-admin-list-view';
import MappedRolePermissionListView from 'src/sections/mapped-roles-permission/view/mapped-roles-permission-view';
import MappedRolePermissionSchoolAdminListView from 'src/sections/mapped-roles-permission-school-admin/view/mapped-roles-permission-view';

import SupportlistingListView from 'src/sections/support/view/support-list-view';
import SchoolAdminPayoutPage from 'src/sections/school-payout/school-payouts-view';
import BookingReportListSchoolAdminView from 'src/sections/school-report-section/booking-report/view/booking-report-list-view';
import RevenueReportListSchoolAdminView from 'src/sections/school-report-section/revenue-report/view/revenue-report-list-view';
import TrainerReportListSchoolAdminView from 'src/sections/school-report-section/trainer-report/view/trainer-report-list-view';
import SchoolReportListSchoolAdminView from 'src/sections/school-report-section/school-report/view/school-report-list-view';
import StudentReportListSchoolAdminView from 'src/sections/school-report-section/student-report/view/student-report-list-view';
import OverviewAssistant from 'src/sections/assistant/overview-assistant';
import EditProfilePopover from 'src/sections/assistant/edit-profile';
import StudentListView from 'src/sections/assistant/student/view/student-list-view';
import AddNewStudent from 'src/sections/assistant/student/new-student';
import SchoolAdminStudentReviewListView from 'src/sections/student-review-school-admin/view/review-list-view';
import SchoolAdminTrainerReviewListView from 'src/sections/trainer-review-school-admin/view/review-list-view';
import TrainerListPage from 'src/sections/assistant/trainer/view/trainer-list-view';
import CreateBooking from 'src/sections/assistant/booking/create-booking';

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
const AppSettingsListPage = lazy(() => import('src/pages/dashboard/app-settings/list'));

// COUPON
const CouponListPage = lazy(() => import('src/pages/dashboard/coupon/list'));
// ----------------------------------------------------------------------

const allroutes = [
  { element: <OverviewEcommercePage />, index: true },
  { path: 'ecommerce', element: <OverviewEcommercePage /> },

  {
    path: 'user',
    children: [
      { element: <UserListPage />, index: true },
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
    path: 'commission',
    children: [
      { path: 'trainer-commission', element: <TrainerCommission />, index: true },
      { path: 'certificate-commission-trainer', element: <CertificateCommissionTrainer /> },
      { path: 'certificate-commission-drivys', element: <CertificateCommissionDrivys /> },
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

  {
    path: 'notifications',
    children: [
      { element: <NotificationsListingListPage />, index: true },

      // { path: 'edit', element: <HomeListingDetailsPage /> },
      // { path: 'admin/:id', element: <UserDetailsAdminPage /> },
    ],
  },
  // to do
  {
    path: 'coupon',
    children: [
      { element: <CouponListPage />, index: true },
      { path: 'list', element: <CouponListPage /> },
    ],
  },
  {
    path: 'review',
    children: [
      { path: 'student-review', element: <StudentReviewListView /> },
      { path: 'trainer-review', element: <TrainerReviewListView />, index: true },
    ],
  },

  {
    path: 'todo',
    children: [
      { element: <ToDoListViewVerification />, index: true },
      { path: 'pending-verification', element: <ToDoListViewVerification /> },
      { path: 'pending-refund', element: <ToDoListViewRefund />, index: true },
      { path: 'trainer-pending-rewards', element: <ToDoListPendingReward /> },
      { path: 'trainer-profile-updates', element: <TrainerProfileUpdatesListView /> },
    ],
  },
  { path: 'awaiting-certificate', element: <CertificateListView />, index: true },
  { path: 'approved-certificate', element: <CertificateListView /> },

  // { path: 'certificate-create', element: <GenerateCertificateForm /> },
  {
    path: 'system',
    children: [
      { element: <LanguageListPage />, index: true },
      { path: 'language', element: <LanguageListPage /> },
      { path: 'city', element: <CityListPage /> },
      { path: 'city/:id', element: <CityDetailsView /> },
      { path: 'state', element: <StateListPage /> },
      { path: 'appsettings', element: <AppSettingsListPage /> },
      { path: 'terms-conditions', element: <TermsPageList /> },

      { path: 'dialect', element: <DialectListPage /> },
      { path: 'pickup', element: <PickupListPage /> },
      // { path: ':id', element: <JobDetailsPage /> },
      // { path: 'new', element: <JobCreatePage /> },
      // { path: ':id/edit', element: <JobEditPage /> },
    ],
  },
  {
    path: 'report',
    children: [
      { path: 'bookings', element: <BookingReportListView /> },
      { path: 'revenue', element: <RevenueReportListView /> },
      { path: 'trainer', element: <TrainerReportListView /> },
      { path: 'student', element: <StudentReportListView /> },
      { path: 'school', element: <SchoolReportListView /> },
    ],
  },
  {
    path: 'roles-and-permission',
    children: [
      { path: 'roles', element: <RolesListView /> },
      { path: 'permission', element: <PermissionListView /> },
      { path: 'mapping', element: <MappedRolePermissionListView /> },
    ],
  },
  {
    path: 'collector',
    children: [
      { path: 'cash-in-hand', element: <CashInHandList />, index: true },
      // { path: 'permission', element: <PermissionListView /> },
    ],
  },
  {
    path: 'support',
    children: [{ element: <SupportlistingListView />, index: true }],
  },
  { path: 'loyality', element: <LoyalityProgramListView />, index: true },
  { path: 'loyality/:id', element: <LoyaltyProgramDetails /> },

  { path: 'trainers-location', element: <TrainerLiveLocation />, index: true },

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

  {
    path: 'payouts',
    children: [
      { element: <TrainerPayoutPage />, index: true },
      { path: ':id', element: <BookingDetailsTable /> },
      { path: 'school', element: <SchoolPayoutPage /> },
      { path: 'school/:id', element: <SchoolBookingDetailsTable /> },

      // { path: 'new', element: <TourCreatePage /> },
      // { path: ':id/edit', element: <TourEditPage /> },
    ],
  },
  { path: 'kanban', element: <KanbanPage /> },
  { path: 'permission', element: <PermissionDeniedPage /> },
  { path: 'blank', element: <BlankPage /> },
  {
    path: 'booking',
    children: [
      { element: <BookingListView />, index: true },
      { path: 'refund', element: <RefundListView /> },
      { path: 'refund/:id', element: <RefundDetailsComponent /> },
      { path: ':id', element: <BookingDetailsComponent /> },
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
      { path: 'account', element: <UserAccountPage /> },
      { path: 'rewards', element: <RewardDetailsPage /> },
      { path: 'awaiting-certificate', element: <CertificateListView />, index: true },
      { path: 'approved-certificate', element: <CertificateListView /> },
      { path: 'notifications', element: <TrainerNotificationForm /> },
      {
        path: 'trainers-list',
        element: <SchoolTrainersListView />,
      },
      { path: 'package-list', element: <SchoolPackageListView /> },
      // { path: 'package-list', element: <SchoolPackageListView /> },

      { path: 'school-payouts', element: <SchoolAdminPayoutPage /> },
    ],
  },
  { path: 'trainers-location', element: <TrainerLiveLocation />, index: true },

  {
    path: 'booking',
    children: [
      { element: <BookingSchoolAdminListView />, index: true },
      { path: ':id', element: <BookingSchoolAdminDetailsComponent /> },
      // { path: 'new', element: <HomeSliderCreatePage /> },
    ],
  },
  {
    path: 'report',
    children: [
      { path: 'school-bookings', element: <BookingReportListSchoolAdminView /> },
      { path: 'school-revenue', element: <RevenueReportListSchoolAdminView /> },
      { path: 'school-trainer', element: <TrainerReportListSchoolAdminView /> },
      { path: 'school-student', element: <StudentReportListSchoolAdminView /> },
      { path: 'school-reports', element: <SchoolReportListSchoolAdminView /> },
    ],
  },
  {
    path: 'commission',
    children: [
      {
        path: 'trainer-commission',
        element: <TrainerCommission />,
        index: true,
      },
      {
        path: 'certificate-commission-trainer',
        element: <CertificateCommissionTrainer />,
      },
    ],
  },

  {
    path: 'review',
    children: [
      { path: 'student-review', element: <SchoolAdminStudentReviewListView /> },
      { path: 'trainer-review', element: <SchoolAdminTrainerReviewListView />, index: true },
    ],
  },

  {
    path: 'todo',
    children: [
      { element: <ToDoListSchoolAdminViewVerification />, index: true },
      { path: 'pending-verification', element: <ToDoListSchoolAdminViewVerification /> },
      // { path: 'pending-refund', element: <ToDoListViewRefund />, index: true },
      { path: 'awaiting-certificate', element: <CertificateListView />, index: true },
    ],
  },
  {
    path: 'roles-and-permission',
    children: [
      { path: 'roles', element: <RolesSchoolAdminListView /> },
      { path: 'permission', element: <PermissionSchoolAdminListView /> },
      { path: 'mapping', element: <MappedRolePermissionSchoolAdminListView /> },
    ],
  },
  {
    path: 'certificate',
    children: [
      { element: <CertificateListView />, index: true },
      // { path: 'certificate', element: <CertificateListView /> },
      // { path: 'request/:id', element: <CertificateRequestDetailsComponent /> },
      // { path: ':id', element: <CertificateDetailsComponent /> },
    ],
  },
];
const collectorRoutes = [
  {
    path: 'ecommerce',
    element: <OverviewCollectorPage />,
  },
  {
    path: 'collector',
    children: [
      { path: 'overview', element: <OverviewCollectorPage /> },
      { path: 'cash_in_hand', element: <TrainerCashInHand /> },
      { path: 'collected-list', element: <CollectedCashList /> },
    ],
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
    path: 'user',
    children: [{ path: ':id', element: <UserDetailsPage /> }],
  },
];
const assistantRoutes = [
  {
    path: 'ecommerce',
    element: <OverviewAssistant />,
  },
  {
    path: 'assistant',
    children: [
      { path: 'overview', element: <OverviewAssistant /> },
      { path: 'edit', element: <EditProfilePopover /> },
      { path: 'students', element: <StudentListView /> },
      { path: 'trainers', element: <TrainerListPage /> },
      { path: 'new-student', element: <AddNewStudent /> },
      { path: 'booking', element: <CreateBooking /> },
    ],
  },
];
const userType = localStorage.getItem('user_type');
const routes = (() => {
  switch (userType) {
    case 'SCHOOL_ADMIN':
      return schooladminRoutes;
    case 'COLLECTOR':
      return collectorRoutes;
    case 'ASSISTANT':
      return assistantRoutes;
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
