import { Preloader } from '@ui';
import { FeedUI } from '@ui-pages';
import { FC, useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from '../../services/store';
import {
  fetchFeeds,
  selectFeedOrders,
  selectOrdersError,
  selectOrdersIsFeedLoading
} from '../../services/slices/ordersSlice';

export const Feed: FC = () => {
  const dispatch = useDispatch();
  const orders = useSelector(selectFeedOrders);
  const isLoading = useSelector(selectOrdersIsFeedLoading);
  const error = useSelector(selectOrdersError);

  const handleGetFeeds = useCallback(() => {
    dispatch(fetchFeeds());
  }, [dispatch]);

  useEffect(() => {
    handleGetFeeds();
  }, [handleGetFeeds]);

  if (isLoading && !orders.length) {
    return <Preloader />;
  }

  if (error) {
    return <div className='text text_type_main-medium pt-4'>{error}</div>;
  }

  return <FeedUI orders={orders} handleGetFeeds={handleGetFeeds} />;
};
