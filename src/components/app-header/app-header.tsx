import { FC } from 'react';
import { useLocation } from 'react-router-dom';
import { AppHeaderUI } from '@ui';
import { useSelector } from '../../services/store';
import { selectUser } from '../../services/slices/authSlice';

export const AppHeader: FC = () => {
  const { pathname } = useLocation();
  const user = useSelector(selectUser);

  const isConstructorActive =
    pathname === '/' || pathname.startsWith('/ingredients');
  const isFeedActive = pathname.startsWith('/feed');
  const isProfileActive = pathname.startsWith('/profile');

  return (
    <AppHeaderUI
      userName={user?.name}
      isConstructorActive={isConstructorActive}
      isFeedActive={isFeedActive}
      isProfileActive={isProfileActive}
    />
  );
};
