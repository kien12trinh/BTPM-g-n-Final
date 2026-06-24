import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import Transaction from './pages/Transaction'
import Analytics from './pages/Analytics'
import Categories from './pages/Categories'
import Login from './pages/Login'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/transactions/new" replace />} />
          <Route path="transactions/new" element={<Transaction />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="categories" element={<Categories />} />
          <Route path="*" element={<Navigate to="/transactions/new" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
