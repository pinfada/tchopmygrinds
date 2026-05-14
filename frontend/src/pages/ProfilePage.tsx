import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { updateProfile } from '../store/slices/authSlice'
import { authAPI } from '../services/api'
import { Link } from 'react-router-dom'
import { validateWhatsappPhone } from '../lib/whatsapp'

const ProfilePage = () => {
  const dispatch = useAppDispatch()
  const { user, isAuthenticated, loading, error } = useAppSelector((state) => state.auth)
  const [isEditing, setIsEditing] = useState(false)
  const [formState, setFormState] = useState({ name: '', phone: '', whatsapp_phone: '' })
  const [whatsappError, setWhatsappError] = useState<string | null>(null)

  // Change-password sub-form state. Kept local — there is no Redux mutation
  // tied to a password change (the user object itself doesn't change), so a
  // thunk would add ceremony without benefit.
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [pwState, setPwState] = useState({ current: '', next: '', confirm: '' })
  const [pwLoading, setPwLoading] = useState(false)
  const [pwError, setPwError] = useState<string | null>(null)

  const resetPwForm = () => {
    setPwState({ current: '', next: '', confirm: '' })
    setPwError(null)
  }

  const handlePwChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPwState((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handlePwSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwError(null)
    if (pwState.next.length < 6) {
      setPwError('Le nouveau mot de passe doit contenir au moins 6 caractères.')
      return
    }
    if (pwState.next !== pwState.confirm) {
      setPwError('La confirmation ne correspond pas.')
      return
    }
    setPwLoading(true)
    try {
      await authAPI.updatePassword({
        current_password: pwState.current,
        password: pwState.next,
        password_confirmation: pwState.confirm,
      })
      resetPwForm()
      setIsChangingPassword(false)
      if ((window as any).addNotification) {
        ;(window as any).addNotification({
          type: 'success',
          title: 'Mot de passe',
          message: 'Mot de passe mis à jour.',
        })
      }
    } catch (err: any) {
      setPwError(err.response?.data?.message || 'Erreur lors du changement de mot de passe.')
    } finally {
      setPwLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      setFormState({
        name: user.name ?? '',
        phone: user.phone ?? '',
        whatsapp_phone: user.whatsapp_phone ?? '',
      })
    }
  }, [user, isEditing])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormState((prev) => ({ ...prev, [name]: value }))
    if (name === 'whatsapp_phone') setWhatsappError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    const changes: { name?: string; phone?: string; whatsapp_phone?: string } = {}
    const nextName = formState.name.trim()
    const nextPhone = formState.phone.trim()
    const rawWhatsapp = formState.whatsapp_phone.trim()
    // Empty WhatsApp clears the field — only validate when something was typed.
    let nextWhatsapp = ''
    if (rawWhatsapp) {
      const check = validateWhatsappPhone(rawWhatsapp)
      if (!check.valid) {
        setWhatsappError(check.message)
        return
      }
      nextWhatsapp = check.normalized
    }
    setWhatsappError(null)
    if (nextName !== (user.name ?? '')) changes.name = nextName
    if (nextPhone !== (user.phone ?? '')) changes.phone = nextPhone || ''
    if (nextWhatsapp !== (user.whatsapp_phone ?? '')) changes.whatsapp_phone = nextWhatsapp || ''
    if (Object.keys(changes).length === 0) {
      setIsEditing(false)
      return
    }
    try {
      await dispatch(updateProfile(changes)).unwrap()
      setIsEditing(false)
      if ((window as any).addNotification) {
        ;(window as any).addNotification({
          type: 'success',
          title: 'Profil mis à jour',
          message: 'Vos informations ont été enregistrées.',
        })
      }
    } catch {
      // error already in redux state
    }
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Accès non autorisé
        </h1>
        <p className="text-gray-600 mb-8">
          Vous devez être connecté pour accéder à votre profil
        </p>
        <a href="/auth" className="btn-primary">
          Se connecter
        </a>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 bg-brand-100 rounded-full flex items-center justify-center">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name ?? 'Avatar utilisateur'}
                width={96}
                height={96}
                loading="lazy"
                decoding="async"
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <span className="text-3xl font-bold text-brand-600">
                {user.name?.[0] || user.email[0].toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {user.name || 'Utilisateur'}
            </h1>
            <p className="text-gray-600 mb-2">{user.email}</p>
            <div className="flex items-center space-x-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                user.role === 'itinerant' ? 'bg-blue-100 text-blue-800' :
                user.role === 'sedentary' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {user.role === 'itinerant' ? 'Commerçant itinérant' :
                 user.role === 'sedentary' ? 'Commerçant sédentaire' :
                 'Client'}
              </span>
              {user.isVerified && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-brand-100 text-brand-800">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Compte vérifié
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="btn-secondary"
          >
            {isEditing ? 'Annuler' : 'Modifier'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Informations personnelles */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-body">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Informations personnelles
              </h2>
              
              {isEditing ? (
                <form className="space-y-6" onSubmit={handleSubmit}>
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                      {error}
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="profile-name" className="form-label">Nom complet</label>
                      <input
                        id="profile-name"
                        name="name"
                        type="text"
                        value={formState.name}
                        onChange={handleChange}
                        className="form-input"
                        autoComplete="name"
                      />
                    </div>
                    <div>
                      <label htmlFor="profile-phone" className="form-label">Téléphone</label>
                      <input
                        id="profile-phone"
                        name="phone"
                        type="tel"
                        value={formState.phone}
                        onChange={handleChange}
                        className="form-input"
                        autoComplete="tel"
                        placeholder="+33 6 12 34 56 78"
                      />
                    </div>
                  </div>

                  {(user.role === 'itinerant' || user.role === 'sedentary') && (
                    <div>
                      <label htmlFor="profile-whatsapp" className="form-label">
                        Numéro WhatsApp (visible par les clients)
                      </label>
                      <input
                        id="profile-whatsapp"
                        name="whatsapp_phone"
                        type="tel"
                        value={formState.whatsapp_phone}
                        onChange={handleChange}
                        className={`form-input ${whatsappError ? 'border-red-500 focus:ring-red-500' : ''}`}
                        placeholder="237699999999"
                        inputMode="numeric"
                        aria-invalid={whatsappError ? 'true' : 'false'}
                        aria-describedby={whatsappError ? 'profile-whatsapp-error' : 'profile-whatsapp-help'}
                      />
                      {whatsappError ? (
                        <p id="profile-whatsapp-error" className="text-xs text-red-600 mt-1" role="alert">
                          {whatsappError}
                        </p>
                      ) : (
                        <p id="profile-whatsapp-help" className="text-xs text-gray-500 mt-1">
                          Format international sans le « + » (ex. 237 pour le Cameroun, 33 pour la France). Permet
                          à un client de vous contacter directement sur WhatsApp depuis votre fiche.
                        </p>
                      )}
                    </div>
                  )}

                  <div>
                    <label htmlFor="profile-email" className="form-label">Email</label>
                    <input
                      id="profile-email"
                      type="email"
                      defaultValue={user.email}
                      className="form-input"
                      disabled
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      L'email ne peut pas être modifié
                    </p>
                  </div>

                  <div className="flex space-x-4">
                    <button type="submit" className="btn-primary" disabled={loading}>
                      {loading ? 'Sauvegarde…' : 'Sauvegarder'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="btn-secondary"
                      disabled={loading}
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Nom complet</dt>
                      <dd className="mt-1 text-sm text-gray-900">{user.name || 'Non renseigné'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Téléphone</dt>
                      <dd className="mt-1 text-sm text-gray-900">{user.phone || 'Non renseigné'}</dd>
                    </div>
                  </div>

                  {(user.role === 'itinerant' || user.role === 'sedentary') && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">WhatsApp</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {user.whatsapp_phone ? `+${user.whatsapp_phone}` : 'Non renseigné'}
                      </dd>
                    </div>
                  )}
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Type de compte</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {user.role === 'itinerant' ? 'Commerçant itinérant' :
                       user.role === 'sedentary' ? 'Commerçant sédentaire' :
                       'Client'}
                    </dd>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions rapides */}
          <div className="card">
            <div className="card-body">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Actions rapides
              </h3>
              <div className="space-y-3">
                <a href="/orders" className="block w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <span className="text-gray-900">Mes commandes</span>
                  </div>
                </a>
                
                {(user.role === 'itinerant' || user.role === 'sedentary') && (
                  <a href="/dashboard" className="block w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="text-gray-900">Mon commerce</span>
                    </div>
                  </a>
                )}
                
                <Link to="/favorites" className="block w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="text-gray-900">Mes favoris</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Statistiques (pour les commerçants) */}
          {(user.role === 'itinerant' || user.role === 'sedentary') && (
            <div className="card">
              <div className="card-body">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Statistiques
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">Commandes ce mois</span>
                      <span className="text-lg font-bold text-gray-900">12</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">Chiffre d'affaires</span>
                      <span className="text-lg font-bold text-brand-600">€385.50</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">Note moyenne</span>
                      <div className="flex items-center space-x-1">
                        <span className="text-lg font-bold text-gray-900">4.8</span>
                        <svg className="w-5 h-5 text-accent-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sécurité */}
          <div className="card">
            <div className="card-body">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Sécurité
              </h3>
              <div className="space-y-3">
                {isChangingPassword ? (
                  <form onSubmit={handlePwSubmit} className="space-y-3 bg-gray-50 rounded-lg p-4">
                    {pwError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-sm text-red-700">
                        {pwError}
                      </div>
                    )}
                    <div>
                      <label htmlFor="pw-current" className="form-label">Mot de passe actuel</label>
                      <input
                        id="pw-current"
                        name="current"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={pwState.current}
                        onChange={handlePwChange}
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label htmlFor="pw-next" className="form-label">Nouveau mot de passe</label>
                      <input
                        id="pw-next"
                        name="next"
                        type="password"
                        autoComplete="new-password"
                        minLength={6}
                        required
                        value={pwState.next}
                        onChange={handlePwChange}
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label htmlFor="pw-confirm" className="form-label">Confirmer</label>
                      <input
                        id="pw-confirm"
                        name="confirm"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={pwState.confirm}
                        onChange={handlePwChange}
                        className="form-input"
                      />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button type="submit" className="btn-primary" disabled={pwLoading}>
                        {pwLoading ? 'Enregistrement…' : 'Mettre à jour'}
                      </button>
                      <button
                        type="button"
                        className="btn-secondary"
                        disabled={pwLoading}
                        onClick={() => { resetPwForm(); setIsChangingPassword(false) }}
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsChangingPassword(true)}
                    className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  >
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                      <span className="text-gray-900">Changer mot de passe</span>
                    </div>
                  </button>
                )}

                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  title="Fonctionnalité à venir"
                  className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg cursor-not-allowed opacity-60"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-700">Vérification deux facteurs</span>
                    </div>
                    <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">Bientôt</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage