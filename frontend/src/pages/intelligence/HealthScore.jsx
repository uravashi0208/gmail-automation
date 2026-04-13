import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import MainCard from 'components/MainCard';
import { getHealthScores } from '../../api';

const healthColor = { healthy: 'success', stale: 'warning', unused: 'error' };

export default function HealthScore() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getHealthScores()
      .then((r) => setData(r.data))
      .catch(console.error);
  }, []);

  const totalHours = data?.scores?.reduce((s, r) => s + r.timeSavedHours, 0).toFixed(1) || 0;

  return (
    <Grid container rowSpacing={3} columnSpacing={2.75}>
      <Grid size={12}>
        <Typography
          variant="h5"
          sx={{
            px: 2,
            py: 1,
            borderRadius: 2,
            display: 'inline-block',
            backgroundColor: 'rgba(255,255,255,0.75)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)'
          }}
        >
          Automation Health Score
        </Typography>
      </Grid>

      <Grid size={{ xs: 12, sm: 4 }}>
        <MainCard>
          <Typography variant="subtitle2" color="text.secondary">
            Total Rules
          </Typography>
          <Typography variant="h3">{data?.scores?.length || 0}</Typography>
        </MainCard>
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <MainCard>
          <Typography variant="subtitle2" color="text.secondary">
            Time Saved (hrs)
          </Typography>
          <Typography variant="h3">{totalHours}</Typography>
        </MainCard>
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <MainCard>
          <Typography variant="subtitle2" color="text.secondary">
            Needs Attention
          </Typography>
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
                    <TableCell>
                      <strong>{r.name}</strong>
                    </TableCell>
                    <TableCell>
                      <Chip label={r.health} color={healthColor[r.health]} size="small" />
                    </TableCell>
                    <TableCell>{r.matched}</TableCell>
                    <TableCell>{r.lastMatchedAt ? new Date(r.lastMatchedAt).toLocaleDateString() : 'Never'}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(r.timeSavedHours * 10, 100)}
                          sx={{ width: 60, height: 6, borderRadius: 3 }}
                        />
                        <span>{r.timeSavedHours}h</span>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {r.shouldArchive ? (
                        <Typography variant="caption" color="error">
                          Consider disabling
                        </Typography>
                      ) : (
                        <Typography variant="caption" color="success.main">
                          Keep active
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {!data?.scores?.length && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No rules found
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
