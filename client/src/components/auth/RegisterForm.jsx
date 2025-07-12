import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Input from '../ui/Input';
import Button from '../ui/Button';
import RoleSelector from './RoleSelector';

const RegisterForm = ({ onSubmit, error }) => {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm();

  const selectedRole = watch('role');

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5 bg-white p-6 rounded-lg shadow-sm"
    >
      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded border border-red-300">
          {error}
        </div>
      )}

      <Input
        label={t('auth.name')}
        id="name"
        {...register('name', { required: t('validation.required') })}
        error={errors.name}
      />

      <Input
        label={t('auth.email')}
        id="email"
        type="email"
        {...register('email', { required: t('validation.required') })}
        error={errors.email}
      />

      <Input
        label={t('auth.contact')}
        id="contact"
        {...register('contact', { required: t('validation.required') })}
        error={errors.contact}
      />

      <Input
        label={t('auth.password')}
        id="password"
        type="password"
        {...register('password', {
          required: t('validation.required'),
          minLength: {
            value: 6,
            message: t('validation.min_length', { min: 6 })
          }
        })}
        error={errors.password}
      />

      <Input
        label={t('auth.confirm_password')}
        id="confirmPassword"
        type="password"
        {...register('confirmPassword', {
          required: t('validation.required'),
          validate: (value) =>
            value === watch('password') || t('auth.passwords_mismatch')
        })}
        error={errors.confirmPassword}
      />

      <RoleSelector register={register} />

      {/* Conditionally show farmer-only fields */}
      {selectedRole === 'farmer' && (
        <>
          <Input
            label={t('auth.farmName')}
            id="farmName"
            {...register('farmName', { required: t('validation.required') })}
            error={errors.farmName}
          />

          <Input
            label={t('auth.latitude')}
            id="lat"
            type="number"
            step="any"
            {...register('lat', { required: t('validation.required') })}
            error={errors.lat}
          />

          <Input
            label={t('auth.longitude')}
            id="lng"
            type="number"
            step="any"
            {...register('lng', { required: t('validation.required') })}
            error={errors.lng}
          />
        </>
      )}

      <Button type="submit" className="w-full">
        {t('auth.register')}
      </Button>
    </form>
  );
};

export default RegisterForm;
