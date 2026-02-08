import { Routes, Route } from 'react-router';
import MainLayout from './provider/MainLayout';
import PublicRoute from './provider/PublicRoute';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import Home from './pages/Home/Home';
import Deposit from './pages/Deposit/Deposit';
import Withdraw from './pages/Withdraw/Withdraw';
import Reports from './pages/Reports/Reports';
import Profile from './pages/Profile/Profile';

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        }
      />

      {/* Protected routes */}
      <Route path="/" element={<MainLayout />}>
        <Route path='/' element={<Home />} />
        <Route path="deposit" element={<Deposit />} />
        <Route path="withdraw" element={<Withdraw />} />
        <Route path="reports" element={<Reports />} />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Routes>
  );
}

export default App;
