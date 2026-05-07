import { FC, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Preloader } from '../ui/preloader';
import { OrderInfoUI } from '../ui/order-info';
import { TIngredient } from '@utils-types';
import { useDispatch, useSelector } from '../../services/store';
import { selectIngredients } from '../../services/slices/ingredientsSlice';
import {
  fetchOrderByNumber,
  selectOrderByNumber,
  selectOrdersError,
  selectOrdersIsOrderLoading
} from '../../services/slices/ordersSlice';

export const OrderInfo: FC = () => {
  const dispatch = useDispatch();
  const { number } = useParams();
  const orderNumber = number ? Number(number) : undefined;
  const orderData = useSelector(selectOrderByNumber(orderNumber));
  const ingredients = useSelector(selectIngredients);
  const isLoading = useSelector(selectOrdersIsOrderLoading);
  const error = useSelector(selectOrdersError);

  useEffect(() => {
    if (orderNumber && !orderData) {
      dispatch(fetchOrderByNumber(orderNumber));
    }
  }, [dispatch, orderData, orderNumber]);

  const orderInfo = useMemo(() => {
    if (!orderData || !ingredients.length) return null;

    const date = new Date(orderData.createdAt);

    type TIngredientsWithCount = {
      [key: string]: TIngredient & { count: number };
    };

    const ingredientsInfo = orderData.ingredients.reduce(
      (acc: TIngredientsWithCount, item) => {
        if (!acc[item]) {
          const ingredient = ingredients.find((ing) => ing._id === item);
          if (ingredient) {
            acc[item] = {
              ...ingredient,
              count: 1
            };
          }
        } else {
          acc[item].count++;
        }

        return acc;
      },
      {}
    );

    const total = Object.values(ingredientsInfo).reduce(
      (acc, item) => acc + item.price * item.count,
      0
    );

    return {
      ...orderData,
      ingredientsInfo,
      date,
      total
    };
  }, [orderData, ingredients]);

  if (!orderNumber || Number.isNaN(orderNumber)) {
    return (
      <div className='text text_type_main-medium pt-4'>
        Некорректный номер заказа
      </div>
    );
  }

  if (error && !orderInfo) {
    return <div className='text text_type_main-medium pt-4'>{error}</div>;
  }

  if (isLoading || !orderInfo) {
    return <Preloader />;
  }

  return <OrderInfoUI orderInfo={orderInfo} />;
};
