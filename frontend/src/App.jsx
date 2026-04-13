import { RouterProvider } from 'react-router-dom';

import router from 'routes';
import ThemeCustomization from 'themes';
import ScrollTop from 'components/ScrollTop';
import ThemeCustomizerPanel from 'components/ThemeCustomizerPanel';
import AppBackground from 'components/AppBackground';

// ==============================|| APP - THEME, ROUTER, LOCAL ||============================== //

// Capture the OAuth token from the URL query param *synchronously* before
// the first render so that ProtectedRoute can read it from localStorage
// immediately without a race condition.
(function captureOAuthToken() {
  const param = new URLSearchParams(window.location.search).get('token');
  if (param) {
    localStorage.setItem('jwt', param);
    // Remove the token from the URL bar (no full reload)
    const url = new URL(window.location.href);
    url.searchParams.delete('token');
    window.history.replaceState({}, '', url.toString());
  }
})();

export default function App() {
  return (
    <ThemeCustomization>
      <AppBackground>
        <ScrollTop>
          <RouterProvider router={router} />
        </ScrollTop>
        <ThemeCustomizerPanel />
      </AppBackground>
    </ThemeCustomization>
  );
}
