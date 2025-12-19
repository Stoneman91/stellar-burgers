import { FC, useMemo } from 'react';
import { useSelector, useDispatch } from '../../services/store';
import {
  selectConstructor,
  selectBun,
  selectIngredients,
  selectTotalPrice,
  clearConstructor
} from '../../slices/burgerConstructor';
import {
  createOrder,
  selectOrderRequest,
  selectOrderModalData,
  clearOrder
} from '../../slices/ordersSlice';
import { BurgerConstructorUI } from '@ui';
import { selectIsAuthenticated } from '../../slices/userSlice';
import { useNavigate } from 'react-router-dom';
import { error } from 'console';

export const BurgerConstructor: FC = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const constructorItems = useSelector(selectConstructor);
  const bun = useSelector(selectBun);
  const ingredients = useSelector(selectIngredients);
  const totalPrice = useSelector(selectTotalPrice);

  const orderRequest = useSelector(selectOrderRequest);
  const orderModalData = useSelector(selectOrderModalData);

  const onOrderClick = () => {
    if (!bun || orderRequest) return;

    if (!isAuthenticated) {
      navigate('/login', {
        state: { from: location.pathname }
      });
      return;
    }

    const ingredientIds = [bun._id, ...ingredients.map((i) => i._id), bun._id];
    dispatch(createOrder(ingredientIds))
      .unwrap()
      .then(() => {
        dispatch(clearConstructor());
      })
      .catch((error) => {
        console.error('Ошибка создания заказа:', error);
      });
  };
  const closeOrderModal = () => {
    dispatch(clearOrder());
  };

  const price = totalPrice;
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
