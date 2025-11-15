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
import Button from '@mui/material/Button';
import MainCard from '../../../components/MainCard';
import { Grid, Stack } from '@mui/system';
import Typography from '@mui/material/Typography';

import Pagination from '@mui/material/Pagination';   // ⭐ NEW
import StackMui from '@mui/material/Stack';          // ⭐ NEW

// form
import * as Yup from 'yup';
import { Formik } from 'formik';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import AnimateButton from '../../../components/@extended/AnimateButton';
import FormHelperText from '@mui/material/FormHelperText';

import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

// api
import { listRules, createRule, updateRule, deleteRule } from '../../../api';

const headCells = [
  { id: 'name', align: 'left', label: 'Name' },
  { id: 'active', align: 'center', label: 'Subject' },
  { id: 'from', align: 'center', label: 'From' },
  { id: 'label', align: 'center', label: 'Label' },
  { id: 'template', align: 'left', label: 'Auto Reply Template' },
  { id: 'actions', align: 'center', label: 'Actions' }
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

export default function OrderTable() {
  const [token, setToken] = useState(() => {
    const param = new URLSearchParams(window.location.search).get('token');
    return param || localStorage.getItem('jwt');
  });

  const [rules, setRules] = useState([]);
  const [editRule, setEditRule] = useState(null);

  // NEW STATES
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    if (token) fetchRules();
  }, [token]);

  const fetchRules = async () => {
    try {
      const res = await listRules(token);
      setRules(res.data || []);
    } catch (err) {
      console.error('Failed to fetch rules', err);
      setRules([]);
    }
  };

  const remove = async (id) => {
    await deleteRule(token, id);
    await fetchRules();
  };

  // ⭐ FILTER LOGIC
  const filteredRules = rules.filter((r) => {
    const s = search.toLowerCase();
    return (
      r.name?.toLowerCase().includes(s) ||
      r.conditions?.subjectContains?.toLowerCase().includes(s) ||
      r.conditions?.from?.toLowerCase().includes(s) ||
      r.actions?.label?.toLowerCase().includes(s)
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
                        <TableCell>{r.name}</TableCell>
                        <TableCell align="center">{r.conditions?.subjectContains || '-'}</TableCell>
                        <TableCell align="center">{r.conditions?.from || '-'}</TableCell>
                        <TableCell align="center">{r.actions?.label || '-'}</TableCell>
                        <TableCell align="left">{r.actions?.autoReplyTemplate || '-'}</TableCell>
                        <TableCell align="center">
                          <EditOutlined
                            onClick={() => setEditRule(r)}
                            style={{ fontSize: '22px', color: '#08c', marginRight: '15px' }}
                          />
                          <DeleteOutlined
                            onClick={() => remove(r._id)}
                            style={{ fontSize: '22px', color: 'red' }}
                          />
                        </TableCell>
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

      {/* RIGHT SIDE - Form */}
      <Grid size={{ xs: 12, md: 5, lg: 4 }}>
        <Typography variant="h5">{editRule ? 'Edit Rule' : 'Create New Rule'}</Typography>

        <MainCard sx={{ mt: 2 }} content={false}>
          <Box sx={{ m: 4 }}>
            <Formik
              enableReinitialize
              initialValues={{
                _id: editRule?._id || '',
                name: editRule?.name || '',
                subjectContains: editRule?.conditions?.subjectContains || '',
                from: editRule?.conditions?.from || '',
                label: editRule?.actions?.label || '',
                template: editRule?.actions?.autoReplyTemplate || ''
              }}
              validationSchema={Yup.object().shape({
                name: Yup.string().required('Name is required'),
                subjectContains: Yup.string(),
                from: Yup.string(),
                label: Yup.string().required('Label is required'),
                template: Yup.string().required('Template is required')
              })}
              onSubmit={async (values, { resetForm }) => {
                const payload = {
                  name: values.name,
                  conditions: {
                    subjectContains: values.subjectContains,
                    from: values.from
                  },
                  actions: {
                    label: values.label,
                    autoReplyTemplate: values.template,
                    autoReply: !!values.template
                  }
                };

                if (!values._id) {
                  await createRule(token, payload);
                } else {
                  await updateRule(token, values._id, payload);
                }

                resetForm();
                setEditRule(null);
                fetchRules();
              }}
            >
              {({ errors, handleBlur, handleChange, handleSubmit, touched, values }) => (
                <form noValidate onSubmit={handleSubmit}>
                  <Grid container spacing={2}>
                    {/* Name */}
                    <Grid size={12}>
                      <Stack sx={{ gap: 1 }}>
                        <InputLabel>Name*</InputLabel>
                        <OutlinedInput
                          name="name"
                          value={values.name}
                          onBlur={handleBlur}
                          onChange={handleChange}
                          placeholder="Rule name"
                          fullWidth
                          error={Boolean(touched.name && errors.name)}
                        />
                        {touched.name && errors.name && (
                          <FormHelperText error>{errors.name}</FormHelperText>
                        )}
                      </Stack>
                    </Grid>

                    {/* Subject Contains */}
                    <Grid size={12}>
                      <Stack sx={{ gap: 1 }}>
                        <InputLabel>Subject Contains</InputLabel>
                        <OutlinedInput
                          name="subjectContains"
                          value={values.subjectContains}
                          onBlur={handleBlur}
                          onChange={handleChange}
                          placeholder="Subject contains text"
                          fullWidth
                        />
                      </Stack>
                    </Grid>

                    {/* From Email */}
                    <Grid size={12}>
                      <Stack sx={{ gap: 1 }}>
                        <InputLabel>From Email</InputLabel>
                        <OutlinedInput
                          name="from"
                          value={values.from}
                          onBlur={handleBlur}
                          onChange={handleChange}
                          placeholder="example@gmail.com"
                          fullWidth
                        />
                      </Stack>
                    </Grid>

                    {/* Label */}
                    <Grid size={12}>
                      <Stack sx={{ gap: 1 }}>
                        <InputLabel>Label</InputLabel>
                        <OutlinedInput
                          name="label"
                          value={values.label}
                          onBlur={handleBlur}
                          onChange={handleChange}
                          placeholder="Label"
                          fullWidth
                          error={Boolean(touched.label && errors.label)}
                        />
                        {touched.label && errors.label && (
                          <FormHelperText error>{errors.label}</FormHelperText>
                        )}
                      </Stack>
                    </Grid>

                    {/* Template */}
                    <Grid size={12}>
                      <Stack sx={{ gap: 1 }}>
                        <InputLabel>Auto Reply Template</InputLabel>
                        <OutlinedInput
                          name="template"
                          value={values.template}
                          onBlur={handleBlur}
                          onChange={handleChange}
                          placeholder="Auto reply message..."
                          fullWidth
                          error={Boolean(touched.template && errors.template)}
                        />
                        {touched.template && errors.template && (
                          <FormHelperText error>{errors.template}</FormHelperText>
                        )}
                      </Stack>
                    </Grid>

                    {/* Submit */}
                    <Grid size={12}>
                      <AnimateButton>
                        <Button size="large" variant="contained" type="submit">
                          {values._id ? 'Update Rule' : 'Create Rule'}
                        </Button>
                      </AnimateButton>
                    </Grid>
                  </Grid>
                </form>
              )}
            </Formik>
          </Box>
        </MainCard>
      </Grid>
    </>
  );
}

OrderTable.propTypes = {
  token: PropTypes.string.isRequired
};
