import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// Pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/client/Dashboard'
import AdminDashboard from './pages/admin/AdminDashboard'

// Loading component
const LoadingScreen = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto mb-4"></div>
      <h2 className="text-white text-xl">StreamFlix</h2>
      <p className="text-gray-400">Carregando...</p>
    </div>
  </div>
)

// Protected route component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (adminOnly && profile?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

// Public route component (redirects to dashboard if already authenticated)
const PublicRoute = ({ children }) => {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  if (user) {
    // Redirect based on user role
    if (profile?.role === 'admin') {
      return <Navigate to="/admin" replace />
    } else {
      return <Navigate to="/dashboard" replace />
    }
  }

  return children
}

// Landing page component
const LandingPage = () => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Hero Section */}
      <div className="relative flex-1 flex items-center justify-center">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-black to-black opacity-80"></div>
        
        {/* Content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <h1 className="text-6xl md:text-8xl font-bold text-red-600 mb-6">
            StreamFlix
          </h1>
          <h2 className="text-2xl md:text-4xl font-bold mb-6">
            Filmes, séries e muito mais. Ilimitado.
          </h2>
          <p className="text-lg md:text-xl text-gray-400 mb-8">
            Assista onde quiser. Cancele quando quiser.
          </p>
          
          <div className="space-y-4 md:space-y-0 md:space-x-4 md:flex md:justify-center">
            <a 
              href="/register"
              className="inline-block btn-primary px-8 py-4 text-lg font-bold w-full md:w-auto"
            >
              Comece já
            </a>
            <a 
              href="/login"
              className="inline-block btn-secondary px-8 py-4 text-lg font-bold w-full md:w-auto"
            >
              Entrar
            </a>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-900 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">Por que escolher StreamFlix?</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🎬</div>
              <h4 className="text-xl font-bold mb-4">Conteúdo variado</h4>
              <p className="text-gray-400">
                Milhares de filmes, séries e documentários de diversos gêneros.
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-4">📱</div>
              <h4 className="text-xl font-bold mb-4">Assista em qualquer lugar</h4>
              <p className="text-gray-400">
                Compatível com smartphones, tablets, computadores e smart TVs.
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-4">⭐</div>
              <h4 className="text-xl font-bold mb-4">Conteúdo VIP</h4>
              <p className="text-gray-400">
                Acesso exclusivo a conteúdos premium e lançamentos.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Plans Section */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">Escolha seu plano</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card text-center">
              <h4 className="text-2xl font-bold mb-4">Básico</h4>
              <div className="text-3xl font-bold text-red-600 mb-4">R$ 19,90/mês</div>
              <ul className="space-y-2 text-gray-400 mb-6">
                <li>✓ Acesso a todo catálogo básico</li>
                <li>✓ Qualidade HD</li>
                <li>✓ 2 dispositivos simultâneos</li>
                <li>✗ Sem conteúdo VIP</li>
              </ul>
              <a href="/register" className="btn-secondary w-full">
                Escolher Básico
              </a>
            </div>
            
            <div className="card text-center border-2 border-red-600">
              <div className="bg-red-600 text-black px-3 py-1 rounded text-sm font-bold mb-4">
                RECOMENDADO
              </div>
              <h4 className="text-2xl font-bold mb-4">VIP</h4>
              <div className="text-3xl font-bold text-red-600 mb-4">R$ 39,90/mês</div>
              <ul className="space-y-2 text-gray-400 mb-6">
                <li>✓ Acesso a todo catálogo</li>
                <li>✓ Conteúdo VIP exclusivo</li>
                <li>✓ Qualidade 4K</li>
                <li>✓ 4 dispositivos simultâneos</li>
              </ul>
              <a href="/register" className="btn-primary w-full">
                Escolher VIP
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center text-gray-400">
          <p>&copy; 2024 StreamFlix. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={
            <PublicRoute>
              <LandingPage />
            </PublicRoute>
          } />
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          {/* Admin routes */}
          <Route path="/admin" element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
