import './assets/css/App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './layouts/auth';
import AdminLayout from './layouts/admin';
import RTLLayout from './layouts/rtl';
import {
  ChakraProvider,
  // extendTheme
} from '@chakra-ui/react';
import initialTheme from './theme/theme'; //  { themeGreen }
import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { SidebarContext } from './contexts/SidebarContext';
import ProtectedRoute from './contexts/ProtectedRoute';
import ReduxWrapper from './components/wrappers/ReduxWrapper';

export default function Main() {
  // eslint-disable-next-line
  const [currentTheme, setCurrentTheme] = useState(initialTheme);
  const [toggleSidebar, setToggleSidebar] = useState(false);
  
  return (
    <ReduxWrapper>
      <ChakraProvider theme={currentTheme}>
        <SidebarContext.Provider
          value={{
            toggleSidebar,
            setToggleSidebar,
          }}
        >
          {/* The AuthProvider must be inside Routes to access useNavigate hook */}
          <Routes>
            <Route
              path="auth/*"
              element={
                <AuthProvider>
                  <AuthLayout />
                </AuthProvider>
              }
            />
            <Route
              path="admin/*"
              element={
                <AuthProvider>
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminLayout theme={currentTheme} setTheme={setCurrentTheme} />
                  </ProtectedRoute>
                </AuthProvider>
              }
            />
            <Route
              path="rtl/*"
              element={
                <AuthProvider>
                  <RTLLayout theme={currentTheme} setTheme={setCurrentTheme} />
                </AuthProvider>
              }
            />
            <Route path="/" element={<Navigate to="/auth/sign-in" replace />} />
          </Routes>
        </SidebarContext.Provider>
      </ChakraProvider>
    </ReduxWrapper>
  );
}
