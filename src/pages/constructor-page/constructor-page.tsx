import { FC } from 'react';
import clsx from 'clsx';
import { useSelector } from '../../services/store';
import {
  selectIngredients,
  selectIngredientsError,
  selectIngredientsIsLoading
} from '../../services/slices/ingredientsSlice';

import styles from './constructor-page.module.css';

import { BurgerIngredients, BurgerConstructor } from '../../components';
import { Preloader } from '../../components/ui';

export const ConstructorPage: FC = () => {
  const ingredients = useSelector(selectIngredients);
  const isIngredientsLoading = useSelector(selectIngredientsIsLoading);
  const error = useSelector(selectIngredientsError);

  if (isIngredientsLoading) {
    return <Preloader />;
  }

  if (error) {
    return <div className='text text_type_main-medium pt-4'>{error}</div>;
  }

  if (!ingredients.length) {
    return (
      <div className='text text_type_main-medium pt-4'>Нет ингредиентов</div>
    );
  }

  return (
    <main className={styles.containerMain}>
      <h1
        className={clsx(
          styles.title,
          'text text_type_main-large mt-10 mb-5 pl-5'
        )}
      >
        Соберите бургер
      </h1>
      <div className={clsx(styles.main, 'pl-5 pr-5')}>
        <BurgerIngredients />
        <BurgerConstructor />
      </div>
    </main>
  );
};
