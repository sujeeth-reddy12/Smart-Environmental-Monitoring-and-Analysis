import { createBrowserRouter, Navigate, Outlet, useLocation } from 'react-router-dom'
import HeaderBar from './components/HeaderBar/HeaderBar'
import Navbar from './components/Navbar/Navbar'
import Home from './pages/Home'
import LocationSearchPage from './pages/LocationSearchPage'
import ComparisonPage from './pages/ComparisonPage'
import RankingsPage from './pages/RankingsPage'
import TrendsPage from './pages/TrendsPage'
import Prediction from './pages/Prediction'
import AlertsPage from './pages/AlertsPage'
import HistoryPage from './pages/HistoryPage'
import ReportsPage from './pages/ReportsPage'
import About from './pages/About'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import { useAuth } from './context/AuthContext'

function ProtectedRoute() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace state={{ from: location.pathname }} />
}

function RootLayout() {
  return (
    <div className="app-shell">
      <HeaderBar />
      <div className="app-body-layout">
        <Navbar />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        element: <ProtectedRoute />,
        children: [
          {
            index: true,
            element: <Home />,
          },
          {
            path: 'location-search',
            element: <LocationSearchPage />,
          },
          {
            path: 'comparison',
            element: <ComparisonPage />,
          },
          {
            path: 'rankings',
            element: <RankingsPage />,
          },
          {
            path: 'trends',
            element: <TrendsPage />,
          },
          {
            path: 'prediction',
            element: <Prediction />,
          },
          {
            path: 'alerts',
            element: <AlertsPage />,
          },
          {
            path: 'history',
            element: <HistoryPage />,
          },
          {
            path: 'reports',
            element: <ReportsPage />,
          },
          {
            path: 'profile',
            element: <Profile />,
          },
        ],
      },
      {
        path: 'about',
        element: <About />,
      },
    ],
  },
])

export default router
