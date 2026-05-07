import { ProfileUI } from '@ui-pages';
import { ChangeEvent, FC, SyntheticEvent, useEffect, useState } from 'react';
import { useDispatch, useSelector } from '../../services/store';
import {
  selectUpdateUserError,
  selectUser,
  updateUser
} from '../../services/slices/authSlice';

export const Profile: FC = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const updateUserError = useSelector(selectUpdateUserError);

  const [formValue, setFormValue] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: ''
  });

  useEffect(() => {
    setFormValue((prevState) => ({
      ...prevState,
      name: user?.name || '',
      email: user?.email || ''
    }));
  }, [user]);

  const isFormChanged =
    formValue.name !== user?.name ||
    formValue.email !== user?.email ||
    Boolean(formValue.password);

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();

    const userData = {
      name: formValue.name,
      email: formValue.email,
      ...(formValue.password ? { password: formValue.password } : {})
    };

    dispatch(updateUser(userData))
      .unwrap()
      .then(() => {
        setFormValue((prevState) => ({
          ...prevState,
          password: ''
        }));
      })
      .catch(() => {});
  };

  const handleCancel = (e: SyntheticEvent) => {
    e.preventDefault();
    setFormValue({
      name: user?.name || '',
      email: user?.email || '',
      password: ''
    });
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormValue((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <ProfileUI
      formValue={formValue}
      isFormChanged={isFormChanged}
      updateUserError={updateUserError || ''}
      handleCancel={handleCancel}
      handleSubmit={handleSubmit}
      handleInputChange={handleInputChange}
    />
  );
};
