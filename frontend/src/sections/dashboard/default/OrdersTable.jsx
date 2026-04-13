import { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
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

import { CloseOutlined, DeleteOutlined, EditOutlined, PlusOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Formik } from 'formik';
import * as Yup from 'yup';

import AnimateButton from 'components/@extended/AnimateButton';
import MainCard from 'components/MainCard';
import { createRule, deleteRule, listRules, updateRule } from '../../../api';

const ROWS_PER_PAGE = 10;
const INTENT_OPTIONS = ['complaint', 'refund', 'urgent', 'approval', 'invoice', 'greeting', 'other'];

const intentColorMap = {
  complaint: 'error',
  refund: 'warning',
  urgent: 'error',
  approval: 'info',
  invoice: 'default',
  greeting: 'success',
  other: 'default'
};

const headCells = [
  { id: 'name', align: 'left', label: 'Rule Name' },
  { id: 'subjectContains', align: 'center', label: 'Subject' },
  { id: 'from', align: 'center', label: 'From' },
  { id: 'intent', align: 'center', label: 'Intent' },
  { id: 'label', align: 'center', label: 'Label' },
  { id: 'active', align: 'center', label: 'Active' },
  { id: 'actions', align: 'center', label: 'Actions' }
];

const ruleSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  subjectContains: Yup.string(),
  from: Yup.string(),
  intentTrigger: Yup.string(),
  label: Yup.string().required('Label is required'),
  template: Yup.string()
});

