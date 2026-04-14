import { useCallback, useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import OutlinedInput from '@mui/material/OutlinedInput';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Grid } from '@mui/system';

import { ReloadOutlined } from '@ant-design/icons';

import MainCard from 'components/MainCard';
import { getLogs } from '../../api';

const ROWS_PER_PAGE = 10;

const headCells = [
  { id: 'timestamp', align: 'left',   label: 'Time'    },
  { id: 'subject',   align: 'left',   label: 'Subject' },
  { id: 'actionTaken', align: 'left', label: 'Action'  },
  { id: 'success',   align: 'center', label: 'Success' }
];

function LogsTableHead() {
  return (
    <TableHead>
      <TableRow>
        {headCells.map((cell) => (
          <TableCell key={cell.id} align={cell.align}>{cell.label}</TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

export default function LogsDefault() {
  const [maillogs, setMailLogs] = useState([]);
  const [search, setSearch]     = useState('');
  const [page, setPage]         = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLogs = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await getLogs();
      setMailLogs(res.data || []);
    } catch (err) {
      console.error('Failed to fetch mail logs:', err);
      setMailLogs([]);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const filteredLogs    = maillogs.filter((r) => {
    const s = search.toLowerCase();
    return r.subject?.toLowerCase().includes(s) || r.actionTaken?.toLowerCase().includes(s);
  });
  const paginatedLogs   = filteredLogs.slice(page * ROWS_PER_PAGE, page * ROWS_PER_PAGE + ROWS_PER_PAGE);
  const pageCount       = Math.ceil(filteredLogs.length / ROWS_PER_PAGE);

  return (
    <Grid size={{ xs: 12, md: 7, lg: 8 }}>
      {/* Header row */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
        <Typography
          variant="h5"
          sx={{
            px: 2, py: 1, borderRadius: 2, display: 'inline-block',
            backgroundColor: 'rgba(255,255,255,0.75)',
            backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)'
          }}
        >
          Mail Logs
        </Typography>

        <Stack direction="row" alignItems="center" gap={1}>
          <OutlinedInput
            sx={{ width: 260, height: 38 }}
            placeholder="Search subject or action…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          />
          <Tooltip title="Refresh logs">
            <IconButton
              onClick={fetchLogs}
              size="small"
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1.5,
                p: 0.8,
                bgcolor: 'rgba(255,255,255,0.75)',
                backdropFilter: 'blur(8px)',
                '& svg': {
                  transition: 'transform 0.6s ease',
                  transform: refreshing ? 'rotate(360deg)' : 'rotate(0deg)'
                },
                '&:hover': { bgcolor: 'action.hover' }
              }}
            >
              <ReloadOutlined spin={refreshing} style={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      <MainCard sx={{ mt: 2 }} content={false}>
        <TableContainer
          sx={{
            width: '100%', overflowX: 'auto', position: 'relative',
            display: 'block', maxWidth: '100%',
            '& td, & th': { whiteSpace: 'nowrap' }
          }}
        >
          <Table>
            <LogsTableHead />
            <TableBody>
              {paginatedLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={headCells.length} align="center">
                    {refreshing ? 'Loading…' : 'No logs found'}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedLogs.map((r) => (
                  <TableRow key={r._id} hover>
                    <TableCell>{new Date(r.timestamp).toLocaleString()}</TableCell>
                    <TableCell>{r.subject || '-'}</TableCell>
                    <TableCell>{r.actionTaken || '-'}</TableCell>
                    <TableCell align="center">{r.success ? '✅' : '❌'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {pageCount > 1 && (
            <Stack spacing={2} alignItems="center" sx={{ py: 2 }}>
              <Pagination
                count={pageCount}
                page={page + 1}
                onChange={(_e, value) => setPage(value - 1)}
                shape="rounded"
                variant="outlined"
                siblingCount={2}
                boundaryCount={1}
                sx={{
                  '& .MuiPaginationItem-root': { borderRadius: '8px', fontSize: 14, minWidth: 36, height: 36 },
                  '& .Mui-selected': { backgroundColor: 'black !important', color: 'white !important', border: '1px solid black' }
                }}
              />
            </Stack>
          )}
        </TableContainer>
      </MainCard>
    </Grid>
  );
}
