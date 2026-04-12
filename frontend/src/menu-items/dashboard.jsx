import {
  DashboardOutlined,
  MailOutlined,
  ThunderboltOutlined,
  WarningOutlined,
  TeamOutlined,
  BulbOutlined,
  BarChartOutlined
} from '@ant-design/icons';

const dashboard = {
  id: 'group-dashboard',
  title: 'Navigation',
  type: 'group',
  children: [
    {
      id: 'dashboard',
      title: 'Dashboard',
      type: 'item',
      url: '/dashboard',
      icon: DashboardOutlined,
      breadcrumbs: false
    },
    {
      id: 'maillogs',
      title: 'Mail Logs',
      type: 'item',
      url: '/maillogs',
      icon: MailOutlined,
      breadcrumbs: false
    }
  ]
};

export const intelligenceMenu = {
  id: 'group-intelligence',
  title: 'Intelligence',
  type: 'group',
  children: [
    {
      id: 'health',
      title: 'Health Score',
      type: 'item',
      url: '/intelligence/health',
      icon: BarChartOutlined,
      breadcrumbs: false
    },
    {
      id: 'conflicts',
      title: 'Rule Conflicts',
      type: 'item',
      url: '/intelligence/conflicts',
      icon: WarningOutlined,
      breadcrumbs: false
    },
    {
      id: 'relationships',
      title: 'Relationships',
      type: 'item',
      url: '/intelligence/relationships',
      icon: TeamOutlined,
      breadcrumbs: false
    },
    {
      id: 'suggestions',
      title: 'AI Suggestions',
      type: 'item',
      url: '/intelligence/suggestions',
      icon: BulbOutlined,
      breadcrumbs: false
    },
    {
      id: 'intentstats',
      title: 'Intent Stats',
      type: 'item',
      url: '/intelligence/intent',
      icon: ThunderboltOutlined,
      breadcrumbs: false
    }
  ]
};

export default dashboard;
