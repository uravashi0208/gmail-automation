import { useCallback, useEffect, useState } from 'react';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import MainCard from 'components/MainCard';
import AnimateButton from 'components/@extended/AnimateButton';
import { getSuggestedRules, createRule } from '../../api';
import { BulbOutlined, CheckOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';

export default function Suggestions() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [applied, setApplied]         = useState({});
  const [error, setError]             = useState('');

  const fetchSuggestions = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true); else setRefreshing(true);
    setError('');
    try {
      const r = await getSuggestedRules();
      setSuggestions(r.data.suggestions || []);
    } catch {
      setError('Could not fetch suggestions. Make sure ANTHROPIC_API_KEY is set on the backend.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchSuggestions(true); }, [fetchSuggestions]);

  const applyRule = async (s, idx) => {
    try {
      await createRule({
        name: s.name,
        conditions: s.conditions,
        actions: s.actions
      });
      setApplied((prev) => ({ ...prev, [idx]: true }));
    } catch (err) {
      console.error('Failed to apply suggestion:', err);
    }
  };

  return (
    <Grid container rowSpacing={3} columnSpacing={2.75}>
      <Grid size={12}>
        <Stack direction="row" alignItems="center" gap={1}>
          <BulbOutlined style={{ fontSize: 22, color: '#fa8c16' }} />
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
            Behavioral Pattern Rule Suggester
          </Typography>
        </Stack>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            AI analyzes your past email patterns and suggests rules you never thought to create.
          </Typography>
          <Tooltip title="Re-analyze patterns">
            <IconButton
              onClick={() => fetchSuggestions(false)}
              size="small"
              disabled={refreshing}
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

      {loading && (
        <Grid size={12}>
          <Stack alignItems="center" gap={2} sx={{ py: 4 }}>
            <CircularProgress />
            <Typography color="text.secondary">Analyzing your email patterns with AI…</Typography>
          </Stack>
        </Grid>
      )}

      {error && (
        <Grid size={12}>
          <Alert severity="error">{error}</Alert>
        </Grid>
      )}

      {!loading && !error && suggestions.length === 0 && (
        <Grid size={12}>
          <Alert severity="info">Not enough email history yet. Process at least 10–20 emails first and try again.</Alert>
        </Grid>
      )}

      {suggestions.map((s, i) => (
        <Grid key={i} size={{ xs: 12, md: 6 }}>
          <MainCard>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Typography variant="h6">{s.name}</Typography>
              <Chip label={`#${i + 1}`} size="small" />
            </Stack>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
              {s.reason}
            </Typography>

            <Divider sx={{ mb: 2 }} />

            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              CONDITIONS
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5, mb: 2 }}>
              {s.conditions?.from && <Chip label={`from: ${s.conditions.from}`} size="small" />}
              {s.conditions?.subjectContains && <Chip label={`subject: ${s.conditions.subjectContains}`} size="small" />}
              {s.conditions?.intentTrigger && <Chip label={`intent: ${s.conditions.intentTrigger}`} size="small" color="primary" />}
            </Box>

            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              ACTIONS
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5, mb: 2 }}>
              {s.actions?.label && <Chip label={`label: ${s.actions.label}`} size="small" color="success" />}
              {s.actions?.archive && <Chip label="archive" size="small" color="warning" />}
              {s.actions?.autoReply && <Chip label="auto-reply" size="small" color="info" />}
            </Box>

            <AnimateButton>
              <Button
                fullWidth
                variant={applied[i] ? 'outlined' : 'contained'}
                color={applied[i] ? 'success' : 'primary'}
                startIcon={applied[i] ? <CheckOutlined /> : <PlusOutlined />}
                onClick={() => !applied[i] && applyRule(s, i)}
                disabled={applied[i]}
              >
                {applied[i] ? 'Rule Created!' : 'Apply This Rule'}
              </Button>
            </AnimateButton>
          </MainCard>
        </Grid>
      ))}
    </Grid>
  );
}
