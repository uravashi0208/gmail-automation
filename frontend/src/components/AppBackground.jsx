import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import useConfig from 'hooks/useConfig';

// ==============================|| APP BACKGROUND WRAPPER ||============================== //

export default function AppBackground({ children }) {
  const { state } = useConfig();
  const bgImage = state.backgroundImage || null;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        position: 'relative',
        ...(bgImage && {
          '&::before': {
            content: '""',
            position: 'fixed',
            inset: 0,
            backgroundImage: `url(${bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            zIndex: -1,
            // slight dark overlay for readability
            filter: 'brightness(0.92)',
          },
          // Make sidebar and header glass-morphism when bg is set
          '& .MuiDrawer-paper': {
            backgroundColor: 'rgba(255,255,255,0.82) !important',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderRight: '1px solid rgba(255,255,255,0.3) !important',
          },
          '& .MuiAppBar-root': {
            backgroundColor: 'rgba(255,255,255,0.80) !important',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(255,255,255,0.3) !important',
          },
          // Main content area transparency
          '& .MuiPaper-root:not(.MuiDrawer-paper):not(.MuiPopover-paper):not(.MuiMenu-paper)': {
            backgroundColor: 'rgba(255,255,255,0.80)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }
        })
      }}
    >
      {children}
    </Box>
  );
}

AppBackground.propTypes = { children: PropTypes.node };
