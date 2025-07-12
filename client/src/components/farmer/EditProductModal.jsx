import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';

const EditProductModal = ({ product, isOpen, onClose, onSave }) => {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: product
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('common.edit')}>
      <form onSubmit={handleSubmit(onSave)} className="space-y-4">
        <Input
          label={t('products.name')}
          id="name"
          {...register('name', { required: t('validation.required') })}
          error={errors.name}
        />
        
        <Input
          label={t('products.price')}
          id="price"
          type="number"
          step="0.01"
          {...register('price', { 
            required: t('validation.required'),
            min: { value: 0.01, message: t('validation.min_price') }
          })}
          error={errors.price}
        />
        
        <Input
          label={t('products.stock')}
          id="stock"
          type="number"
          {...register('stock', { 
            required: t('validation.required'),
            min: { value: 0, message: t('validation.min_stock') }
          })}
          error={errors.stock}
        />
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit">{t('common.save')}</Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditProductModal;