import { useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import MainCard from 'components/MainCard';
import { getConflicts, listRules } from '../../api';
import { WarningOutlined, CheckCircleOutlined } from '@ant-design/icons';

export default function Conflicts() {
  const [conflicts, setConflicts] = useState([]);
  const [rules, setRules]         = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([getConflicts(), listRules()])
      .then(([c, r]) => { setConflicts(c.data.conflicts || []); setRules(r.data || []); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // build adjacency for visual
  const getRule = id => rules.find(r => String(r._id) === String(id));

  return (
    <Grid container rowSpacing={3} columnSpacing={2.75}>
      <Grid size={12}>
        <Typography variant="h5">Rule Conflict Visualizer</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Rules that may match the same emails — review and adjust conditions to avoid double-actions.
        </Typography>
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
                {/* Rule 1 */}
                <Box sx={{ flex: 1, minWidth: 140, p: 1.5, border: '1px solid', borderColor: 'warning.light', borderRadius: 2 }}>
                  <Typography variant="subtitle2">{r1.name || c.rule1.name}</Typography>
                  {r1.conditions && (
                    <Box sx={{ mt: 1 }}>
                      {r1.conditions.subjectContains && <Chip label={`subject: ${r1.conditions.subjectContains}`} size="small" sx={{ mr: 0.5, mb: 0.5 }} />}
                      {r1.conditions.from && <Chip label={`from: ${r1.conditions.from}`} size="small" sx={{ mr: 0.5, mb: 0.5 }} />}
                      {r1.conditions.intentTrigger && <Chip label={`intent: ${r1.conditions.intentTrigger}`} size="small" color="primary" sx={{ mb: 0.5 }} />}
                    </Box>
                  )}
                </Box>

                <Typography variant="h6" color="warning.main">⇄</Typography>

                {/* Rule 2 */}
                <Box sx={{ flex: 1, minWidth: 140, p: 1.5, border: '1px solid', borderColor: 'warning.light', borderRadius: 2 }}>
                  <Typography variant="subtitle2">{r2.name || c.rule2.name}</Typography>
                  {r2.conditions && (
                    <Box sx={{ mt: 1 }}>
                      {r2.conditions.subjectContains && <Chip label={`subject: ${r2.conditions.subjectContains}`} size="small" sx={{ mr: 0.5, mb: 0.5 }} />}
                      {r2.conditions.from && <Chip label={`from: ${r2.conditions.from}`} size="small" sx={{ mr: 0.5, mb: 0.5 }} />}
                      {r2.conditions.intentTrigger && <Chip label={`intent: ${r2.conditions.intentTrigger}`} size="small" color="primary" sx={{ mb: 0.5 }} />}
                    </Box>
                  )}
                </Box>
              </Box>

              <Alert severity="warning" sx={{ mt: 2 }}>
                These rules may both trigger on the same email. Tighten the conditions (add a specific sender or subject) to avoid conflicts.
              </Alert>
            </MainCard>
          </Grid>
        );
      })}
    </Grid>
  );
}
