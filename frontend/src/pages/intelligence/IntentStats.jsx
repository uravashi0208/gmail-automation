import { useCallback, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { ReloadOutlined } from '@ant-design/icons';
import MainCard from 'components/MainCard';
import { getEnhancedStats } from '../../api';

const intentColors = { complaint: 'error', refund: 'warning', urgent: 'error', approval: 'info', invoice: 'default', greeting: 'success', other: 'default' };
const intentEmoji  = { complaint: '😤', refund: '💰', urgent: '🚨', approval: '✅', invoice: '🧾', greeting: '👋', other: '📧' };

export default function IntentStats() {
  const [stats, setStats]           = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    setRefreshing(true);
    try {
      const r = await getEnhancedStats();
      setStats(r.data);
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalIntents = (stats?.byIntent || []).reduce((s, i) => s + i.count, 0);
  const successRate  = stats?.total ? Math.round((stats.success / stats.total) * 100) : 0;

  return (
    <Grid container rowSpacing={3} columnSpacing={2.75}>
      <Grid size={12}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
          <Box>
            <Typography
              variant="h5"
              sx={{
                px: 2, py: 1, borderRadius: 2, display: 'inline-block',
                backgroundColor: 'rgba(255,255,255,0.75)',
                backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)'
              }}
            >
              Intent-Based Routing Stats
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              AI-detected email intents across all processed emails.
            </Typography>
          </Box>
          <Tooltip title="Refresh stats">
            <IconButton
              onClick={fetchData}
              size="small"
              sx={{
                border: '1px solid', borderColor: 'divider', borderRadius: 1.5, p: 0.8,
                bgcolor: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(8px)',
                '&:hover': { bgcolor: 'action.hover' }
              }}
            >
              <ReloadOutlined style={{ fontSize: 16, transition: 'transform 0.6s ease', transform: refreshing ? 'rotate(360deg)' : 'rotate(0deg)' }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Grid>

      <Grid size={{ xs: 12, sm: 3 }}>
        <MainCard><Typography variant="subtitle2" color="text.secondary">Total Processed</Typography><Typography variant="h3">{stats?.total || 0}</Typography></MainCard>
      </Grid>
      <Grid size={{ xs: 12, sm: 3 }}>
        <MainCard><Typography variant="subtitle2" color="text.secondary">Success Rate</Typography><Typography variant="h3" color="success.main">{successRate}%</Typography></MainCard>
      </Grid>
      <Grid size={{ xs: 12, sm: 3 }}>
        <MainCard><Typography variant="subtitle2" color="text.secondary">Intent Types Found</Typography><Typography variant="h3">{stats?.byIntent?.length || 0}</Typography></MainCard>
      </Grid>
      <Grid size={{ xs: 12, sm: 3 }}>
        <MainCard><Typography variant="subtitle2" color="text.secondary">Top VIP Senders</Typography><Typography variant="h3">{stats?.topSenders?.length || 0}</Typography></MainCard>
      </Grid>

      <Grid size={{ xs: 12, md: 7 }}>
        <MainCard title="Email Intent Breakdown">
          <Stack gap={2}>
            {(stats?.byIntent || []).map((item) => (
              <Box key={item._id}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                  <Stack direction="row" alignItems="center" gap={1}>
                    <span style={{ fontSize: 18 }}>{intentEmoji[item._id] || '📧'}</span>
                    <Chip label={item._id || 'unknown'} color={intentColors[item._id] || 'default'} size="small" />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">{item.count} emails</Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={totalIntents ? Math.round((item.count / totalIntents) * 100) : 0}
                  sx={{ height: 8, borderRadius: 4 }}
                  color={intentColors[item._id] || 'inherit'}
                />
              </Box>
            ))}
            {!stats?.byIntent?.length && (
              <Typography color="text.secondary" align="center">
                {refreshing ? 'Loading…' : 'No intent data yet. Process some emails first.'}
              </Typography>
            )}
          </Stack>
        </MainCard>
      </Grid>

      <Grid size={{ xs: 12, md: 5 }}>
        <MainCard title="Top Senders (Send-Time Optimizer)" content={false}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Sender</TableCell>
                  <TableCell align="center">Emails</TableCell>
                  <TableCell align="center">Best Hour</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(stats?.topSenders || []).map((s) => (
                  <TableRow key={s._id} hover>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>{s.senderName || s.senderEmail}</Typography>
                      <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 150, display: 'block' }}>{s.senderEmail}</Typography>
                    </TableCell>
                    <TableCell align="center">{s.totalEmails}</TableCell>
                    <TableCell align="center">{s.bestSendHour !== null ? `${s.bestSendHour}:00` : '—'}</TableCell>
                  </TableRow>
                ))}
                {!stats?.topSenders?.length && (
                  <TableRow><TableCell colSpan={3} align="center">{refreshing ? 'Loading…' : 'No data yet'}</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </MainCard>
      </Grid>
    </Grid>
  );
}
