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
import { getHealthScores } from '../../api';

const healthColor = { healthy: 'success', stale: 'warning', unused: 'error' };

export default function HealthScore() {
  const [data, setData]           = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    setRefreshing(true);
    try {
      const r = await getHealthScores();
      setData(r.data);
    } catch (err) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalHours = data?.scores?.reduce((s, r) => s + r.timeSavedHours, 0).toFixed(1) || 0;

  return (
    <Grid container rowSpacing={3} columnSpacing={2.75}>
      <Grid size={12}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography
            variant="h5"
            sx={{
              px: 2, py: 1, borderRadius: 2, display: 'inline-block',
              backgroundColor: 'rgba(255,255,255,0.75)',
              backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)'
            }}
          >
            Automation Health Score
          </Typography>
          <Tooltip title="Refresh data">
            <IconButton
              onClick={fetchData}
              size="small"
              sx={{
                border: '1px solid', borderColor: 'divider', borderRadius: 1.5, p: 0.8,
                bgcolor: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(8px)',
                '&:hover': { bgcolor: 'action.hover' }
              }}
            >
              <ReloadOutlined spin={refreshing} style={{ fontSize: 16, transition: 'transform 0.6s ease', transform: refreshing ? 'rotate(360deg)' : 'rotate(0deg)' }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Grid>

      <Grid size={{ xs: 12, sm: 4 }}>
        <MainCard>
          <Typography variant="subtitle2" color="text.secondary">Total Rules</Typography>
          <Typography variant="h3">{data?.scores?.length || 0}</Typography>
        </MainCard>
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <MainCard>
          <Typography variant="subtitle2" color="text.secondary">Time Saved (hrs)</Typography>
          <Typography variant="h3">{totalHours}</Typography>
        </MainCard>
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <MainCard>
          <Typography variant="subtitle2" color="text.secondary">Needs Attention</Typography>
          <Typography variant="h3" color="error.main">
            {data?.scores?.filter((r) => r.shouldArchive).length || 0}
          </Typography>
        </MainCard>
      </Grid>

      <Grid size={12}>
        <MainCard content={false}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {['Rule Name', 'Status', 'Emails Matched', 'Last Matched', 'Time Saved', 'Suggestion'].map((h) => (
                    <TableCell key={h}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {(data?.scores || []).map((r) => (
                  <TableRow key={r._id} hover>
                    <TableCell><strong>{r.name}</strong></TableCell>
                    <TableCell><Chip label={r.health} color={healthColor[r.health]} size="small" /></TableCell>
                    <TableCell>{r.matched}</TableCell>
                    <TableCell>{r.lastMatchedAt ? new Date(r.lastMatchedAt).toLocaleDateString() : 'Never'}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress variant="determinate" value={Math.min(r.timeSavedHours * 10, 100)} sx={{ width: 60, height: 6, borderRadius: 3 }} />
                        <span>{r.timeSavedHours}h</span>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {r.shouldArchive
                        ? <Typography variant="caption" color="error">Consider disabling</Typography>
                        : <Typography variant="caption" color="success.main">Keep active</Typography>}
                    </TableCell>
                  </TableRow>
                ))}
                {!data?.scores?.length && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      {refreshing ? 'Loading…' : 'No rules found'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </MainCard>
      </Grid>
    </Grid>
  );
}
