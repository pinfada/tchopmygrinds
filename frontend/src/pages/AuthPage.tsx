import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { login, register } from '../store/slices/authSlice'
import { useNavigate } from 'react-router-dom'

const AuthPage = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { loading, error } = useAppSelector((state) => state.auth)
  
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'others' as 'itinerant' | 'sedentary' | 'others',
    confirmPassword: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isLogin && formData.password !== formData.confirmPassword) {
      if ((window as any).addNotification) {
        (window as any).addNotification({
          type: 'error',
          title: 'Erreur',
          message: 'Les mots de passe ne correspondent pas'
        })
      }
      return
    }

    try {
      if (isLogin) {
        await dispatch(login({
          email: formData.email,
          password: formData.password
        })).unwrap()
      } else {
        await dispatch(register({
          email: formData.email,
          password: formData.password,
          role: formData.role,
          name: formData.name
        })).unwrap()
      }
      
      // Redirection après succès
      navigate('/')
      
      if ((window as any).addNotification) {
        (window as any).addNotification({
          type: 'success',
          title: 'Succès',
          message: isLogin ? 'Connexion réussie' : 'Inscription réussie'
        })
      }
    } catch (error) {
      // L'erreur est gérée par Redux
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 bg-emerald-500 rounded-full flex items-center justify-center">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLogin ? 'Connectez-vous' : 'Créez votre compte'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isLogin ? (
              <>
                Pas encore de compte ?{' '}
                <button
                  onClick={() => setIsLogin(false)}
                  className="font-medium text-emerald-600 hover:text-emerald-500"
                >
                  Inscrivez-vous
                </button>
              </>
            ) : (
              <>
                Déjà un compte ?{' '}
                <button
                  onClick={() => setIsLogin(true)}
                  className="font-medium text-emerald-600 hover:text-emerald-500"
                >
                  Connectez-vous
                </button>
              </>
            )}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Erreur d'authentification
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    {error}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="name" className="form-label">
                  Nom complet
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required={!isLogin}
                  value={formData.name}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Votre nom complet"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="form-label">
                Adresse email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="form-input"
                placeholder="votre@email.com"
              />
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="role" className="form-label">
                  Type de compte
                </label>
                <select
                  id="role"
                  name="role"
                  required={!isLogin}
                  value={formData.role}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="others">Client</option>
                  <option value="itinerant">Commerçant itinérant</option>
                  <option value="sedentary">Commerçant sédentaire</option>
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  {formData.role === 'itinerant' && 'Vendeur mobile qui se déplace'}
                  {formData.role === 'sedentary' && 'Commerce avec adresse fixe'}
                  {formData.role === 'others' && 'Acheteur de produits'}
                </p>
              </div>
            )}

            <div>
              <label htmlFor="password" className="form-label">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isLogin ? "current-password" : "new-password"}
                required
                value={formData.password}
                onChange={handleInputChange}
                className="form-input"
                placeholder="••••••••"
              />
            </div>

            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="form-label">
                  Confirmer le mot de passe
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required={!isLogin}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="••••••••"
                />
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isLogin ? 'Connexion...' : 'Inscription...'}
                </div>
              ) : (
                <>
                  {isLogin ? 'Se connecter' : 'S\'inscrire'}
                </>
              )}
            </button>
          </div>

          {!isLogin && (
            <div className="text-sm text-gray-600">
              <p>
                En créant un compte, vous acceptez nos{' '}
                <a href="/terms" className="text-emerald-600 hover:text-emerald-500">
                  conditions d'utilisation
                </a>{' '}
                et notre{' '}
                <a href="/privacy" className="text-emerald-600 hover:text-emerald-500">
                  politique de confidentialité
                </a>.
              </p>
            </div>
          )}
        </form>

        {/* Alternative sign in methods */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">Ou</span>
            </div>
          </div>

          <div className="mt-6">
            <a
              href="/"
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              Continuer sans compte
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthPage