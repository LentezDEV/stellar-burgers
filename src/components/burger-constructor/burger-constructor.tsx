import { FC, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TConstructorIngredient } from '@utils-types';
import { BurgerConstructorUI } from '@ui';
import { useSelector } from '../../services/store';
import { selectConstructorItems } from '../../services/slices/constructorSlice';
import { selectIsAuthenticated } from '../../services/slices/authSlice';

export const BurgerConstructor: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const constructorItems = useSelector(selectConstructorItems);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const orderRequest = false;
  const orderModalData = null;

  const onOrderClick = () => {
    if (!constructorItems.bun || orderRequest) return;

    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } });
    }
  };

  const closeOrderModal = () => {};

  const price = useMemo(
    () =>
      (constructorItems.bun ? constructorItems.bun.price * 2 : 0) +
      constructorItems.ingredients.reduce(
        (sum: number, ingredient: TConstructorIngredient) =>
          sum + ingredient.price,
        0
      ),
    [constructorItems]
  );

  return (
    <BurgerConstructorUI
      price={price}
      orderRequest={orderRequest}
      constructorItems={constructorItems}
      orderModalData={orderModalData}
      onOrderClick={onOrderClick}
      closeOrderModal={closeOrderModal}
    />
  );
};
