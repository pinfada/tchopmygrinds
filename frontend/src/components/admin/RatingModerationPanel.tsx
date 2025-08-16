import { useState, useEffect } from 'react'
import { useAppSelector } from '../../hooks/redux'
import { toast } from 'react-hot-toast'

interface Rating {
  id: number
  score: number
  comment: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  user: {
    id: number
    name: string
    email: string
  }
  rateable: {
    id: number
    type: string
    name: string
  }
}

interface ModerationStats {
  total: number
  pending: number
  approved: number
  rejected: number
  approval_rate: number
}

const RatingModerationPanel = () => {
  const { user } = useAppSelector((state) => state.auth)
  const [ratings, setRatings] = useState<Rating[]>([])
  const [stats, setStats] = useState<ModerationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('pending')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    if (user?.admin) {
      fetchRatings()
      fetchStats()
    }
  }, [user, filter, currentPage])

  const fetchRatings = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/v1/admin/ratings?status=${filter}&page=${currentPage}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setRatings(data.ratings)
        setTotalPages(data.meta.total_pages)
      } else {
        toast.error('Erreur lors du chargement des évaluations')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors du chargement des évaluations')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/v1/admin/ratings/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Erreur stats:', error)
    }
  }

  const moderateRating = async (ratingId: number, action: 'approve' | 'reject') => {
    try {
      const response = await fetch(`/api/v1/admin/ratings/${ratingId}/${action}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        toast.success(`Avis ${action === 'approve' ? 'approuvé' : 'rejeté'} avec succès`)
        fetchRatings()
        fetchStats()
      } else {
        toast.error('Erreur lors de la modération')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la modération')
    }
  }

  const deleteRating = async (ratingId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet avis ?')) return

    try {
      const response = await fetch(`/api/v1/admin/ratings/${ratingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        toast.success('Avis supprimé avec succès')
        fetchRatings()
        fetchStats()
      } else {
        toast.error('Erreur lors de la suppression')
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
      approved: { label: 'Approuvé', color: 'bg-green-100 text-green-800' },
      rejected: { label: 'Rejeté', color: 'bg-red-100 text-red-800' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig]
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  if (!user?.admin) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Accès refusé</h3>
        <p className="text-gray-600">Vous n'avez pas les droits d'administration.</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Modération des avis</h1>
        <p className="text-gray-600">Gérez et modérez les avis clients</p>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Total</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">En attente</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Approuvés</div>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Rejetés</div>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Taux d'approbation</div>
            <div className="text-2xl font-bold text-blue-600">{stats.approval_rate}%</div>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-wrap gap-4">
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="approved">Approuvés</option>
              <option value="rejected">Rejetés</option>
            </select>
          </div>
        </div>

        {/* Liste des évaluations */}
        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
            </div>
          ) : ratings.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">Aucun avis trouvé</p>
            </div>
          ) : (
            ratings.map((rating) => (
              <div key={rating.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-4 h-4 ${i < rating.score ? 'text-yellow-400' : 'text-gray-300'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      {getStatusBadge(rating.status)}
                    </div>
                    
                    <p className="text-gray-900 mb-3">{rating.comment}</p>
                    
                    <div className="text-sm text-gray-500 space-y-1">
                      <div><strong>Par:</strong> {rating.user.name} ({rating.user.email})</div>
                      <div><strong>Pour:</strong> {rating.rateable.name} ({rating.rateable.type})</div>
                      <div><strong>Date:</strong> {new Date(rating.created_at).toLocaleDateString('fr-FR')}</div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 ml-6">
                    {rating.status === 'pending' && (
                      <>
                        <button
                          onClick={() => moderateRating(rating.id, 'approve')}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                        >
                          Approuver
                        </button>
                        <button
                          onClick={() => moderateRating(rating.id, 'reject')}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                        >
                          Rejeter
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => deleteRating(rating.id)}
                      className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded disabled:opacity-50"
              >
                Précédent
              </button>
              <span className="text-gray-600">
                Page {currentPage} sur {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RatingModerationPanel