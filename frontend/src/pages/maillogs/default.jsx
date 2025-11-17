import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

// material-ui
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import Box from '@mui/material/Box';
import MainCard from '../../components/MainCard';
import { Grid } from '@mui/system';
import Typography from '@mui/material/Typography';

import Pagination from '@mui/material/Pagination';   // ⭐ NEW
import StackMui from '@mui/material/Stack';          // ⭐ NEW

// form
import OutlinedInput from '@mui/material/OutlinedInput';

import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

// api
import { getLogs, listRules } from '../../api';

const headCells = [
  { id: 'timestamp', align: 'left', label: 'Time' },
  { id: 'subject', align: 'left', label: 'Subject' },
  { id: 'actionTaken', align: 'left', label: 'Action' },
  { id: 'success', align: 'left', label: 'Success' },
];

function OrderTableHead() {
  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell key={headCell.id} align={headCell.align}>
            {headCell.label}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

// project imports

// ==============================|| Logs - DEFAULT ||============================== //

export default function LogsDefault() {

  const [token, setToken] = useState(() => {
    const param = new URLSearchParams(window.location.search).get('token');
    return param || localStorage.getItem('jwt');
  });

  const [maillogs, setMailLogs] = useState([]);

  // NEW STATES
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    if (token) fetchRules();
  }, [token]);

  const fetchRules = async () => {
    try {
      const res = await getLogs(token);
      setMailLogs(res.data || []);
    } catch (err) {
      console.error('Failed to fetch maillogs', err);
      setMailLogs([]);
    }
  };


  // ⭐ FILTER LOGIC
  const filteredRules = maillogs.filter((r) => {
    const s = search.toLowerCase();
    return (
      r.subject?.toLowerCase().includes(s) ||
      r.actionTaken?.toLowerCase().includes(s) ||
      r.success?.toLowerCase().includes(s)
    );
  });

  // ⭐ PAGINATION LOGIC
  const paginatedRules = filteredRules.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

return (
    <>
      {/* LEFT SIDE - Table */}
      <Grid size={{ xs: 12, md: 7, lg: 8 }}>
        <Typography variant="h5">List of Rules</Typography>

        {/* ⭐ Search input (Right-Aligned) */}
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <OutlinedInput
            sx={{ width: 300 }}
            placeholder="Search..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
          />
        </Box>

        <MainCard sx={{ mt: 2 }} content={false}>
          <Box>
            <TableContainer
              sx={{
                width: '100%',
                overflowX: 'auto',
                position: 'relative',
                display: 'block',
                maxWidth: '100%',
                '& td, & th': { whiteSpace: 'nowrap' }
              }}
            >
              <Table>
                <OrderTableHead />
                <TableBody>
                  {paginatedRules.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={headCells.length} align="center">
                        No data found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedRules.map((r) => (
                      <TableRow key={r._id} hover>
                        <TableCell>{new Date(r.timestamp).toLocaleString()}</TableCell>
                        <TableCell align="left">{r.subject || '-'}</TableCell>
                        <TableCell align="left">{r.actionTaken || '-'}</TableCell>
                        <TableCell align="left">{r.success ? '✅' : '❌' || '-'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* ⭐ CUSTOM PAGINATION (matches your screenshot) */}
              <StackMui spacing={2} alignItems="center" sx={{ py: 2 }}>
                <Pagination
                  count={Math.ceil(filteredRules.length / rowsPerPage)}   // total pages
                  page={page + 1}                                        // convert to 1-index
                  onChange={(e, value) => setPage(value - 1)}            // convert back to 0-index
                  shape="rounded"
                  variant="outlined"
                  siblingCount={2}
                  boundaryCount={1}
                  sx={{
                    '& .MuiPaginationItem-root': {
                      borderRadius: '8px',
                      fontSize: '14px',
                      minWidth: '36px',
                      height: '36px',
                    },
                    '& .Mui-selected': {
                      backgroundColor: 'black !important',
                      color: 'white !important',
                      border: '1px solid black',
                    }
                  }}
                />
              </StackMui>
            </TableContainer>
          </Box>
        </MainCard>
      </Grid>
    </>
  );
}