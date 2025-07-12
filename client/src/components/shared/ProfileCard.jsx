import { useTranslation } from 'react-i18next';

const ProfileCard = ({ user }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex-shrink-0 h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
          <span className="text-xl font-medium text-gray-600">
            {user.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <h3 className="text-lg font-medium">{user.name}</h3>
          <p className="text-gray-500 capitalize">{user.role}</p>
        </div>
      </div>
      <div className="space-y-2">
        <div>
          <span className="text-gray-500">{t('auth.email')}: </span>
          <span>{user.email}</span>
        </div>
        {user.address && (
          <div>
            <span className="text-gray-500">{t('profile.address')}: </span>
            <span>{user.address}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;