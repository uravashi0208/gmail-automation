// material-ui
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

// ==============================|| LOGO TEXT ||============================== //

export default function LogoMain() {
  const theme = useTheme();
  return (
    <Typography
      variant="h4"
      sx={{
        color: theme.vars.palette.primary.dark,
        fontWeight: 'bold',
        fontSize: '1.5rem'
      }}
    >
      Gmail Automation
    </Typography>
  );
}