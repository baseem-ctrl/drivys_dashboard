import { useMemo } from 'react';
// routes
import { paths } from 'src/routes/paths';
// locales
import { useLocales } from 'src/locales';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import SvgColor from 'src/components/svg-color';
import OverviewCollectorPage from 'src/sections/collector/overview-collector';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
  // OR
  // <Iconify icon="fluent:mail-24-filled" />
  // https://icon-sets.iconify.design/solar/
  // https://www.streamlinehq.com/icons
);

const ICONS = {
  job: icon('ic_job'),
  commission: icon('ic_commission'),

  blog: icon('ic_blog'),
  chat: icon('ic_chat'),
  mail: icon('ic_mail'),
  user: icon('ic_user'),
  file: icon('ic_file'),
  lock: icon('ic_lock'),
  tour: icon('ic_tour'),
  order: icon('ic_order'),
  label: icon('ic_label'),
  blank: icon('ic_blank'),
  kanban: icon('ic_kanban'),
  folder: icon('ic_folder'),
  banking: icon('ic_banking'),
  booking: icon('ic_booking_icon'),
  invoice: icon('ic_invoice'),
  product: icon('ic_product'),
  calendar: icon('ic_calendar'),
  disabled: icon('ic_disabled'),
  external: icon('ic_external'),
  menuItem: icon('ic_menu_item'),
  ecommerce: icon('ic_ecommerce'),
  analytics: icon('ic_analytics'),
  dashboard: icon('ic_dashboard'),
  language: icon('ic_setting'),
  delivery: icon('ic_delivery'),
  school: icon('ic_school'),

  package: icon('ic_package'),
  map: icon('ic_map'),
};

// ----------------------------------------------------------------------

