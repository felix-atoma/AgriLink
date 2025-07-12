import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';
import Button from '@/components/ui/Button';

const LogoutButton = () => {
  const { logout } = useAuth();
  const { t } = useTranslation();

  return (
    <Button 
      onClick={logout}
      variant="outline"
      className="text-gray-700 hover:text-primary-600 transition-colors"
    >
      {t('common.logout')}
    </Button>
  );
};

export default LogoutButton;
