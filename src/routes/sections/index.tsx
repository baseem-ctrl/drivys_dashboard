import { Navigate, useRoutes } from 'react-router-dom';
// layouts
import MainLayout from 'src/layouts/main';
// config
// import { PATH_AFTER_LOGIN } from 'src/config-global';
//
import { mainRoutes, HomePage } from './main';
import OverviewEcommercePage from 'src/pages/dashboard/ecommerce';
import { authRoutes } from './auth';
import { authDemoRoutes } from './auth-demo';
import { dashboardRoutes } from './dashboard';
import { componentsRoutes } from './components';
import { PATH_AFTER_LOGIN_SCHOOL_ADMIN, PATH_AFTER_LOGIN } from 'src/config-global';
import { paths } from '../paths';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
// ----------------------------------------------------------------------

export default function Router({ is_user_type_school_admin }: any) {
  const navigate = useNavigate();

  // Trigger navigation when path changes
  // useEffect(() => {
  //   if (is_user_type_school_admin) {
  //     navigate(paths.dashboard.school.admin('admin'));  // Navigate to school details page
  //   }
  // }, [is_user_type_school_admin]);

  return useRoutes([
    // SET INDEX PAGE WITH SKIP HOME PAGE
    // {
    //   path: '/',
    //   element: <Navigate to={PATH_AFTER_LOGIN} replace />,
    // },

    // ----------------------------------------------------------------------

    // SET INDEX PAGE WITH HOME PAGE
    {
      path: '/',
      element: <Navigate to={paths.dashboard.root} />,
    },

    // Auth routes
    ...authRoutes,
    ...authDemoRoutes,

    // Dashboard routes
    ...dashboardRoutes,

    // Main routes
    ...mainRoutes,

    // Components routes
    ...componentsRoutes,

    // No match 404
    { path: '*', element: <Navigate to="/404" replace /> },
  ]);
}
