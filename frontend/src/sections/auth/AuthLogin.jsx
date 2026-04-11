import { useState } from 'react';

// material-ui
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

// project imports
import AnimateButton from 'components/@extended/AnimateButton';
import { getAuthUrl } from '../../api';

// ============================|| GMAIL - LOGIN ||============================ //

export default function AuthLogin() {
  const [loading, setLoading] = useState(false);

  const startOAuth = async () => {
    setLoading(true);
    try {
      const res = await getAuthUrl();
      window.location.href = res.data.url;
    } catch (err) {
      console.error('Failed to get auth URL:', err);
      setLoading(false);
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <Typography variant="h3">Gmail Automation</Typography>
        <Typography variant="body1" gutterBottom sx={{ mt: 1 }}>
          Sign in with your Google account to get started. You will be redirected back after approval.
        </Typography>
      </Grid>
      <Grid size={12}>
        <AnimateButton>
          <Button fullWidth size="large" variant="contained" color="primary" onClick={startOAuth} disabled={loading}>
            {loading ? 'Redirecting…' : 'Login with Google'}
          </Button>
        </AnimateButton>
      </Grid>
    </Grid>
  );
}
