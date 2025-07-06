import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await signIn(email, password)
      if (error) {
        setError(error.message)
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      setError('Erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 p-6">
        <Link to="/" className="inline-block">
          <h1 className="text-netflix-red text-3xl font-bold">StreamFlix</h1>
        </Link>
      </header>

      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-netflix-darkGray to-black opacity-90"></div>
      
      {/* Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Login Form */}
          <div className="bg-black bg-opacity-75 p-8 rounded-lg">
            <h2 className="text-white text-3xl font-bold mb-8">Entrar</h2>
            
            {error && (
              <div className="bg-orange-500 text-white p-3 rounded mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="email"
                  placeholder="Email ou número de telefone"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-netflix-lightGray hover:text-white transition-colors"
                >
                  {showPassword ? 'OCULTAR' : 'MOSTRAR'}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>

            <div className="mt-4 flex items-center justify-between text-sm">
              <label className="flex items-center text-netflix-lightGray">
                <input type="checkbox" className="mr-2" />
                Lembre-se de mim
              </label>
              
              <Link to="/forgot-password" className="text-netflix-lightGray hover:underline">
                Precisa de ajuda?
              </Link>
            </div>

            <div className="mt-8 text-netflix-lightGray">
              <p>
                Novo por aqui?{' '}
                <Link to="/register" className="text-white hover:underline font-bold">
                  Assine agora
                </Link>
                .
              </p>
            </div>

            <div className="mt-4 text-xs text-netflix-lightGray">
              <p>
                Esta página é protegida pelo Google reCAPTCHA para garantir que você não é um robô.{' '}
                <button className="text-blue-500 hover:underline">
                  Saiba mais
                </button>
                .
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Credentials */}
      <div className="absolute bottom-4 left-4 bg-netflix-darkGray p-4 rounded-lg text-xs text-netflix-lightGray max-w-xs">
        <h4 className="text-white font-bold mb-2">Demo:</h4>
        <p><strong>Admin:</strong> admin@demo.com / admin123</p>
        <p><strong>Cliente:</strong> user@demo.com / user123</p>
      </div>
    </div>
  )
}

export default Login