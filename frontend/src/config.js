// ==============================|| THEME CONSTANT ||============================== //

export const APP_DEFAULT_PATH = '/dashboard';
export const DRAWER_WIDTH = 260;
export const MINI_DRAWER_WIDTH = 60;

export const FONT_OPTIONS = [
  { label: 'Public Sans', value: `'Public Sans', sans-serif` },
  { label: 'Inter', value: `'Inter', sans-serif` },
  { label: 'Roboto', value: `'Roboto', sans-serif` },
  { label: 'Poppins', value: `'Poppins', sans-serif` },
  { label: 'DM Sans', value: `'DM Sans', sans-serif` },
  { label: 'Nunito', value: `'Nunito', sans-serif` },
  { label: 'Outfit', value: `'Outfit', sans-serif` },
];

// 7 background images using beautiful Unsplash photos
export const BG_IMAGES = [
  { id: 'none', label: 'Default', url: null },
  {
    id: 'mountain',
    label: 'Mountains',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80'
  },
  {
    id: 'forest',
    label: 'Forest',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=80'
  },
  {
    id: 'ocean',
    label: 'Ocean',
    url: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1920&q=80'
  },
  {
    id: 'city',
    label: 'City Night',
    url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1920&q=80'
  },
  {
    id: 'aurora',
    label: 'Aurora',
    url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1920&q=80'
  },
  {
    id: 'desert',
    label: 'Desert',
    url: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1920&q=80'
  },
  {
    id: 'abstract',
    label: 'Abstract',
    url: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=1920&q=80'
  }
];

const config = {
  fontFamily: `'Public Sans', sans-serif`,
  backgroundImage: null
};

export default config;
