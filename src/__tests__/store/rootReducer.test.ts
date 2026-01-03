// tests/rootReducer.test.ts
import { combineReducers } from '@reduxjs/toolkit';

import ingredientsReducer, { initialState as ingredientsInitialState } from '../../slices/ingredientsSlice';
import feedReducer, { initialState as feedInitialState } from '../../slices/feed';
import ordersReducer, { initialState as ordersInitialState } from '../../slices/ordersSlice';
import burgerConstructorReducer, { initialState as burgerConstructorInitialState } from '../../slices/burgerConstructor';
import userReducer, { initialState as userInitialState } from '../../slices/userSlice';
import { mockIngredients, mockUser } from '../mockData';

const rootReducer = combineReducers({
  ingredients: ingredientsReducer,
  feed: feedReducer,
  orders: ordersReducer,
  burgerConstructor: burgerConstructorReducer,
  user: userReducer
});

describe('Root Reducer', () => {
  test('Проверяет правильную инициализацию rootReducer', () => {
    const initialState = rootReducer(undefined, { type: '@@INIT' });
    
    expect(initialState).toEqual({
      ingredients: ingredientsInitialState,
      feed: feedInitialState,
      orders: ordersInitialState,
      burgerConstructor: burgerConstructorInitialState,
      user: userInitialState
    });
  });

  test('Должен содержать все необходимые слайсы', () => {
    const state = rootReducer(undefined, { type: '@@INIT' });
    
    expect(state).toHaveProperty('ingredients');
    expect(state).toHaveProperty('feed');
    expect(state).toHaveProperty('orders');
    expect(state).toHaveProperty('burgerConstructor');
    expect(state).toHaveProperty('user');
  });

  test('Изменение одного слайса не влияет на другие', () => {
    const ingredientsAction = {
      type: 'ingredients/getIngredients/fulfilled',
      payload: mockIngredients
    };
    
    const state = rootReducer(undefined, ingredientsAction);
    
    // Проверяем что ingredients изменился
    expect(state.ingredients.ingredients).toHaveLength(3);
    expect(state.ingredients.buns).toHaveLength(1);
    
    // Проверяем что другие слайсы остались в начальном состоянии
    expect(state.burgerConstructor).toEqual(burgerConstructorInitialState);
    expect(state.feed).toEqual(feedInitialState);
    expect(state.orders).toEqual(ordersInitialState);
    expect(state.user).toEqual(userInitialState);
  });

  test('Должен корректно обрабатывать действия из разных слайсов', () => {
    const initialState = rootReducer(undefined, { type: '@@INIT' });
    
    // Действие из ingredientsSlice
    const ingredientsAction = {
      type: 'ingredients/getIngredients/fulfilled',
      payload: mockIngredients
    };
    
    // Действие из burgerConstructorSlice
    const burgerAction = {
      type: 'burgerConstructor/addBun',
      payload: mockIngredients[0]
    };
    
    // Применяем последовательно
    let state = rootReducer(initialState, ingredientsAction);
    state = rootReducer(state, burgerAction);
    
    // Проверяем, что оба слайса обновились
    expect(state.ingredients.ingredients).toHaveLength(3);
    expect(state.burgerConstructor.bun).toEqual(mockIngredients[0]);
  });

  test('Должен сохранять неизменность других слайсов при обновлении одного', () => {
    const initialState = rootReducer(undefined, { type: '@@INIT' });
    
    // Создаем состояние с данными во всех слайсах
    const filledState = {
      ...initialState,
      ingredients: {
        ...initialState.ingredients,
        ingredients: mockIngredients,
        buns: mockIngredients.filter(i => i.type === 'bun'),
        mains: mockIngredients.filter(i => i.type === 'main'),
        sauces: mockIngredients.filter(i => i.type === 'sauce')
      },
      user: {
        ...initialState.user,
        user: mockUser,
        isAuthChecked: true
      }
    };
    
    // Меняем только burgerConstructor
    const burgerAction = {
      type: 'burgerConstructor/addIngredient',
      payload: { ...mockIngredients[1], uuid: 'test-uuid', id: 'test-uuid' }
    };
    
    const newState = rootReducer(filledState, burgerAction);
    
    // BurgerConstructor изменился
    expect(newState.burgerConstructor.ingredients).toHaveLength(1);
    
    // Остальные слайсы остались неизменными
    expect(newState.ingredients).toEqual(filledState.ingredients);
    expect(newState.user).toEqual(filledState.user);
    expect(newState.feed).toEqual(filledState.feed);
    expect(newState.orders).toEqual(filledState.orders);
  });
});