export function useNavData() {
  const { t } = useLocales();
  const allroutes = [
    //TO DO list

    {
      title: t('to_do'),
      path: paths.dashboard.todo.root,
      icon: ICONS.tour,
      children: [
        { title: t('pending_verification'), path: paths.dashboard.todo.pendingVerification },
        { title: t('pending_refund'), path: paths.dashboard.todo.pendingRefund },
        {
          title: t('updated_trainer_profile'),
          path: paths.dashboard.todo.trainerProfileUpdates,
        },
        {
          title: t('pending_trainer_rewards'),
          path: paths.dashboard.todo.trainerPendingRewards,
        },
      ],
    },

    // USER
    {
      title: t('user'),
      path: paths.dashboard.user.list,
      icon: ICONS.user,
      children: [
        // { title: t('profile'), path: paths.dashboard.user.root },
        // { title: t('cards'), path: paths.dashboard.user.cards },
        { title: t('list'), path: paths.dashboard.user.list },
        { title: t('create'), path: paths.dashboard.user.new },
        // { title: t('edit'), path: paths.dashboard.user.demo.edit },
        // { title: t('account'), path: paths.dashboard.user.account },
      ],
    },

    // PRODUCT
    // {
    //   title: t('product'),
    //   path: paths.dashboard.product.root,
    //   icon: ICONS.product,
    // },

    // ORDER
    // {
    //   title: t('order'),
    //   path: paths.dashboard.order.root,
    //   icon: ICONS.order,
    //   children: [
    //     { title: t('list'), path: paths.dashboard.order.root },
    //     { title: t('details'), path: paths.dashboard.order.demo.details },
    //   ],
    // },

    // BOOKING

    // JOB
    // {
    //   title: t('job'),
    //   path: paths.dashboard.job.root,
    //   icon: ICONS.job,
    //   children: [
    //     { title: t('list'), path: paths.dashboard.job.root },
    //     { title: t('details'), path: paths.dashboard.job.demo.details },
    //     { title: t('create'), path: paths.dashboard.job.new },
    //     { title: t('edit'), path: paths.dashboard.job.demo.edit },
    //   ],
    // },

    // CATEGORY
    {
      title: t('category'),
      path: paths.dashboard.category.root,
      icon: ICONS.job,
    },

    // DELIVERY
    {
      title: t('schools'),
      path: paths.dashboard.school.root,
      icon: ICONS.school,
      // children: [
      //   { title: t('list'), path: paths.dashboard.school.root }
      //   ,{ title: t('details'), path: paths.dashboard.school.details }
      // ],
    },
    {
      title: t('certificates'),
      path: paths.dashboard.awatingCertificate,
      icon: ICONS.file,
      children: [
        { title: t('awaiting_certificates'), path: paths.dashboard.awatingCertificate },
        { title: t('approved_certificates'), path: paths.dashboard.approvedCertificate },
      ],
    },

    {
      title: t('commission'),
      path: paths.dashboard.review.root,
      icon: ICONS.commission,
      children: [
        { title: t('trainer_commission'), path: paths.dashboard.commission.root },
        {
          title: t('trainer_certificate_commission'),
          path: paths.dashboard.commission.certificateCommissionTrainer,
        },
        {
          title: t('drivys_certificate_commission'),
          path: paths.dashboard.commission.certificateCommissionDrivys,
        },
      ],
    },
    // HOME LISTING
    {
      title: t('home_page_listing'),
      path: paths.dashboard.homelisting.root,
      icon: ICONS.kanban,
      // children: [
      //   { title: t('list'), path: paths.dashboard.school.root }
      //   ,{ title: t('details'), path: paths.dashboard.school.details }
      // ],
    },
    {
      title: t('notifications'),
      path: paths.dashboard.notification.root,
      icon: ICONS.mail,
    },
    // PACKAGE
    {
      title: t('package'),
      path: paths.dashboard.package.root,
      icon: ICONS.blank,
      // children: [
      //   { title: t('list'), path: paths.dashboard.school.root }
      //   ,{ title: t('details'), path: paths.dashboard.school.details }
      // ],
    },
    // COUPON

    // to do

    {
      title: t('coupon'),
      path: paths.dashboard.coupon.root,
      icon: ICONS.file,
    },

    {
      title: t('slider'),
      path: paths.dashboard.slider.root,
      icon: ICONS.external,
    },
    {
      title: t('loyality'),
      path: paths.dashboard.loyality.root,
      icon: ICONS.order,
    },

    {
      title: t('booking'),
      path: paths.dashboard.booking.root,
      icon: ICONS.booking,

      children: [
        { title: t('booking'), path: paths.dashboard.booking.root },
        { title: t('refund'), path: paths.dashboard.booking.refund },
      ],
    },
    {
      title: t('reviews'),
      path: paths.dashboard.review.root,
      icon: ICONS.chat,
      children: [
        { title: t('trainer_review'), path: paths.dashboard.review.trainerReview },
        { title: t('student_review'), path: paths.dashboard.review.studentReview },
      ],
    },

    // TOUR
    // {
    //   title: t('tour'),
    //   path: paths.dashboard.tour.root,
    //   icon: ICONS.tour,
    //   children: [
    //     { title: t('list'), path: paths.dashboard.tour.root },
    //     { title: t('details'), path: paths.dashboard.tour.demo.details },
    //     { title: t('create'), path: paths.dashboard.tour.new },
    //     { title: t('edit'), path: paths.dashboard.tour.demo.edit },
    //   ],
    // },
    {
      title: t('payouts'),
      path: paths.dashboard.payouts.root,
      icon: ICONS.invoice,
      children: [
        { title: t('trainer_payouts'), path: paths.dashboard.payouts.root },
        { title: t('school_payouts'), path: paths.dashboard.payouts.school },

        // { title: t('details'), path: paths.dashboard.tour.demo.details },
        // { title: t('create'), path: paths.dashboard.tour.new },
        // { title: t('edit'), path: paths.dashboard.tour.demo.edit },
      ],
    },
    // KANBAN
    // {
    //   title: t('kanban'),
    //   path: paths.dashboard.kanban,
    //   icon: ICONS.kanban,
    // },

    // SYSTEM SETTINGS
    {
      title: t('system_settings'),
      path: paths.dashboard.system.root,
      icon: ICONS.language,
      children: [
        { title: t('language'), path: paths.dashboard.system.root },
        { title: t('city'), path: paths.dashboard.system.city },
        // { title: t('City Details'), path: `${paths.dashboard.system.city}/:id` },
        { title: t('areas'), path: paths.dashboard.system.state },
        { title: t('dialect'), path: paths.dashboard.system.dialect },
        { title: t('pickup'), path: paths.dashboard.system.pickup },
        { title: t('app_settings'), path: paths.dashboard.system.appsettings },

        // { title: t('details'), path: paths.dashboard.tour.demo.details },
        // { title: t('create'), path: paths.dashboard.tour.new },
        // { title: t('edit'), path: paths.dashboard.tour.demo.edit },
      ],
    },
  ];
  const schooladminRoutes = [
    {
      title: t('to_do'),
      path: paths.dashboard.todo.root,
      icon: ICONS.tour,
      children: [
        { title: t('pending_verification'), path: paths.dashboard.todo.pendingVerification },
        // { title: t('pending refund'), path: paths.dashboard.todo.pendingRefund },
        { title: t('pending_certificates'), path: paths.dashboard.todo.todoPendingCertificates },
      ],
    },
    {
      title: t('My School'),
      path: paths.dashboard.school.admin('admin'),
      icon: ICONS.school,
    },
    {
      title: t('certificates'),
      path: paths.dashboard.school.awatingCertificate,
      icon: ICONS.file,
      children: [
        { title: t('awaiting_certificates'), path: paths.dashboard.school.awatingCertificate },
        {
          title: t('approved_certificates'),
          path: paths.dashboard.school.approvedCertificate,
        },
      ],
    },

    {
      title: t('trainers'),
      path: paths.dashboard.school.trainer,
      icon: ICONS.user,
      children: [
        { title: t('trainer_list'), path: paths.dashboard.school.trainer },
        { title: t('rewards'), path: paths.dashboard.school.trainerRewards },
        { title: t('trainer_notifications'), path: paths.dashboard.school.trainerNotifications },
      ],
    },
    {
      title: t('commission'),
      path: paths.dashboard.review.root,
      icon: ICONS.commission,
      children: [
        { title: t('trainer_commission'), path: paths.dashboard.commission.root },
        {
          title: t('trainer_certificate_commission'),
          path: paths.dashboard.commission.certificateCommissionTrainer,
        },
      ],
    },
    {
      title: t('package'),
      path: paths.dashboard.school.package,
      icon: ICONS.blank,
    },
    {
      title: t('booking'),
      path: paths.dashboard.booking.root,
      icon: ICONS.booking,
    },
    {
      title: t('reviews'),
      path: paths.dashboard.review.root,
      icon: ICONS.chat,
      children: [
        { title: t('trainer_review'), path: paths.dashboard.review.trainerReview },
        { title: t('student_review'), path: paths.dashboard.review.studentReview },
      ],
    },
  ];
  const collectorRoutes = [
    {
      title: t('dashboard'),
      path: 'collector',
      icon: ICONS.dashboard,
      children: [{ title: t('overview'), path: 'overview' }],
    },
  ];

  console.log('Collector Routes:', collectorRoutes);

  const userType = localStorage.getItem('user_type');
  const routes = (() => {
    switch (userType) {
      case 'SCHOOL_ADMIN':
        return schooladminRoutes;
      case 'COLLECTOR':
        return collectorRoutes;
      default:
        return allroutes;
    }
  })();

  const data = useMemo(
    () => [
      // OVERVIEW
      // ----------------------------------------------------------------------
      {
        subheader: t('overview'),
        items: [
          {
            title: t('analytics'),
            path: paths.dashboard.root,
            icon: ICONS.analytics,
          },
          {
            title: t('live_location'),
            path: paths.dashboard.location,
            icon: ICONS.map,
          },
        ],
      },

      // MANAGEMENT
      // ----------------------------------------------------------------------
      {
        subheader: t(userType === 'SCHOOL_ADMIN' ? 'management' : 'management'),
        items: routes,
      },

      // DEMO MENU STATES
    ],
    [t]
  );

  return data;
}
