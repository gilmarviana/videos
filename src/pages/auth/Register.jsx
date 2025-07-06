import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { db } from '../../services/supabase'

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [subscriptionPlans, setSubscriptionPlans] = useState([])
  const [selectedPlan, setSelectedPlan] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showFreeTrial, setShowFreeTrial] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    loadSubscriptionPlans()
  }, [])

  const loadSubscriptionPlans = async () => {
    try {
      const { data, error } = await db.getSubscriptionPlans()
      if (error) throw error
      setSubscriptionPlans(data || [])
      if (data && data.length > 0) {
        setSelectedPlan(data[0].id)
      }
    } catch (err) {
      console.error('Error loading subscription plans:', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      setLoading(false)
      return
    }

    if (!selectedPlan && !showFreeTrial) {
      setError('Selecione um plano de assinatura ou inicie com o período gratuito')
      setLoading(false)
      return
    }

    try {
      const { data, error } = await signUp(formData.email, formData.password, {
        full_name: formData.fullName
      })
      
      if (error) {
        setError(error.message)
      } else {
        // Create free trial subscription if selected
        if (showFreeTrial && data?.user) {
          const trialEndDate = new Date()
          trialEndDate.setDate(trialEndDate.getDate() + 3) // 3 days from now
          
          const { error: subscriptionError } = await db.createSubscription({
            user_id: data.user.id,
            plan_id: null, // No specific plan for trial
            active: true,
            started_at: new Date().toISOString(),
            expires_at: trialEndDate.toISOString(),
            is_trial: true
          })
          
          if (subscriptionError) {
            console.error('Error creating trial subscription:', subscriptionError)
          }
        }
        
        // Registration successful, redirect to dashboard
        navigate('/dashboard')
      }
    } catch (err) {
      setError('Erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
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
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-lg">
          {/* Registration Form */}
          <div className="bg-black bg-opacity-75 p-8 rounded-lg">
            <h2 className="text-white text-3xl font-bold mb-2">Criar conta</h2>
            <p className="text-netflix-lightGray mb-8">
              Junte-se a milhares de usuários e tenha acesso a conteúdo exclusivo
            </p>
            
            {error && (
              <div className="bg-orange-500 text-white p-3 rounded mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Nome completo"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Senha (mín. 6 caracteres)"
                  value={formData.password}
                  onChange={handleInputChange}
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

              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Confirmar senha"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="input-field pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-netflix-lightGray hover:text-white transition-colors"
                >
                  {showConfirmPassword ? 'OCULTAR' : 'MOSTRAR'}
                </button>
              </div>

              {/* Free Trial Option */}
              <div className="space-y-3">
                <label className="text-white font-medium">Escolha seu plano:</label>
                
                {/* Free Trial Option */}
                <label
                  className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    showFreeTrial
                      ? 'border-green-500 bg-green-500 bg-opacity-20'
                      : 'border-gray-600 bg-gray-700 bg-opacity-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="subscriptionOption"
                    checked={showFreeTrial}
                    onChange={() => {
                      setShowFreeTrial(true)
                      setSelectedPlan('')
                    }}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-bold">🎁 Iniciar com 3 dias grátis</h3>
                      <span className="text-green-400 font-bold">
                        GRÁTIS
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mt-1">
                      Experimente todos os recursos por 3 dias sem compromisso
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                      <span>✓ Acesso completo</span>
                      <span>✓ Conteúdo VIP</span>
                      <span>✓ Cancele quando quiser</span>
                    </div>
                  </div>
                </label>

                <div className="text-center text-gray-400 text-sm">
                  <span>ou escolha um plano:</span>
                </div>
                {subscriptionPlans.map((plan) => (
                  <label
                    key={plan.id}
                    className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedPlan === plan.id
                        ? 'border-red-600 bg-red-600 bg-opacity-20'
                        : showFreeTrial
                        ? 'border-gray-500 bg-gray-600 bg-opacity-30 opacity-50'
                        : 'border-gray-700 bg-gray-700 bg-opacity-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="subscriptionPlan"
                      value={plan.id}
                      checked={selectedPlan === plan.id}
                      onChange={(e) => {
                        setSelectedPlan(e.target.value)
                        setShowFreeTrial(false)
                      }}
                      disabled={showFreeTrial}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-white font-bold">{plan.name}</h3>
                        <span className="text-netflix-red font-bold">
                          R$ {plan.price.toFixed(2)}
                          <span className="text-sm text-netflix-lightGray">
                            /{plan.duration_type}
                          </span>
                        </span>
                      </div>
                      {plan.description && (
                        <p className="text-netflix-lightGray text-sm mt-1">
                          {plan.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 mt-2 text-xs text-netflix-lightGray">
                        {plan.includes_vip && (
                          <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-2 py-1 rounded font-bold">
                            VIP
                          </span>
                        )}
                        <span>✓ HD Quality</span>
                        <span>✓ Multi-device</span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="text-xs text-netflix-lightGray space-y-2">
                <label className="flex items-start">
                  <input type="checkbox" className="mr-2 mt-1" required />
                  <span>
                    Eu concordo com os{' '}
                    <Link to="/terms" className="text-blue-500 hover:underline">
                      Termos de Uso
                    </Link>
                    {' '}e{' '}
                    <Link to="/privacy" className="text-blue-500 hover:underline">
                      Política de Privacidade
                    </Link>
                  </span>
                </label>
                <label className="flex items-start">
                  <input type="checkbox" className="mr-2 mt-1" />
                  <span>
                    Eu gostaria de receber ofertas especiais e atualizações por email
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Criando conta...' : 'Criar conta'}
              </button>
            </form>

            <div className="mt-8 text-netflix-lightGray text-center">
              <p>
                Já tem uma conta?{' '}
                <Link to="/login" className="text-white hover:underline font-bold">
                  Entrar
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register