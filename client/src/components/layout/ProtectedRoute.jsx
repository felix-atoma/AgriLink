import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTranslation } from 'react-i18next'

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth()
  const { t } = useTranslation()
  const location = useLocation()

  // Show loading spinner or text while checking auth
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500">{t('common.loading')}...</p>
      </div>
    )
  }

  // If no user, redirect to login with redirect location saved
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  // If user's role is not allowed, redirect to home or 403 page
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
