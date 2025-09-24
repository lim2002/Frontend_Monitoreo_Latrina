import { RouterProvider } from 'react-router';
import { ThemeModeScript, ThemeProvider } from 'flowbite-react';
import customTheme from './utils/theme/custom-theme';
import router from './routes/Router';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <>
      <ThemeModeScript />
      <AuthProvider>
        <ThemeProvider theme={customTheme}>
          <RouterProvider router={router} />
        </ThemeProvider>
      </AuthProvider>
    </>
  );
}

export default App;
