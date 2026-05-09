import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './pages/Login';
import { Chat } from './pages/Chat';

const AppContent = () => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <Chat /> : <Login />;
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
