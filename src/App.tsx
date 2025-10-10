import { RouterProvider } from 'react-router';
import { ThemeModeScript, ThemeProvider } from 'flowbite-react';
import customTheme from './utils/theme/custom-theme';
import router from './routes/Router';
import { AuthProvider } from './context/AuthContext';
import { CurrentUserProvider } from './context/CurrentUserContext';

function App() {
  return (
    <>
      <ThemeModeScript />
      <AuthProvider>
        <CurrentUserProvider>
          <ThemeProvider theme={customTheme}>
            <RouterProvider router={router} />
          </ThemeProvider>
        </CurrentUserProvider>
      </AuthProvider>
    </>
  );
}

export default App;
