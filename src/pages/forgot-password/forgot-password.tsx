import { FC, SyntheticEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ForgotPasswordUI } from '@ui-pages';
import { useDispatch, useSelector } from '../../services/store';
import {
  forgotPassword,
  selectPasswordResetError
} from '../../services/slices/authSlice';

export const ForgotPassword: FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const error = useSelector(selectPasswordResetError);

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();

    dispatch(forgotPassword({ email }))
      .unwrap()
      .then(() => {
        localStorage.setItem('resetPassword', 'true');
        navigate('/reset-password', { replace: true });
      })
      .catch(() => {});
  };

  return (
    <ForgotPasswordUI
      errorText={error || ''}
      email={email}
      setEmail={setEmail}
      handleSubmit={handleSubmit}
    />
  );
};
