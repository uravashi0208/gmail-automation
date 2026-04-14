import { useCallback, useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { ReloadOutlined, WarningOutlined, CheckCircleOutlined } from '@ant-design/icons';
import MainCard from 'components/MainCard';
import { getConflicts, listRules } from '../../api';

export default function Conflicts() {
  const [conflicts, setConflicts]   = useState([]);
  const [rules, setRules]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true); else setRefreshing(true);
    try {
      const [c, r] = await Promise.all([getConflicts(), listRules()]);
      setConflicts(c.data.conflicts || []);
      setRules(r.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(true); }, [fetchData]);

  const getRule = (id) => rules.find((r) => String(r._id) === String(id));

  return (
    <Grid container rowSpacing={3} columnSpacing={2.75}>
      <Grid size={12}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography
              variant="h5"
              sx={{
                px: 2, py: 1, borderRadius: 2, display: 'inline-block',
                backgroundColor: 'rgba(255,255,255,0.75)',
                backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)'
              }}
            >
              Rule Conflict Visualizer
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Rules that may match the same emails — review and adjust conditions to avoid double-actions.
            </Typography>
          </Box>
          <Tooltip title="Refresh conflicts">
            <IconButton
              onClick={() => fetchData(false)}
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

      {loading && <Grid size={12}><Typography>Analyzing rules…</Typography></Grid>}

      {!loading && conflicts.length === 0 && (
        <Grid size={12}>
          <Alert icon={<CheckCircleOutlined />} severity="success">
            No conflicts detected! All your rules have distinct conditions.
          </Alert>
        </Grid>
      )}

      {conflicts.map((c, i) => {
        const r1 = getRule(c.rule1._id) || c.rule1;
        const r2 = getRule(c.rule2._id) || c.rule2;
        return (
          <Grid key={i} size={{ xs: 12, md: 6 }}>
            <MainCard>
              <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 2 }}>
                <WarningOutlined style={{ color: '#fa8c16', fontSize: 18 }} />
                <Typography variant="subtitle1" fontWeight={600}>Conflict #{i + 1}</Typography>
              </Stack>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                {[r1, r2].map((rule, idx) => (
                  <Box key={idx} sx={{ flex: 1, minWidth: 140, p: 1.5, border: '1px solid', borderColor: 'warning.light', borderRadius: 2 }}>
                    <Typography variant="subtitle2">{rule.name}</Typography>
                    {rule.conditions && (
                      <Box sx={{ mt: 1 }}>
                        {rule.conditions.subjectContains && <Chip label={`subject: ${rule.conditions.subjectContains}`} size="small" sx={{ mr: 0.5, mb: 0.5 }} />}
                        {rule.conditions.from && <Chip label={`from: ${rule.conditions.from}`} size="small" sx={{ mr: 0.5, mb: 0.5 }} />}
                        {rule.conditions.intentTrigger && <Chip label={`intent: ${rule.conditions.intentTrigger}`} size="small" color="primary" sx={{ mb: 0.5 }} />}
                      </Box>
                    )}
                  </Box>
                ))}
                <Typography variant="h6" color="warning.main">⇄</Typography>
              </Box>
              <Alert severity="warning" sx={{ mt: 2 }}>
                These rules may both trigger on the same email. Tighten the conditions to avoid conflicts.
              </Alert>
            </MainCard>
          </Grid>
        );
      })}
    </Grid>
  );
}
