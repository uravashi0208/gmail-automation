import { useCallback, useEffect, useRef, useState } from 'react';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import LinearProgress from '@mui/material/LinearProgress';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import {
  BulbOutlined,
  ClockCircleOutlined,
  DashboardOutlined,
  FireOutlined,
  RobotOutlined,
  SafetyOutlined,
  StarFilled,
  ThunderboltOutlined,
  TrophyOutlined
} from '@ant-design/icons';

import MainCard from 'components/MainCard';
import AnimateButton from 'components/@extended/AnimateButton';
import {
  getDailyDigest,
  getLiveStats,
  getOptimizationTips,
  getPriorityScores,
  getSenderIntelligence
} from '../../api';

// ── Intent colors ─────────────────────────────────────────────────────────
const intentColors = {
  urgent:    { color: '#ff4d4f', bg: 'rgba(255,77,79,0.1)',    label: '🔥 Urgent'   },
  complaint: { color: '#fa8c16', bg: 'rgba(250,140,22,0.1)',   label: '😤 Complaint' },
  refund:    { color: '#faad14', bg: 'rgba(250,173,20,0.1)',   label: '💸 Refund'    },
  approval:  { color: '#1677ff', bg: 'rgba(22,119,255,0.1)',   label: '✅ Approval'  },
  invoice:   { color: '#722ed1', bg: 'rgba(114,46,209,0.1)',   label: '🧾 Invoice'   },
  greeting:  { color: '#52c41a', bg: 'rgba(82,196,26,0.1)',    label: '👋 Greeting'  },
  other:     { color: '#8c8c8c', bg: 'rgba(140,140,140,0.1)', label: '📧 Other'     }
};

function IntentBadge({ intent }) {
  const cfg = intentColors[intent] || intentColors.other;
  return (
    <Box
      sx={{
        px: 1, py: 0.25, borderRadius: 1, fontSize: 11, fontWeight: 700,
        color: cfg.color, bgcolor: cfg.bg, display: 'inline-block', whiteSpace: 'nowrap'
      }}
    >
      {cfg.label}
    </Box>
  );
}

function ScoreBar({ score }) {
  const color = score >= 70 ? '#ff4d4f' : score >= 40 ? '#fa8c16' : '#52c41a';
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 120 }}>
      <LinearProgress
        variant="determinate"
        value={score}
        sx={{
          flex: 1, height: 6, borderRadius: 3,
          bgcolor: 'rgba(0,0,0,0.06)',
          '& .MuiLinearProgress-bar': { bgcolor: color, borderRadius: 3 }
        }}
      />
      <Typography variant="caption" sx={{ color, fontWeight: 700, minWidth: 28 }}>{score}</Typography>
    </Box>
  );
}

