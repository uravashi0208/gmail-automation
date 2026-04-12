import { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import MainCard from 'components/MainCard';
import OrdersTable from 'sections/dashboard/default/OrdersTable';
import { getEnhancedStats, getHealthScores, getConflicts } from '../../api';
import { ThunderboltOutlined, WarningOutlined, ClockCircleOutlined, MailOutlined } from '@ant-design/icons';

function StatCard({ title, value, subtitle, icon, color = 'primary.main' }) {
  return (
    <MainCard>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography variant="subtitle2" color="text.secondary">{title}</Typography>
          <Typography variant="h3" color={color} sx={{ mt: 0.5 }}>{value}</Typography>
          {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
        </Box>
        <span style={{ fontSize: 28, opacity: 0.6 }}>{icon}</span>
      </Stack>
    </MainCard>
  );
}

import Box from '@mui/material/Box';

export default function DashboardDefault() {
  const [stats, setStats]         = useState(null);
  const [health, setHealth]       = useState(null);
  const [conflicts, setConflicts] = useState([]);

  useEffect(() => {
    getEnhancedStats().then(r => setStats(r.data)).catch(console.error);
    getHealthScores().then(r => setHealth(r.data)).catch(console.error);
    getConflicts().then(r => setConflicts(r.data.conflicts || [])).catch(console.error);
  }, []);

  const successRate   = stats?.total ? Math.round((stats.success / stats.total) * 100) : 0;
  const timeSaved     = health?.scores?.reduce((s, r) => s + r.timeSavedHours, 0).toFixed(1) || '0.0';
  const unusedRules   = health?.scores?.filter(r => r.health === 'unused').length || 0;
  const topIntent     = stats?.byIntent?.[0];

  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      <Grid sx={{ mb: -2.25 }} size={12}>
        <Typography variant="h5">Dashboard</Typography>
      </Grid>

      {/* Stats row */}
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          title="Emails Processed"
          value={stats?.total || 0}
          subtitle={`${successRate}% success rate`}
          icon="📧"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          title="Time Saved"
          value={`${timeSaved}h`}
          subtitle="across all rules"
          icon="⏱️"
          color="success.main"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          title="Rule Conflicts"
          value={conflicts.length}
          subtitle={conflicts.length > 0 ? 'Review recommended' : 'All clear'}
          icon="⚡"
          color={conflicts.length > 0 ? 'warning.main' : 'success.main'}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          title="Unused Rules"
          value={unusedRules}
          subtitle="consider disabling"
          icon="💤"
          color={unusedRules > 0 ? 'error.main' : 'success.main'}
        />
      </Grid>

      {/* Top intent banner */}
      {topIntent && (
        <Grid size={12}>
          <MainCard>
            <Stack direction="row" alignItems="center" gap={2} flexWrap="wrap">
              <ThunderboltOutlined style={{ fontSize: 20, color: '#fa8c16' }} />
              <Typography variant="subtitle1">
                Most common email intent today:
              </Typography>
              <Chip label={topIntent._id} color="warning" />
              <Typography variant="body2" color="text.secondary">
                ({topIntent.count} emails)
              </Typography>
              {conflicts.length > 0 && (
                <>
                  <Box sx={{ flex: 1 }} />
                  <Stack direction="row" alignItems="center" gap={1}>
                    <WarningOutlined style={{ color: '#ff4d4f' }} />
                    <Typography variant="body2" color="error.main">
                      {conflicts.length} rule conflict{conflicts.length > 1 ? 's' : ''} detected — check Conflicts page
                    </Typography>
                  </Stack>
                </>
              )}
            </Stack>
          </MainCard>
        </Grid>
      )}

      {/* Rules table */}
      <OrdersTable />
    </Grid>
  );
}
