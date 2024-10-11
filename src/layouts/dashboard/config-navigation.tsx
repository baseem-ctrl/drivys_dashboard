import { useMemo } from 'react';
// routes
import { paths } from 'src/routes/paths';
// locales
import { useLocales } from 'src/locales';
// components
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import SvgColor from 'src/components/svg-color';

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
  booking: icon('ic_booking'),
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
};

// ----------------------------------------------------------------------

export function useNavData() {
  const { t } = useLocales();

  const allroutes = [
    // USER
    {
      title: t('user'),
      path: paths.dashboard.user.root,
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

    // BLOG
    // {
    //   title: t('blog'),
    //   path: paths.dashboard.post.root,
    //   icon: ICONS.blog,
    //   children: [
    //     { title: t('list'), path: paths.dashboard.post.root },
    //     { title: t('details'), path: paths.dashboard.post.demo.details },
    //     { title: t('create'), path: paths.dashboard.post.new },
    //     { title: t('edit'), path: paths.dashboard.post.demo.edit },
    //   ],
    // },

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
    // PACKAGE
    {
      title: t('package'),
      path: paths.dashboard.package.root,
      icon: ICONS.booking,
      // children: [
      //   { title: t('list'), path: paths.dashboard.school.root }
      //   ,{ title: t('details'), path: paths.dashboard.school.details }
      // ],
    },
    // COUPON
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

    // KANBAN
    // {
    //   title: t('kanban'),
    //   path: paths.dashboard.kanban,
    //   icon: ICONS.kanban,
    // },

    // SYSTEM SETTINGS
    {
      title: t('System Settings'),
      path: paths.dashboard.system.root,
      icon: ICONS.language,
      children: [
        { title: t('Language'), path: paths.dashboard.system.root },
        { title: t('City'), path: paths.dashboard.system.city },
        // { title: t('details'), path: paths.dashboard.tour.demo.details },
        // { title: t('create'), path: paths.dashboard.tour.new },
        // { title: t('edit'), path: paths.dashboard.tour.demo.edit },
      ],
    },
  ];
  const schooladminRoutes: never[] = [];

  const userType = localStorage.getItem('user_type');
  const routes = (() => {
    switch (userType) {
      case 'SCHOOL_ADMIN':
        return schooladminRoutes;
      default:
        return allroutes;
    }
  })();

  const data = useMemo(
    () => [
      // OVERVIEW
      // ----------------------------------------------------------------------
      // {
      //   subheader: t('overview'),
      //   items: [
      //     {
      //       title: t('ecommerce'),
      //       path: paths.dashboard.general.ecommerce,
      //       icon: ICONS.ecommerce,
      //     },
      //   ],
      // },

      // MANAGEMENT
      // ----------------------------------------------------------------------
      {
        subheader: t(userType === 'SCHOOL_ADMIN' ? '' : 'management'),
        items: routes,
      },

      // DEMO MENU STATES
    ],
    [t]
  );

  return data;
}
