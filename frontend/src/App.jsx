import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';

import router from 'routes';
import ThemeCustomization from 'themes';
import ScrollTop from 'components/ScrollTop';

// ==============================|| APP - THEME, ROUTER, LOCAL ||============================== //

export default function App() {
  useEffect(() => {
    // On load, capture token from OAuth redirect query param and persist it
    const param = new URLSearchParams(window.location.search).get('token');
    if (param) {
      localStorage.setItem('jwt', param);
      // Clean the URL without a full page reload
      const url = new URL(window.location.href);
      url.searchParams.delete('token');
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  return (
    <ThemeCustomization>
      <ScrollTop>
        <RouterProvider router={router} />
      </ScrollTop>
    </ThemeCustomization>
  );
}
