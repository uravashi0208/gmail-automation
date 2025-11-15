// material-ui
import useMediaQuery from '@mui/material/useMediaQuery';
// project imports
import Search from './Search';
import Profile from './Profile';
import MobileSection from './MobileSection';

// ==============================|| HEADER - CONTENT ||============================== //

export default function HeaderContent() {
  const downLG = useMediaQuery((theme) => theme.breakpoints.down('lg'));

  return (
    <>
      {!downLG && <Search />}
      {!downLG && <Profile />}
      {downLG && <MobileSection />}
    </>
  );
}
