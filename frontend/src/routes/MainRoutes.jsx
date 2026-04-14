import { lazy } from 'react';
import Loadable from 'components/Loadable';
import DashboardLayout from 'layout/Dashboard';
import ProtectedRoute from '../utils/ProtectedRoute';

const DashboardDefault = Loadable(lazy(() => import('pages/dashboard/default')));
const LogsDefault      = Loadable(lazy(() => import('pages/maillogs/default')));
const HealthScore      = Loadable(lazy(() => import('pages/intelligence/HealthScore')));
const Conflicts        = Loadable(lazy(() => import('pages/intelligence/Conflicts')));
const Relationships    = Loadable(lazy(() => import('pages/intelligence/Relationships')));
const Suggestions      = Loadable(lazy(() => import('pages/intelligence/Suggestions')));
const IntentStats      = Loadable(lazy(() => import('pages/intelligence/IntentStats')));
const AICommandCenter  = Loadable(lazy(() => import('pages/intelligence/AICommandCenter')));

const MainRoutes = {
  path: '/',
  element: (
    <ProtectedRoute>
      <DashboardLayout />
    </ProtectedRoute>
  ),
  children: [
    { path: '/',                            element: <DashboardDefault />  },
    { path: 'dashboard',                    element: <DashboardDefault />  },
    { path: 'maillogs',                     element: <LogsDefault />       },
    { path: 'intelligence/health',          element: <HealthScore />        },
    { path: 'intelligence/conflicts',       element: <Conflicts />          },
    { path: 'intelligence/relationships',   element: <Relationships />      },
    { path: 'intelligence/suggestions',     element: <Suggestions />        },
    { path: 'intelligence/intent',          element: <IntentStats />        },
    { path: 'intelligence/ai-command',      element: <AICommandCenter />    }
  ]
};

export default MainRoutes;
