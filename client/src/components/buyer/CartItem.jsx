import { useCart } from '@/context/CartContext';
import { useTranslation } from 'react-i18next';
import Button from '@/components/ui/Button';
import { TrashIcon } from '@heroicons/react/24/outline';

const CartItem = ({ item }) => {
  const { t } = useTranslation();
  const { updateQuantity, removeFromCart } = useCart();

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantity(item.product._id, newQuantity);
  };

  const handleRemove = () => {
    removeFromCart(item.product._id);
  };

  return (
    <div className="flex items-center gap-4 p-4 border-b border-gray-200 bg-white rounded-md shadow-sm">
      {/* Image */}
      <div className="w-20 h-20 overflow-hidden rounded-md border">
        <img
          src={item.product.images?.[0] || '/images/placeholder-product.jpg'}
          alt={item.product.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Product Info */}
      <div className="flex-1">
        <h3 className="text-base font-semibold text-gray-800">{item.product.name}</h3>
        <p className="text-sm text-gray-500">${item.product.price.toFixed(2)}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Quantity */}
        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
          <Button
            onClick={() => handleQuantityChange(item.quantity - 1)}
            variant="ghost"
            size="sm"
            className="px-3 py-1"
          >
            −
          </Button>
          <span className="px-4 font-medium">{item.quantity}</span>
          <Button
            onClick={() => handleQuantityChange(item.quantity + 1)}
            variant="ghost"
            size="sm"
            className="px-3 py-1"
          >
            +
          </Button>
        </div>

        {/* Delete */}
        <Button
          onClick={handleRemove}
          variant="ghost"
          size="icon"
          className="text-red-500 hover:text-red-700"
        >
          <TrashIcon className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default CartItem;
