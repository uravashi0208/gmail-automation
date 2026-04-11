import { useEffect, useState } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Formik } from 'formik';
import * as Yup from 'yup';

// project imports
import MainCard from 'components/MainCard';
import AnimateButton from 'components/@extended/AnimateButton';
import { listRules, createRule, updateRule, deleteRule } from '../../../api';

const ROWS_PER_PAGE = 10;

const headCells = [
  { id: 'name', align: 'left', label: 'Name' },
  { id: 'subjectContains', align: 'center', label: 'Subject' },
  { id: 'from', align: 'center', label: 'From' },
  { id: 'label', align: 'center', label: 'Label' },
  { id: 'template', align: 'left', label: 'Auto Reply Template' },
  { id: 'actions', align: 'center', label: 'Actions' }
];

function RulesTableHead() {
  return (
    <TableHead>
      <TableRow>
        {headCells.map((cell) => (
          <TableCell key={cell.id} align={cell.align}>
            {cell.label}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

const ruleSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  subjectContains: Yup.string(),
  from: Yup.string(),
  label: Yup.string().required('Label is required'),
  template: Yup.string().required('Template is required')
});

export default function OrdersTable() {
  const [rules, setRules] = useState([]);
  const [editRule, setEditRule] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const res = await listRules();
      setRules(res.data || []);
    } catch (err) {
      console.error('Failed to fetch rules:', err);
      setRules([]);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteRule(id);
      await fetchRules();
    } catch (err) {
      console.error('Failed to delete rule:', err);
    }
  };

  const handleSubmit = async (values, { resetForm }) => {
    const payload = {
      name: values.name,
      conditions: {
        subjectContains: values.subjectContains,
        from: values.from
      },
      actions: {
        label: values.label,
        autoReplyTemplate: values.template,
        autoReply: Boolean(values.template)
      }
    };

    try {
      if (!values._id) {
        await createRule(payload);
      } else {
        await updateRule(values._id, payload);
      }
      resetForm();
      setEditRule(null);
      fetchRules();
    } catch (err) {
      console.error('Failed to save rule:', err);
    }
  };

  const filteredRules = rules.filter((r) => {
    const s = search.toLowerCase();
    return (
      r.name?.toLowerCase().includes(s) ||
      r.conditions?.subjectContains?.toLowerCase().includes(s) ||
      r.conditions?.from?.toLowerCase().includes(s) ||
      r.actions?.label?.toLowerCase().includes(s)
    );
  });

  const paginatedRules = filteredRules.slice(page * ROWS_PER_PAGE, page * ROWS_PER_PAGE + ROWS_PER_PAGE);
  const pageCount = Math.ceil(filteredRules.length / ROWS_PER_PAGE);

  return (
    <>
      {/* Left — Rules Table */}
      <Grid size={{ xs: 12, md: 7, lg: 8 }}>
        <Typography variant="h5">List of Rules</Typography>

        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <OutlinedInput
            sx={{ width: 300 }}
            placeholder="Search…"
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
                <RulesTableHead />
                <TableBody>
                  {paginatedRules.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={headCells.length} align="center">
                        No rules found
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
                            style={{ fontSize: 22, color: '#08c', marginRight: 15, cursor: 'pointer' }}
                          />
                          <DeleteOutlined
                            onClick={() => handleDelete(r._id)}
                            style={{ fontSize: 22, color: 'red', cursor: 'pointer' }}
                          />
                        </TableCell>
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
          </Box>
        </MainCard>
      </Grid>

      {/* Right — Rule Form */}
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
              validationSchema={ruleSchema}
              onSubmit={handleSubmit}
            >
              {({ errors, handleBlur, handleChange, handleSubmit: formSubmit, touched, values }) => (
                <form noValidate onSubmit={formSubmit}>
                  <Grid container spacing={2}>
                    {[
                      { name: 'name', label: 'Name*', placeholder: 'Rule name', required: true },
                      { name: 'subjectContains', label: 'Subject Contains', placeholder: 'Subject contains text' },
                      { name: 'from', label: 'From Email', placeholder: 'example@gmail.com' },
                      { name: 'label', label: 'Label*', placeholder: 'Label', required: true },
                      { name: 'template', label: 'Auto Reply Template*', placeholder: 'Auto reply message…', required: true }
                    ].map(({ name, label, placeholder, required }) => (
                      <Grid key={name} size={12}>
                        <Stack sx={{ gap: 1 }}>
                          <InputLabel>{label}</InputLabel>
                          <OutlinedInput
                            name={name}
                            value={values[name]}
                            onBlur={handleBlur}
                            onChange={handleChange}
                            placeholder={placeholder}
                            fullWidth
                            error={required && Boolean(touched[name] && errors[name])}
                          />
                          {required && touched[name] && errors[name] && (
                            <FormHelperText error>{errors[name]}</FormHelperText>
                          )}
                        </Stack>
                      </Grid>
                    ))}

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
