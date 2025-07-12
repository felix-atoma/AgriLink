import React from 'react';
import { useForm } from 'react-hook-form'
import { useAuth } from '../../context/AuthContext'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { useState } from 'react'

const LoginForm = () => {
  const { t } = useTranslation()
  const { login, loading } = useAuth()
  const [formError, setFormError] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm()

  const onSubmit = async ({ email, password }) => {
    setFormError(null)
    try {
      await login({ email, password })
    } catch (err) {
      setFormError(err?.response?.data?.message || t('auth.loginError'))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 bg-white p-6 rounded-lg shadow">
      {formError && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded border border-red-300">
          {formError}
        </div>
      )}

      <Input
        label={t('auth.email')}
        id="email"
        type="email"
        autoComplete="email"
        {...register('email', {
          required: t('validation.required'),
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: t('validation.invalidEmail')
          }
        })}
        error={errors.email}
      />

      <Input
        label={t('auth.password')}
        id="password"
        type="password"
        autoComplete="current-password"
        {...register('password', {
          required: t('validation.required'),
          minLength: {
            value: 6,
            message: t('validation.min_length', { min: 6 })
          }
        })}
        error={errors.password}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <label htmlFor="remember-me" className="ml-2 text-sm text-gray-700">
            {t('auth.rememberMe')}
          </label>
        </div>

        <Link to="/forgot-password" className="text-sm text-primary-600 hover:underline">
          {t('auth.forgotPassword')}
        </Link>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? t('common.loading') : t('auth.login')}
      </Button>

      <p className="text-sm text-center text-gray-600">
        {t('auth.noAccount')}{' '}
        <Link to="/register" className="text-primary-600 hover:underline font-medium">
          {t('auth.register')}
        </Link>
      </p>
    </form>
  )
}

export default LoginForm
