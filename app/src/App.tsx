import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import UserDashboard from './pages/UserDashboard'
import EventManagement from './pages/EventManagement'
import EventDetail from './pages/EventDetail'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/events" element={<EventManagement />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
