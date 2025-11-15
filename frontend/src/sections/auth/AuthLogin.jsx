import PropTypes from 'prop-types';

// material-ui
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';

import AnimateButton from 'components/@extended/AnimateButton';

import { getAuthUrl } from '../../api';
import { useState } from 'react';
import Typography from '@mui/material/Typography';
// ============================|| JWT - LOGIN ||============================ //

export default function AuthLogin() {


  const [loading, setLoading] = useState(false);

  const startOAuth = async () => {
    setLoading(true);
    const res = await getAuthUrl();
    window.location.href = res.data.url;
  };
  return (
    <>
      <form noValidate>
        <Grid container spacing={3}>
          <Typography variant="h3">Gmail Automation</Typography>
          <Typography variant="body1" gutterBottom>
            After approval you will be redirected back to the app.
          </Typography>
          <Grid size={12}>
            <AnimateButton>
              <Button fullWidth size="large" variant="contained" color="primary" onClick={startOAuth} disabled={loading}>
                Login with Google
              </Button>
            </AnimateButton>
          </Grid>
        </Grid>
      </form>
    </>
  );
}

AuthLogin.propTypes = { isDemo: PropTypes.bool };
