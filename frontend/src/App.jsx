import { RouterProvider } from 'react-router-dom';

// project imports
import router from 'routes';
import ThemeCustomization from 'themes';

import ScrollTop from 'components/ScrollTop';
import { useEffect, useState } from 'react';
import { currentUser } from './api';

// ==============================|| APP - THEME, ROUTER, LOCAL ||============================== //

export default function App() {

  const [token, setToken] = useState(() => {
    const param = new URLSearchParams(window.location.search).get('token');
    return param || localStorage.getItem('jwt');
  });
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      localStorage.setItem('jwt', token);
      currentUser(token).then(res => setUser(res.data.user)).catch(() => {
        localStorage.removeItem('jwt'); setToken(null);
      });
    }
  }, [token]);
  return (
    <ThemeCustomization>
      <ScrollTop>
        <RouterProvider router={router} />
      </ScrollTop>
    </ThemeCustomization>
  );
}
