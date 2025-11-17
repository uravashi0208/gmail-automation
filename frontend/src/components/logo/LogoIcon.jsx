// material-ui
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

// ==============================|| LOGO ICON TEXT ||============================== //

export default function LogoIcon() {
  const theme = useTheme();

  return (
    <Typography
      variant="h5"
      sx={{
        color: theme.vars.palette.primary.dark,
        fontWeight: 'bold',
        fontSize: '1.25rem'
      }}
    >
      GA
    </Typography>
  );
}