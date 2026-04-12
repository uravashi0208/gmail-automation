import { useEffect, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import OutlinedInput from '@mui/material/OutlinedInput';
import MainCard from 'components/MainCard';
import { getRelationships } from '../../api';
import { StarFilled, ClockCircleOutlined } from '@ant-design/icons';

function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
}

function avatarColor(email = '') {
  const colors = ['#1677ff','#52c41a','#fa8c16','#eb2f96','#722ed1','#13c2c2'];
  const i = email.split('').reduce((s, c) => s + c.charCodeAt(0), 0) % colors.length;
  return colors[i];
}

export default function Relationships() {
  const [rels, setRels]     = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getRelationships().then(r => setRels(r.data || [])).catch(console.error);
  }, []);

  const filtered = rels.filter(r =>
    r.senderEmail.includes(search.toLowerCase()) ||
    (r.senderName || '').toLowerCase().includes(search.toLowerCase())
  );

  const vips     = filtered.filter(r => r.isVip);
  const nonVips  = filtered.filter(r => !r.isVip);

  return (
    <Grid container rowSpacing={3} columnSpacing={2.75}>
      <Grid size={12}>
        <Typography variant="h5">Conversation Memory Engine</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Per-sender relationship graph — email history, topics, best reply time.
        </Typography>
      </Grid>

      <Grid size={{ xs: 12, sm: 4 }}>
        <MainCard>
          <Typography variant="subtitle2" color="text.secondary">Total Senders Tracked</Typography>
          <Typography variant="h3">{rels.length}</Typography>
        </MainCard>
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <MainCard>
          <Typography variant="subtitle2" color="text.secondary">VIP Contacts</Typography>
          <Typography variant="h3" color="warning.main">{rels.filter(r => r.isVip).length}</Typography>
        </MainCard>
      </Grid>
      <Grid size={{ xs: 12, sm: 4 }}>
        <MainCard>
          <Typography variant="subtitle2" color="text.secondary">With Send-Time Data</Typography>
          <Typography variant="h3" color="primary.main">{rels.filter(r => r.bestSendHour !== null).length}</Typography>
        </MainCard>
      </Grid>

      <Grid size={12}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
          <OutlinedInput
            placeholder="Search sender…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            sx={{ width: 280 }}
          />
        </Box>
        <MainCard content={false}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {['Sender','Emails','Topics','Best Reply Hour','Status'].map(h => (
                    <TableCell key={h}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {[...vips, ...nonVips].map(r => (
                  <TableRow key={r._id} hover>
                    <TableCell>
                      <Stack direction="row" alignItems="center" gap={1.5}>
                        <Avatar sx={{ bgcolor: avatarColor(r.senderEmail), width: 36, height: 36, fontSize: 13 }}>
                          {initials(r.senderName || r.senderEmail)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>{r.senderName || r.senderEmail}</Typography>
                          <Typography variant="caption" color="text.secondary">{r.senderEmail}</Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>{r.totalEmails}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: 200 }}>
                        {[...new Set(r.topics || [])].slice(0, 4).map(t => (
                          <Chip key={t} label={t} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {r.bestSendHour !== null ? (
                        <Stack direction="row" alignItems="center" gap={0.5}>
                          <ClockCircleOutlined style={{ color: '#1677ff' }} />
                          <Typography variant="body2">{r.bestSendHour}:00</Typography>
                        </Stack>
                      ) : (
                        <Typography variant="caption" color="text.secondary">Not enough data</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {r.isVip
                        ? <Chip icon={<StarFilled />} label="VIP" color="warning" size="small" />
                        : <Chip label="Regular" size="small" variant="outlined" />}
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">No relationships tracked yet. Process some emails first.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </MainCard>
      </Grid>
    </Grid>
  );
}