// ── Modal Form Component ──────────────────────────────────────────────────────
function RuleFormModal({ open, onClose, editRule, onSaved }) {
  const handleSubmit = async (values, { resetForm }) => {
    const payload = {
      name: values.name,
      conditions: {
        subjectContains: values.subjectContains,
        from: values.from,
        intentTrigger: values.intentTrigger
      },
      actions: {
        label: values.label,
        autoReplyTemplate: values.template,
        autoReply: Boolean(values.template)
      }
    };
    try {
      if (!values._id) await createRule(payload);
      else await updateRule(values._id, payload);
      resetForm();
      onSaved();
      onClose();
    } catch (err) {
      console.error('Failed to save rule:', err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h5">{editRule ? 'Edit Rule' : 'Create New Rule'}</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseOutlined />
          </IconButton>
        </Stack>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2.5 }}>
        <Formik
          enableReinitialize
          initialValues={{
            _id: editRule?._id || '',
            name: editRule?.name || '',
            subjectContains: editRule?.conditions?.subjectContains || '',
            from: editRule?.conditions?.from || '',
            intentTrigger: editRule?.conditions?.intentTrigger || '',
            label: editRule?.actions?.label || '',
            template: editRule?.actions?.autoReplyTemplate || ''
          }}
          validationSchema={ruleSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, handleBlur, handleChange, handleSubmit: formSubmit, touched, values, setFieldValue }) => (
            <form noValidate onSubmit={formSubmit}>
              <Grid container spacing={2.5}>

                {/* Rule Name */}
                <Grid size={12}>
                  <Stack gap={1}>
                    <InputLabel htmlFor="name">Rule Name *</InputLabel>
                    <OutlinedInput
                      id="name"
                      name="name"
                      value={values.name}
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder="e.g. Label urgent client emails"
                      fullWidth
                      error={Boolean(touched.name && errors.name)}
                    />
                    {touched.name && errors.name && <FormHelperText error>{errors.name}</FormHelperText>}
                  </Stack>
                </Grid>

                {/* Subject + From side by side */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Stack gap={1}>
                    <InputLabel>Subject Contains</InputLabel>
                    <OutlinedInput
                      name="subjectContains"
                      value={values.subjectContains}
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder="invoice, urgent…"
                      fullWidth
                    />
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Stack gap={1}>
                    <InputLabel>From Email</InputLabel>
                    <OutlinedInput
                      name="from"
                      value={values.from}
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder="client@company.com"
                      fullWidth
                    />
                  </Stack>
                </Grid>

                {/* Intent Trigger */}
                <Grid size={12}>
                  <Stack gap={1}>
                    <InputLabel>
                      <Stack direction="row" alignItems="center" gap={0.5}>
                        <ThunderboltOutlined style={{ color: '#fa8c16', fontSize: 13 }} />
                        Intent Trigger (AI-powered)
                      </Stack>
                    </InputLabel>
                    <Select
                      value={values.intentTrigger}
                      onChange={(e) => setFieldValue('intentTrigger', e.target.value)}
                      displayEmpty
                      fullWidth
                      size="medium"
                    >
                      <MenuItem value=""><em>None — keyword matching only</em></MenuItem>
                      {INTENT_OPTIONS.map((opt) => (
                        <MenuItem key={opt} value={opt}>
                          <Stack direction="row" alignItems="center" gap={1}>
                            <Chip
                              label={opt}
                              size="small"
                              color={intentColorMap[opt] || 'default'}
                              sx={{ pointerEvents: 'none' }}
                            />
                          </Stack>
                        </MenuItem>
                      ))}
                    </Select>
                    <Typography variant="caption" color="text.secondary">
                      AI will classify the email intent — rule only fires when intent matches.
                    </Typography>
                  </Stack>
                </Grid>

                {/* Gmail Label */}
                <Grid size={12}>
                  <Stack gap={1}>
                    <InputLabel htmlFor="label">Gmail Label *</InputLabel>
                    <OutlinedInput
                      id="label"
                      name="label"
                      value={values.label}
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder="Urgent / Client / Invoice"
                      fullWidth
                      error={Boolean(touched.label && errors.label)}
                    />
                    {touched.label && errors.label && <FormHelperText error>{errors.label}</FormHelperText>}
                  </Stack>
                </Grid>

                {/* Auto Reply */}
                <Grid size={12}>
                  <Stack gap={1}>
                    <InputLabel>Auto Reply Template</InputLabel>
                    <OutlinedInput
                      name="template"
                      value={values.template}
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder="Thank you for your email, we'll respond within 24hrs…"
                      fullWidth
                      multiline
                      rows={3}
                    />
                  </Stack>
                </Grid>

                {/* Buttons */}
                <Grid size={12}>
                  <Stack direction="row" gap={1.5} justifyContent="flex-end">
                    <Button variant="outlined" onClick={onClose}>
                      Cancel
                    </Button>
                    <AnimateButton>
                      <Button variant="contained" type="submit">
                        {values._id ? 'Update Rule' : 'Create Rule'}
                      </Button>
                    </AnimateButton>
                  </Stack>
                </Grid>

              </Grid>
            </form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Table Component ──────────────────────────────────────────────────────
export default function OrdersTable() {
  const [rules, setRules]       = useState([]);
  const [editRule, setEditRule] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch]     = useState('');
  const [page, setPage]         = useState(0);

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
    try { await updateRule(rule._id, { active: !rule.active }); await fetchRules(); }
    catch (err) { console.error(err); }
  };

  const openCreate = () => { setEditRule(null); setModalOpen(true); };
  const openEdit   = (rule) => { setEditRule(rule); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditRule(null); };

  const filteredRules = rules.filter((r) => {
    const s = search.toLowerCase();
    return (
      r.name?.toLowerCase().includes(s) ||
      r.conditions?.subjectContains?.toLowerCase().includes(s) ||
      r.conditions?.from?.toLowerCase().includes(s) ||
      r.actions?.label?.toLowerCase().includes(s)
    );
  });

  const pageCount      = Math.ceil(filteredRules.length / ROWS_PER_PAGE);
  const paginatedRules = filteredRules.slice(page * ROWS_PER_PAGE, page * ROWS_PER_PAGE + ROWS_PER_PAGE);

  return (
    <>
      {/* Modal */}
      <RuleFormModal
        open={modalOpen}
        onClose={closeModal}
        editRule={editRule}
        onSaved={fetchRules}
      />

      {/* Full-width table section */}
      <Grid size={12}>
        {/* Header row */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h5">Automation Rules</Typography>
          <Stack direction="row" alignItems="center" gap={1.5}>
            <OutlinedInput
              sx={{ width: 260 }}
              placeholder="Search rules…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              size="small"
            />
            <Button
              variant="contained"
              startIcon={<PlusOutlined />}
              onClick={openCreate}
            >
              New Rule
            </Button>
          </Stack>
        </Stack>

        <MainCard content={false}>
          <TableContainer sx={{ width: '100%', overflowX: 'auto', '& td, & th': { whiteSpace: 'nowrap' } }}>
            <Table>
              <TableHead>
                <TableRow>
                  {headCells.map((c) => (
                    <TableCell key={c.id} align={c.align}>{c.label}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedRules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={headCells.length} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      No rules found. Click "New Rule" to create one.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedRules.map((r) => (
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
                            checked={Boolean(r.active)}
                            size="small"
                            onChange={() => handleToggleActive(r)}
                          />
                        </Tooltip>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => openEdit(r)} sx={{ color: '#1677ff', mr: 0.5 }}>
                            <EditOutlined style={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => handleDelete(r._id)} sx={{ color: '#ff4d4f' }}>
                            <DeleteOutlined style={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination — always visible when records exist */}
          {filteredRules.length > 0 && (
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ px: 2.5, py: 2, borderTop: '1px solid', borderColor: 'divider' }}
            >
              <Typography variant="caption" color="text.secondary">
                Showing {page * ROWS_PER_PAGE + 1}–{Math.min((page + 1) * ROWS_PER_PAGE, filteredRules.length)} of {filteredRules.length} rules
              </Typography>
              <Pagination
                count={pageCount}
                page={page + 1}
                onChange={(_e, v) => setPage(v - 1)}
                shape="rounded"
                variant="outlined"
                siblingCount={1}
                boundaryCount={1}
                sx={{
                  '& .MuiPaginationItem-root': { borderRadius: '8px', fontSize: 13, minWidth: 32, height: 32 },
                  '& .Mui-selected': {
                    backgroundColor: 'black !important',
                    color: 'white !important',
                    border: '1px solid black'
                  }
                }}
              />
            </Stack>
          )}
        </MainCard>
      </Grid>
    </>
  );
}
