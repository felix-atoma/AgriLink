import { useCart } from '@/context/CartContext';
import { useTranslation } from 'react-i18next';
import Button from '@/components/ui/Button';

const CartSummary = ({ onCheckout, onClearCart }) => {
  const { cartTotal, cartCount } = useCart();
  const { t } = useTranslation();

  return (
    <div className="bg-white shadow-md p-6 rounded-xl border border-gray-200">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">{t('cart.summary')}</h3>

      <div className="space-y-4 text-gray-700">
        <div className="flex justify-between">
          <span>{t('cart.items')}</span>
          <span className="font-medium">{cartCount}</span>
        </div>
        <div className="flex justify-between border-t pt-3">
          <span className="font-semibold">{t('cart.subtotal')}</span>
          <span className="font-bold text-green-600">${cartTotal.toFixed(2)}</span>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <Button
          onClick={onCheckout}
          className="w-full"
          disabled={cartCount === 0}
        >
          {t('cart.checkout')}
        </Button>

        {onClearCart && (
          <Button
            onClick={onClearCart}
            variant="secondary"
            className="w-full"
          >
            {t('cart.clear_cart')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default CartSummary;