// ── Tab: Priority Inbox ───────────────────────────────────────────────────
function PriorityInbox() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterIntent, setFilterIntent] = useState('all');

  useEffect(() => {
    getPriorityScores()
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const scores = data?.scores || [];
  const filtered = scores.filter(s => {
    const matchSearch = !search || (s.subject || '').toLowerCase().includes(search) || (s.from || '').toLowerCase().includes(search);
    const matchIntent = filterIntent === 'all' || s.intent === filterIntent;
    return matchSearch && matchIntent;
  });

  return (
    <Stack gap={2}>
      <Stack direction="row" gap={1.5} flexWrap="wrap">
        <OutlinedInput
          placeholder="Search subject or sender…"
          value={search}
          onChange={e => setSearch(e.target.value.toLowerCase())}
          sx={{ flex: 1, minWidth: 200, height: 38 }}
        />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Intent</InputLabel>
          <Select value={filterIntent} onChange={e => setFilterIntent(e.target.value)} label="Intent">
            <MenuItem value="all">All intents</MenuItem>
            {Object.keys(intentColors).map(k => (
              <MenuItem key={k} value={k}>{intentColors[k].label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {loading ? (
        <Stack gap={1}>{[...Array(5)].map((_, i) => <Skeleton key={i} height={64} sx={{ borderRadius: 2 }} />)}</Stack>
      ) : filtered.length === 0 ? (
        <Alert severity="info">No emails match this filter. Process some emails first.</Alert>
      ) : (
        <Stack gap={1}>
          {filtered.slice(0, 50).map((s, i) => (
            <Box
              key={s._id}
              sx={{
                px: 2, py: 1.5, borderRadius: 2, border: '1px solid',
                borderColor: s.score >= 70 ? 'rgba(255,77,79,0.3)' : 'divider',
                bgcolor: s.score >= 70 ? 'rgba(255,77,79,0.03)' : 'background.paper',
                transition: 'all 0.15s',
                '&:hover': { borderColor: 'primary.main', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }
              }}
            >
              <Stack direction="row" alignItems="center" gap={1.5} flexWrap="wrap">
                <Typography variant="caption" color="text.disabled" sx={{ minWidth: 20 }}>#{i + 1}</Typography>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" alignItems="center" gap={0.75}>
                    {s.isVip && <StarFilled style={{ color: '#fa8c16', fontSize: 12 }} />}
                    {s.isUrgent && <FireOutlined style={{ color: '#ff4d4f', fontSize: 12 }} />}
                    <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 340 }}>
                      {s.subject || '(no subject)'}
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {s.from} · {new Date(s.timestamp).toLocaleString()}
                  </Typography>
                </Box>
                <IntentBadge intent={s.intent} />
                <ScoreBar score={s.score} />
              </Stack>
            </Box>
          ))}
        </Stack>
      )}
    </Stack>
  );
}

// ── Tab: Daily Digest ─────────────────────────────────────────────────────
function DailyDigest() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getDailyDigest()
      .then(r => setData(r.data))
      .catch(() => setError('Could not generate digest. Make sure ANTHROPIC_API_KEY is set.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Stack alignItems="center" gap={2} sx={{ py: 6 }}><CircularProgress /><Typography color="text.secondary">Generating your AI digest…</Typography></Stack>;
  if (error)   return <Alert severity="error">{error}</Alert>;
  if (!data)   return null;

  const { summary, stats } = data;
  const intentEntries = Object.entries(stats.intentBreakdown || {}).sort((a, b) => b[1] - a[1]);

  return (
    <Grid container rowSpacing={2.5} columnSpacing={2.75}>
      {/* AI Summary Card */}
      <Grid size={12}>
        <MainCard
          sx={{
            background: 'linear-gradient(135deg, rgba(22,119,255,0.08) 0%, rgba(114,46,209,0.08) 100%)',
            border: '1px solid rgba(22,119,255,0.2)'
          }}
        >
          <Stack direction="row" gap={1.5} alignItems="flex-start">
            <Box sx={{
              width: 40, height: 40, borderRadius: 2, flexShrink: 0,
              background: 'linear-gradient(135deg, #1677ff, #722ed1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <RobotOutlined style={{ color: '#fff', fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="subtitle2" color="primary.main" sx={{ mb: 0.5 }}>AI Daily Summary</Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.7 }}>{summary}</Typography>
            </Box>
          </Stack>
        </MainCard>
      </Grid>

      {/* Stats Row */}
      {[
        { label: 'Emails Processed', value: stats.totalEmails, icon: '📧', color: 'primary.main' },
        { label: 'Success Rate',     value: `${stats.successRate}%`, icon: '✅', color: 'success.main' },
        { label: 'Active Rules',     value: stats.activeRules, icon: '⚡', color: 'warning.main' },
        { label: 'VIP Contacts',     value: stats.vipContacts, icon: '⭐', color: '#fa8c16' }
      ].map(stat => (
        <Grid key={stat.label} size={{ xs: 6, md: 3 }}>
          <MainCard>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
                <Typography variant="h4" sx={{ color: stat.color, mt: 0.25 }}>{stat.value}</Typography>
              </Box>
              <Typography sx={{ fontSize: 28, opacity: 0.5 }}>{stat.icon}</Typography>
            </Stack>
          </MainCard>
        </Grid>
      ))}

      {/* Intent Breakdown */}
      <Grid size={{ xs: 12, md: 6 }}>
        <MainCard title="Intent Breakdown (Last 24h)">
          {intentEntries.length === 0 ? (
            <Typography variant="body2" color="text.secondary">No intent data yet.</Typography>
          ) : (
            <Stack gap={1.5}>
              {intentEntries.map(([intent, count]) => {
                const cfg = intentColors[intent] || intentColors.other;
                const max = intentEntries[0][1];
                return (
                  <Box key={intent}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                      <IntentBadge intent={intent} />
                      <Typography variant="caption" fontWeight={700}>{count}</Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={(count / max) * 100}
                      sx={{
                        height: 5, borderRadius: 3, bgcolor: 'rgba(0,0,0,0.05)',
                        '& .MuiLinearProgress-bar': { bgcolor: cfg.color, borderRadius: 3 }
                      }}
                    />
                  </Box>
                );
              })}
            </Stack>
          )}
        </MainCard>
      </Grid>

      {/* Recent Subjects */}
      <Grid size={{ xs: 12, md: 6 }}>
        <MainCard title="Recent Email Subjects">
          {(stats.topSubjects || []).length === 0 ? (
            <Typography variant="body2" color="text.secondary">No recent emails.</Typography>
          ) : (
            <Stack gap={1}>
              {stats.topSubjects.map((s, i) => (
                <Box key={i} sx={{ px: 1.5, py: 0.75, borderRadius: 1.5, bgcolor: 'action.hover' }}>
                  <Typography variant="body2" noWrap>{s}</Typography>
                </Box>
              ))}
            </Stack>
          )}
        </MainCard>
      </Grid>
    </Grid>
  );
}

// ── Tab: Optimizer ────────────────────────────────────────────────────────
function RuleOptimizer() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getOptimizationTips()
      .then(r => setData(r.data))
      .catch(() => setError('Could not fetch optimization tips. Make sure ANTHROPIC_API_KEY is set.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Stack alignItems="center" gap={2} sx={{ py: 6 }}><CircularProgress /><Typography color="text.secondary">Analyzing your automation patterns…</Typography></Stack>;
  if (error)   return <Alert severity="error">{error}</Alert>;
  if (!data)   return null;

  const tips = (data.tips || '').split('\n').filter(t => t.trim());

  return (
    <Grid container rowSpacing={2.5} columnSpacing={2.75}>
      {/* Tip Cards */}
      <Grid size={12}>
        <Stack gap={1.5}>
          {tips.map((tip, i) => (
            <Box
              key={i}
              sx={{
                px: 2.5, py: 2, borderRadius: 2, border: '1px solid',
                borderColor: 'rgba(22,119,255,0.2)',
                bgcolor: 'rgba(22,119,255,0.04)',
                display: 'flex', gap: 2, alignItems: 'flex-start'
              }}
            >
              <Box sx={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                bgcolor: 'primary.main', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700
              }}>
                {i + 1}
              </Box>
              <Typography variant="body2" sx={{ lineHeight: 1.7 }}>{tip.replace(/^\d+\.\s*/, '')}</Typography>
            </Box>
          ))}
        </Stack>
      </Grid>

      {/* Quick Stats */}
      <Grid size={{ xs: 12, sm: 4 }}>
        <MainCard>
          <Typography variant="caption" color="text.secondary">Unused Rules</Typography>
          <Typography variant="h3" color={data.unusedRuleCount > 0 ? 'error.main' : 'success.main'}>
            {data.unusedRuleCount}
          </Typography>
          <Typography variant="caption" color="text.secondary">consider disabling</Typography>
        </MainCard>
      </Grid>

      <Grid size={{ xs: 12, sm: 8 }}>
        <MainCard title="Top Unmatched Senders">
          {(data.topUnmatchedSenders || []).length === 0 ? (
            <Typography variant="body2" color="text.secondary">All senders are covered by rules. 🎉</Typography>
          ) : (
            <Stack gap={0.75}>
              {data.topUnmatchedSenders.map((s, i) => (
                <Box key={i} sx={{ px: 1.5, py: 0.75, borderRadius: 1.5, bgcolor: 'action.hover' }}>
                  <Typography variant="body2">{s}</Typography>
                </Box>
              ))}
            </Stack>
          )}
        </MainCard>
      </Grid>

      {/* Unmatched Intents */}
      <Grid size={12}>
        <MainCard title="Unmatched Intent Breakdown">
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            These emails were processed but had no matching rule.
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {Object.entries(data.unmatchedIntents || {}).length === 0 ? (
              <Typography variant="body2" color="success.main">All intents are covered! ✅</Typography>
            ) : (
              Object.entries(data.unmatchedIntents)
                .sort((a, b) => b[1] - a[1])
                .map(([intent, count]) => (
                  <Chip
                    key={intent}
                    label={`${intentColors[intent]?.label || intent}: ${count}`}
                    size="small"
                    sx={{
                      bgcolor: intentColors[intent]?.bg,
                      color: intentColors[intent]?.color,
                      fontWeight: 600
                    }}
                  />
                ))
            )}
          </Stack>
        </MainCard>
      </Grid>
    </Grid>
  );
}

// ── Tab: Live Feed ────────────────────────────────────────────────────────
function LiveFeed() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchLive = useCallback(() => {
    getLiveStats()
      .then(r => { setData(r.data); setLastUpdate(new Date()); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchLive();
    intervalRef.current = setInterval(fetchLive, 30_000);
    return () => clearInterval(intervalRef.current);
  }, [fetchLive]);

  if (loading) return <Stack alignItems="center" gap={2} sx={{ py: 6 }}><CircularProgress /><Typography color="text.secondary">Loading live feed…</Typography></Stack>;
  if (!data)   return <Alert severity="warning">No live data available.</Alert>;

  const { lastHour, totals } = data;

  return (
    <Grid container rowSpacing={2.5} columnSpacing={2.75}>
      {/* Header + refresh info */}
      <Grid size={12}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" alignItems="center" gap={1}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#52c41a', animation: 'pulse 2s infinite', '@keyframes pulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.4 } } }} />
            <Typography variant="body2" color="text.secondary">Live · auto-refreshes every 30s</Typography>
          </Stack>
          {lastUpdate && (
            <Typography variant="caption" color="text.disabled">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </Typography>
          )}
        </Stack>
      </Grid>

      {/* Last hour stats */}
      {[
        { label: 'Processed (1h)', value: lastHour.processed, color: 'primary.main' },
        { label: 'Succeeded (1h)', value: lastHour.success,   color: 'success.main' },
        { label: 'Active Rules',   value: totals.activeRules, color: 'warning.main' },
        { label: 'VIP Contacts',   value: totals.vipContacts, color: '#fa8c16' }
      ].map(stat => (
        <Grid key={stat.label} size={{ xs: 6, md: 3 }}>
          <MainCard>
            <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
            <Typography variant="h3" sx={{ color: stat.color, mt: 0.5 }}>{stat.value}</Typography>
          </MainCard>
        </Grid>
      ))}

      {/* Intent counts (1h) */}
      <Grid size={{ xs: 12, md: 5 }}>
        <MainCard title="Intent Counts (Last 1h)">
          {Object.keys(lastHour.byIntent).length === 0 ? (
            <Typography variant="body2" color="text.secondary">No emails processed in the last hour.</Typography>
          ) : (
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {Object.entries(lastHour.byIntent).sort((a, b) => b[1] - a[1]).map(([intent, cnt]) => (
                <Chip
                  key={intent}
                  label={`${intentColors[intent]?.label || intent} · ${cnt}`}
                  size="small"
                  sx={{ bgcolor: intentColors[intent]?.bg, color: intentColors[intent]?.color, fontWeight: 600 }}
                />
              ))}
            </Stack>
          )}
        </MainCard>
      </Grid>

      {/* Latest emails */}
      <Grid size={{ xs: 12, md: 7 }}>
        <MainCard title="Latest Processed Emails">
          {(lastHour.latest || []).length === 0 ? (
            <Typography variant="body2" color="text.secondary">No recent emails to display.</Typography>
          ) : (
            <Stack gap={1}>
              {lastHour.latest.map((e, i) => (
                <Box
                  key={i}
                  sx={{
                    px: 1.5, py: 1, borderRadius: 1.5,
                    bgcolor: e.success ? 'rgba(82,196,26,0.05)' : 'rgba(255,77,79,0.05)',
                    border: '1px solid',
                    borderColor: e.success ? 'rgba(82,196,26,0.2)' : 'rgba(255,77,79,0.2)'
                  }}
                >
                  <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                    <Typography variant="body2" fontWeight={600} noWrap sx={{ flex: 1, maxWidth: 260 }}>
                      {e.subject || '(no subject)'}
                    </Typography>
                    <IntentBadge intent={e.intent} />
                    <Chip
                      label={e.success ? '✓' : '✗'}
                      size="small"
                      color={e.success ? 'success' : 'error'}
                      sx={{ minWidth: 32 }}
                    />
                  </Stack>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {e.from} · {new Date(e.timestamp).toLocaleTimeString()}
                  </Typography>
                </Box>
              ))}
            </Stack>
          )}
        </MainCard>
      </Grid>
    </Grid>
  );
}

// ── Tab: Sender Intel ─────────────────────────────────────────────────────
function SenderIntel() {
  const [email, setEmail] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const lookup = () => {
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    setData(null);
    getSenderIntelligence(email.trim())
      .then(r => setData(r.data))
      .catch(() => setError('Sender not found or not enough data yet.'))
      .finally(() => setLoading(false));
  };

  const rel = data?.sender;

  return (
    <Grid container rowSpacing={2.5} columnSpacing={2.75}>
      <Grid size={12}>
        <Stack direction="row" gap={1.5}>
          <OutlinedInput
            placeholder="Enter sender email address…"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && lookup()}
            sx={{ flex: 1, height: 42 }}
          />
          <AnimateButton>
            <Button variant="contained" onClick={lookup} disabled={loading} sx={{ height: 42, px: 3 }}>
              {loading ? <CircularProgress size={16} color="inherit" /> : 'Analyze'}
            </Button>
          </AnimateButton>
        </Stack>
      </Grid>

      {error && <Grid size={12}><Alert severity="warning">{error}</Alert></Grid>}

      {data && rel && (
        <>
          {/* Profile Card */}
          <Grid size={{ xs: 12, md: 5 }}>
            <MainCard>
              <Stack gap={2}>
                <Stack direction="row" alignItems="center" gap={2}>
                  <Avatar
                    sx={{
                      width: 56, height: 56, fontSize: 22, fontWeight: 700,
                      background: 'linear-gradient(135deg, #1677ff, #722ed1)'
                    }}
                  >
                    {(rel.senderName || rel.senderEmail || '?')[0].toUpperCase()}
                  </Avatar>
                  <Box>
                    <Stack direction="row" alignItems="center" gap={0.75}>
                      <Typography variant="h6">{rel.senderName || rel.senderEmail}</Typography>
                      {rel.isVip && <Chip icon={<StarFilled />} label="VIP" color="warning" size="small" />}
                    </Stack>
                    <Typography variant="caption" color="text.secondary">{rel.senderEmail}</Typography>
                  </Box>
                </Stack>

                <Divider />

                {[
                  { label: 'Total Emails', value: rel.totalEmails },
                  { label: 'First Seen',   value: new Date(rel.firstSeenAt).toLocaleDateString() },
                  { label: 'Last Seen',    value: new Date(rel.lastSeenAt).toLocaleDateString() },
                  { label: 'Best Reply Hour', value: rel.bestSendHour !== null ? `${rel.bestSendHour}:00` : 'Not enough data' }
                ].map(item => (
                  <Stack key={item.label} direction="row" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                    <Typography variant="caption" fontWeight={600}>{item.value}</Typography>
                  </Stack>
                ))}

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                  {[...new Set(rel.topics || [])].slice(0, 8).map(t => (
                    <Chip key={t} label={t} size="small" variant="outlined" />
                  ))}
                </Box>
              </Stack>
            </MainCard>
          </Grid>

          {/* Intelligence */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack gap={2}>
              <MainCard
                sx={{
                  background: 'linear-gradient(135deg, rgba(22,119,255,0.08) 0%, rgba(114,46,209,0.08) 100%)',
                  border: '1px solid rgba(22,119,255,0.2)'
                }}
              >
                <Stack direction="row" gap={1.5} alignItems="flex-start">
                  <RobotOutlined style={{ fontSize: 22, color: '#1677ff', marginTop: 2 }} />
                  <Box>
                    <Typography variant="subtitle2" color="primary.main" sx={{ mb: 0.5 }}>AI Intelligence</Typography>
                    <Typography variant="body2" sx={{ lineHeight: 1.7 }}>{data.intelligence}</Typography>
                  </Box>
                </Stack>
              </MainCard>

              <MainCard title="Intent History">
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {Object.entries(data.intentBreakdown || {}).length === 0 ? (
                    <Typography variant="body2" color="text.secondary">No intent data yet.</Typography>
                  ) : (
                    Object.entries(data.intentBreakdown)
                      .sort((a, b) => b[1] - a[1])
                      .map(([intent, count]) => (
                        <Chip
                          key={intent}
                          label={`${intentColors[intent]?.label || intent}: ${count}`}
                          size="small"
                          sx={{ bgcolor: intentColors[intent]?.bg, color: intentColors[intent]?.color, fontWeight: 600 }}
                        />
                      ))
                  )}
                </Stack>
              </MainCard>
            </Stack>
          </Grid>
        </>
      )}

      {!data && !loading && !error && (
        <Grid size={12}>
          <Alert severity="info">
            Enter a sender's email address to get AI-powered intelligence: relationship history, best reply timing, intent patterns, and more.
          </Alert>
        </Grid>
      )}
    </Grid>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────
const TABS = [
  { label: 'Priority Inbox',  icon: <TrophyOutlined />,      component: <PriorityInbox />  },
  { label: 'Daily Digest',    icon: <DashboardOutlined />,   component: <DailyDigest />    },
  { label: 'Rule Optimizer',  icon: <BulbOutlined />,        component: <RuleOptimizer />  },
  { label: 'Live Feed',       icon: <ThunderboltOutlined />, component: <LiveFeed />       },
  { label: 'Sender Intel',    icon: <SafetyOutlined />,      component: <SenderIntel />    }
];

export default function AICommandCenter() {
  const [tab, setTab] = useState(0);

  return (
    <Grid container rowSpacing={3} columnSpacing={2.75}>
      {/* Header */}
      <Grid size={12}>
        <Stack direction="row" alignItems="center" gap={1.5}>
          <Box sx={{
            width: 38, height: 38, borderRadius: 2,
            background: 'linear-gradient(135deg, #1677ff, #722ed1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <RobotOutlined style={{ color: '#fff', fontSize: 20 }} />
          </Box>
          <Box>
            <Typography
              variant="h5"
              sx={{
                px: 2, py: 0.75, borderRadius: 2, display: 'inline-block',
                backgroundColor: 'rgba(255,255,255,0.75)',
                backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)'
              }}
            >
              AI Command Center
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25, ml: 0.25 }}>
              Priority scoring · smart digest · rule optimization · live feed · sender intelligence
            </Typography>
          </Box>
        </Stack>
      </Grid>

      {/* Tabs */}
      <Grid size={12}>
        <MainCard content={false}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 2 }}
          >
            {TABS.map((t, i) => (
              <Tab key={i} icon={t.icon} iconPosition="start" label={t.label} sx={{ gap: 0.5, minHeight: 52 }} />
            ))}
          </Tabs>
          <Box sx={{ p: 2.5 }}>
            {TABS[tab].component}
          </Box>
        </MainCard>
      </Grid>
    </Grid>
  );
}
