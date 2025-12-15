import { FC, useMemo } from 'react';
import { useSelector, useDispatch } from '../../services/store';
import {
  selectConstructor,
  selectBun,
  selectIngredients,
  selectTotalPrice
} from '../../slices/burgerConstructor';
import {
  createOrder,
  selectOrderRequest,
  selectOrderModalData,
  clearOrder
} from '../../slices/ordersSlice';
import { BurgerConstructorUI } from '@ui';

export const BurgerConstructor: FC = () => {
  const dispatch = useDispatch();

  const constructorItems = useSelector(selectConstructor);
  const bun = useSelector(selectBun);
  const ingredients = useSelector(selectIngredients);
  const totalPrice = useSelector(selectTotalPrice);

  const orderRequest = useSelector(selectOrderRequest);
  const orderModalData = useSelector(selectOrderModalData);

  const onOrderClick = () => {
    if (!bun || orderRequest) return;

    const ingredientIds = [bun._id, ...ingredients.map((i) => i._id), bun._id];
    dispatch(createOrder(ingredientIds));
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
