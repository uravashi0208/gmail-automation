import { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Pagination from '@mui/material/Pagination';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { EditOutlined, DeleteOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Formik } from 'formik';
import * as Yup from 'yup';

import MainCard from 'components/MainCard';
import AnimateButton from 'components/@extended/AnimateButton';
import { listRules, createRule, updateRule, deleteRule } from '../../../api';

const ROWS_PER_PAGE = 10;
const INTENT_OPTIONS = ['', 'complaint', 'refund', 'urgent', 'approval', 'invoice', 'greeting', 'other'];

const intentColorMap = {
  complaint: 'error', refund: 'warning', urgent: 'error',
  approval: 'info', invoice: 'default', greeting: 'success', other: 'default'
};

const headCells = [
  { id: 'name',            align: 'left',   label: 'Name' },
  { id: 'subjectContains', align: 'center', label: 'Subject' },
  { id: 'from',            align: 'center', label: 'From' },
  { id: 'intent',          align: 'center', label: 'Intent' },
  { id: 'label',           align: 'center', label: 'Label' },
  { id: 'active',          align: 'center', label: 'Active' },
  { id: 'actions',         align: 'center', label: 'Actions' }
];

const ruleSchema = Yup.object().shape({
  name:          Yup.string().required('Name is required'),
  subjectContains: Yup.string(),
  from:          Yup.string(),
  intentTrigger: Yup.string(),
  label:         Yup.string().required('Label is required'),
  template:      Yup.string()
});

export default function OrdersTable() {
  const [rules,    setRules]    = useState([]);
  const [editRule, setEditRule] = useState(null);
  const [search,   setSearch]   = useState('');
  const [page,     setPage]     = useState(0);

  useEffect(() => { fetchRules(); }, []);

  const fetchRules = async () => {
    try {
      const res = await listRules();
      setRules(res.data || []);
    } catch (err) {
      console.error('Failed to fetch rules:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this rule?')) return;
    try { await deleteRule(id); await fetchRules(); } catch (err) { console.error(err); }
  };

  const handleToggleActive = async (rule) => {
    try {
      await updateRule(rule._id, { active: !rule.active });
      await fetchRules();
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (values, { resetForm }) => {
    const payload = {
      name:       values.name,
      conditions: {
        subjectContains: values.subjectContains,
        from:            values.from,
        intentTrigger:   values.intentTrigger
      },
      actions: {
        label:             values.label,
        autoReplyTemplate: values.template,
        autoReply:         Boolean(values.template)
      }
    };
    try {
      if (!values._id) await createRule(payload);
      else             await updateRule(values._id, payload);
      resetForm();
      setEditRule(null);
      fetchRules();
    } catch (err) { console.error('Failed to save rule:', err); }
  };

  const filteredRules = rules.filter(r => {
    const s = search.toLowerCase();
    return (
      r.name?.toLowerCase().includes(s) ||
      r.conditions?.subjectContains?.toLowerCase().includes(s) ||
      r.conditions?.from?.toLowerCase().includes(s) ||
      r.actions?.label?.toLowerCase().includes(s)
    );
  });

  const paginatedRules = filteredRules.slice(page * ROWS_PER_PAGE, page * ROWS_PER_PAGE + ROWS_PER_PAGE);
  const pageCount      = Math.ceil(filteredRules.length / ROWS_PER_PAGE);

  return (
    <>
      {/* Rules Table */}
      <Grid size={{ xs: 12, md: 7, lg: 8 }}>
        <Typography variant="h5">Automation Rules</Typography>

        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <OutlinedInput
            sx={{ width: 300 }}
            placeholder="Search rules…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
          />
        </Box>

        <MainCard sx={{ mt: 2 }} content={false}>
          <TableContainer sx={{ width: '100%', overflowX: 'auto', '& td, & th': { whiteSpace: 'nowrap' } }}>
            <Table>
              <TableHead>
                <TableRow>
                  {headCells.map(c => <TableCell key={c.id} align={c.align}>{c.label}</TableCell>)}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedRules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={headCells.length} align="center">No rules found</TableCell>
                  </TableRow>
                ) : (
                  paginatedRules.map(r => (
                    <TableRow key={r._id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>{r.name}</Typography>
                        {r.stats?.totalMatched > 0 && (
                          <Typography variant="caption" color="text.secondary">
                            {r.stats.totalMatched} matches · {(r.stats.totalMatched * (r.stats.minutesPerMatch || 2) / 60).toFixed(1)}h saved
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">{r.conditions?.subjectContains || '—'}</TableCell>
                      <TableCell align="center">{r.conditions?.from || '—'}</TableCell>
                      <TableCell align="center">
                        {r.conditions?.intentTrigger ? (
                          <Chip
                            icon={<ThunderboltOutlined />}
                            label={r.conditions.intentTrigger}
                            color={intentColorMap[r.conditions.intentTrigger] || 'default'}
                            size="small"
                          />
                        ) : '—'}
                      </TableCell>
                      <TableCell align="center">{r.actions?.label || '—'}</TableCell>
                      <TableCell align="center">
                        <Tooltip title={r.active ? 'Disable rule' : 'Enable rule'}>
                          <Switch
                            checked={r.active}
                            size="small"
                            onChange={() => handleToggleActive(r)}
                          />
                        </Tooltip>
                      </TableCell>
                      <TableCell align="center">
                        <EditOutlined
                          onClick={() => setEditRule(r)}
                          style={{ fontSize: 20, color: '#1677ff', marginRight: 14, cursor: 'pointer' }}
                        />
                        <DeleteOutlined
                          onClick={() => handleDelete(r._id)}
                          style={{ fontSize: 20, color: '#ff4d4f', cursor: 'pointer' }}
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
                  onChange={(_e, v) => setPage(v - 1)}
                  shape="rounded"
                  variant="outlined"
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

      {/* Rule Form */}
      <Grid size={{ xs: 12, md: 5, lg: 4 }}>
        <Typography variant="h5">{editRule ? 'Edit Rule' : 'Create New Rule'}</Typography>
        <MainCard sx={{ mt: 2 }} content={false}>
          <Box sx={{ m: 3 }}>
            <Formik
              enableReinitialize
              initialValues={{
                _id:             editRule?._id || '',
                name:            editRule?.name || '',
                subjectContains: editRule?.conditions?.subjectContains || '',
                from:            editRule?.conditions?.from || '',
                intentTrigger:   editRule?.conditions?.intentTrigger || '',
                label:           editRule?.actions?.label || '',
                template:        editRule?.actions?.autoReplyTemplate || ''
              }}
              validationSchema={ruleSchema}
              onSubmit={handleSubmit}
            >
              {({ errors, handleBlur, handleChange, handleSubmit: formSubmit, touched, values, setFieldValue }) => (
                <form noValidate onSubmit={formSubmit}>
                  <Grid container spacing={2}>
                    {/* Name */}
                    <Grid size={12}>
                      <Stack gap={1}>
                        <InputLabel>Rule Name *</InputLabel>
                        <OutlinedInput
                          name="name" value={values.name}
                          onBlur={handleBlur} onChange={handleChange}
                          placeholder="e.g. Label urgent client emails"
                          fullWidth
                          error={Boolean(touched.name && errors.name)}
                        />
                        {touched.name && errors.name && <FormHelperText error>{errors.name}</FormHelperText>}
                      </Stack>
                    </Grid>

                    {/* Subject */}
                    <Grid size={12}>
                      <Stack gap={1}>
                        <InputLabel>Subject Contains</InputLabel>
                        <OutlinedInput
                          name="subjectContains" value={values.subjectContains}
                          onBlur={handleBlur} onChange={handleChange}
                          placeholder="invoice, urgent, hello…"
                          fullWidth
                        />
                      </Stack>
                    </Grid>

                    {/* From */}
                    <Grid size={12}>
                      <Stack gap={1}>
                        <InputLabel>From Email</InputLabel>
                        <OutlinedInput
                          name="from" value={values.from}
                          onBlur={handleBlur} onChange={handleChange}
                          placeholder="client@company.com"
                          fullWidth
                        />
                      </Stack>
                    </Grid>

                    {/* Intent Trigger (NEW) */}
                    <Grid size={12}>
                      <Stack gap={1}>
                        <InputLabel>
                          <Stack direction="row" alignItems="center" gap={0.5}>
                            <ThunderboltOutlined style={{ color: '#fa8c16', fontSize: 14 }} />
                            Intent Trigger (AI-powered)
                          </Stack>
                        </InputLabel>
                        <Select
                          value={values.intentTrigger}
                          onChange={e => setFieldValue('intentTrigger', e.target.value)}
                          displayEmpty
                          size="small"
                          fullWidth
                        >
                          <MenuItem value=""><em>None (keyword-only matching)</em></MenuItem>
                          {INTENT_OPTIONS.filter(Boolean).map(opt => (
                            <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                          ))}
                        </Select>
                        <Typography variant="caption" color="text.secondary">
                          AI will detect email intent and only trigger this rule if intent matches.
                        </Typography>
                      </Stack>
                    </Grid>

                    {/* Label */}
                    <Grid size={12}>
                      <Stack gap={1}>
                        <InputLabel>Gmail Label *</InputLabel>
                        <OutlinedInput
                          name="label" value={values.label}
                          onBlur={handleBlur} onChange={handleChange}
                          placeholder="Urgent / Client / Invoice"
                          fullWidth
                          error={Boolean(touched.label && errors.label)}
                        />
                        {touched.label && errors.label && <FormHelperText error>{errors.label}</FormHelperText>}
                      </Stack>
                    </Grid>

                    {/* Auto Reply Template */}
                    <Grid size={12}>
                      <Stack gap={1}>
                        <InputLabel>Auto Reply Template</InputLabel>
                        <OutlinedInput
                          name="template" value={values.template}
                          onBlur={handleBlur} onChange={handleChange}
                          placeholder="Thank you for your email, we'll respond within 24hrs…"
                          fullWidth
                          multiline
                          rows={3}
                        />
                      </Stack>
                    </Grid>

                    <Grid size={12}>
                      <Stack direction="row" gap={1}>
                        <AnimateButton>
                          <Button size="large" variant="contained" type="submit">
                            {values._id ? 'Update Rule' : 'Create Rule'}
                          </Button>
                        </AnimateButton>
                        {editRule && (
                          <Button size="large" variant="outlined" onClick={() => setEditRule(null)}>
                            Cancel
                          </Button>
                        )}
                      </Stack>
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
