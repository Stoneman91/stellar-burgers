import { FC, useEffect, useMemo } from 'react';
import { Preloader } from '../ui/preloader';
import { OrderInfoUI } from '../ui/order-info';
import { TIngredient, TOrder } from '@utils-types';
import { useDispatch, useSelector } from '../../services/store';
import { selectIngredients } from '../../slices/ingredientsSlice';
import { 
  getOrderByNumber,
  clearCurrentOrder,
  selectCurrentOrder,
  selectFeedLoading,
  selectFeedError
} from '../../slices/feed';
import { useParams } from 'react-router-dom';

type TIngredientsWithCount = {
  [key: string]: TIngredient & { count: number };
};

type TOrderInfo = TOrder & {
  ingredientsInfo: TIngredientsWithCount;
  date: Date;
  total: number;
};

export const OrderInfo: FC = () => {
  const dispatch = useDispatch();
  const { number } = useParams<{ number: string }>();
  
  const orderData = useSelector(selectCurrentOrder);
  const ingredients = useSelector(selectIngredients);
  const isLoading = useSelector(selectFeedLoading);
  const error = useSelector(selectFeedError);
  
  useEffect(() => {
    if (number) {
      dispatch(getOrderByNumber(Number(number)));
    }
    
    return () => {
      dispatch(clearCurrentOrder());
    };
  }, [dispatch, number]);


  const orderInfo = useMemo<TOrderInfo | null>(() => {
    if (!orderData || !ingredients.length) return null;

    const date = new Date(orderData.createdAt);

    const ingredientsInfo = orderData.ingredients.reduce<TIngredientsWithCount>(
      (acc, item) => {
        if (!item) return acc;
        
        const ingredient = ingredients.find((ing) => ing._id === item);
        if (ingredient) {
          if (!acc[item]) {
            acc[item] = {
              ...ingredient,
              count: 1
            };
          } else {
            acc[item].count++;
          }
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

  if (isLoading) {
    return <Preloader />;
  }

  if (error) {
    return (
      <div className="text text_type_main-medium text_color_inactive p-10 text-center">
        Ошибка: {error}
      </div>
    );
  }

  if (!orderInfo && !isLoading) {
    return (
      <div className="text text_type_main-medium text_color_inactive p-10 text-center">
        Заказ не найден
      </div>
    );
  }

  return orderInfo ? <OrderInfoUI orderInfo={orderInfo} /> : null;
};