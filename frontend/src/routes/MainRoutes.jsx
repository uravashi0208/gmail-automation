// routes/MainRoutes.jsx
import { lazy } from 'react';
import Loadable from 'components/Loadable';
import DashboardLayout from 'layout/Dashboard';
import ProtectedRoute from '../utils/ProtectedRoute';

// pages
const DashboardDefault = Loadable(lazy(() => import('pages/dashboard/default')));
const LogsDefault = Loadable(lazy(() => import('pages/maillogs/default')));

const MainRoutes = {
  path: '/',
  element: (
    <ProtectedRoute>
      <DashboardLayout />
    </ProtectedRoute>
  ),
  children: [
    {
      path: '/',
      element: <DashboardDefault />
    },
    {
      path: 'dashboard',
      element: <DashboardDefault />
    },
    {
      path: 'maillogs',
      element: <LogsDefault />
    }
  ]
};

export default MainRoutes;
