import { useState } from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Button from '@mui/material/Button';

import SettingOutlined from '@ant-design/icons/SettingOutlined';
import CloseOutlined from '@ant-design/icons/CloseOutlined';
import CheckOutlined from '@ant-design/icons/CheckOutlined';

import useConfig from 'hooks/useConfig';
import { BG_IMAGES, FONT_OPTIONS } from 'config';

// ==============================|| THEME CUSTOMIZER PANEL ||============================== //

export default function ThemeCustomizerPanel() {
  const [open, setOpen] = useState(false);
  const { state, setField } = useConfig();

  const currentBg = state.backgroundImage || null;
  const currentFont = state.fontFamily || FONT_OPTIONS[0].value;

  const handleFontChange = (e) => {
    setField('fontFamily', e.target.value);
  };

  const handleBgSelect = (url) => {
    setField('backgroundImage', url);
  };

  return (
    <>
      {/* Floating settings button */}
      <Tooltip title="Customize Theme" placement="left">
        <Box
          sx={{
            position: 'fixed',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 1300,
          }}
        >
          <Box
            onClick={() => setOpen(true)}
            sx={{
              width: 40,
              height: 40,
              bgcolor: 'primary.main',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px 0 0 8px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
              transition: 'all 0.2s',
              '&:hover': { bgcolor: 'primary.dark', width: 44 }
            }}
          >
            <SettingOutlined style={{ fontSize: 18 }} />
          </Box>
        </Box>
      </Tooltip>

      {/* Drawer panel */}
      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            width: 300,
            p: 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 2.5,
            py: 2,
            bgcolor: 'primary.main',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Stack>
            <Typography variant="h6" fontWeight={600} color="inherit">
              Theme Settings
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8, color: 'inherit' }}>
              Customize your experience
            </Typography>
          </Stack>
          <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: '#fff' }}>
            <CloseOutlined />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflowY: 'auto', p: 2.5 }}>

          {/* Font Family */}
          <Typography variant="subtitle2" fontWeight={600} mb={1.5} color="text.primary">
            Font Family
          </Typography>
          <FormControl fullWidth size="small" sx={{ mb: 3 }}>
            <Select
              value={currentFont}
              onChange={handleFontChange}
              sx={{ fontFamily: currentFont }}
            >
              {FONT_OPTIONS.map((f) => (
                <MenuItem
                  key={f.value}
                  value={f.value}
                  sx={{ fontFamily: f.value }}
                >
                  {f.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Preview of font */}
          <Box
            sx={{
              mb: 3,
              p: 1.5,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              bgcolor: 'grey.50'
            }}
          >
            <Typography variant="body2" sx={{ fontFamily: currentFont }} color="text.secondary">
              Preview: The quick brown fox jumps over the lazy dog.
            </Typography>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Background Image */}
          <Typography variant="subtitle2" fontWeight={600} mb={0.5} color="text.primary">
            Background Theme
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" mb={2}>
            Select a background image for the app
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 1
            }}
          >
            {BG_IMAGES.map((img) => (
              <Tooltip key={img.id} title={img.label} placement="top">
                <Box
                  onClick={() => handleBgSelect(img.url)}
                  sx={{
                    aspectRatio: '1',
                    borderRadius: 1.5,
                    border: '2.5px solid',
                    borderColor: currentBg === img.url ? 'primary.main' : 'transparent',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    position: 'relative',
                    bgcolor: img.url ? 'transparent' : 'grey.200',
                    boxShadow: currentBg === img.url ? '0 0 0 2px rgba(24,144,255,0.3)' : '0 1px 4px rgba(0,0,0,0.1)',
                    transition: 'all 0.2s',
                    '&:hover': { transform: 'scale(1.05)' }
                  }}
                >
                  {img.url ? (
                    <Box
                      component="img"
                      src={img.url}
                      alt={img.label}
                      sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 10,
                        color: 'text.secondary',
                        fontWeight: 600,
                        textAlign: 'center',
                        lineHeight: 1.2
                      }}
                    >
                      None
                    </Box>
                  )}

                  {/* Check overlay */}
                  {currentBg === img.url && (
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        bgcolor: 'rgba(24,144,255,0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <CheckOutlined style={{ color: '#1677ff', fontSize: 16, fontWeight: 700 }} />
                    </Box>
                  )}
                </Box>
              </Tooltip>
            ))}
          </Box>

          {/* Selected label */}
          <Typography variant="caption" color="text.secondary" display="block" mt={1} textAlign="center">
            {BG_IMAGES.find(img => img.url === currentBg)?.label || 'Default (No Background)'}
          </Typography>

          <Divider sx={{ my: 3 }} />

          {/* Reset */}
          <Button
            variant="outlined"
            fullWidth
            size="small"
            onClick={() => {
              setField('backgroundImage', null);
              setField('fontFamily', FONT_OPTIONS[0].value);
            }}
            sx={{ color: 'text.secondary', borderColor: 'divider' }}
          >
            Reset to Default
          </Button>
        </Box>
      </Drawer>
    </>
  );
}
