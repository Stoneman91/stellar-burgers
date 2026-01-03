import {
  TIngredient,
  TConstructorIngredient,
  TOrder,
  TOrdersData,
  TUser
} from '../../src/utils/types';

export const mockIngredients: TIngredient[] = [
  {
    _id: '643d69a5c3f7b9001cfa093c',
    name: 'Краторная булка N-200i',
    type: 'bun',
    proteins: 80,
    fat: 24,
    carbohydrates: 53,
    calories: 420,
    price: 1255,
    image: 'https://code.s3.yandex.net/react/code/bun-02.png',
    image_large: 'https://code.s3.yandex.net/react/code/bun-02-large.png',
    image_mobile: 'https://code.s3.yandex.net/react/code/bun-02-mobile.png'
  },
  {
    _id: '643d69a5c3f7b9001cfa0941',
    name: 'Биокотлета из марсианской Магнолии',
    type: 'main',
    proteins: 420,
    fat: 142,
    carbohydrates: 242,
    calories: 4242,
    price: 424,
    image: 'https://code.s3.yandex.net/react/code/meat-01.png',
    image_large: 'https://code.s3.yandex.net/react/code/meat-01-large.png',
    image_mobile: 'https://code.s3.yandex.net/react/code/meat-01-mobile.png'
  },
  {
    _id: '643d69a5c3f7b9001cfa0942',
    name: 'Соус Spicy-X',
    type: 'sauce',
    proteins: 30,
    fat: 20,
    carbohydrates: 40,
    calories: 30,
    price: 90,
    image: 'https://code.s3.yandex.net/react/code/sauce-02.png',
    image_large: 'https://code.s3.yandex.net/react/code/sauce-02-large.png',
    image_mobile: 'https://code.s3.yandex.net/react/code/sauce-02-mobile.png'
  }
];

export const mockConstructorIngredients: TConstructorIngredient[] = [
  {
    ...mockIngredients[0],
    id: 'uuid-643d69a5c3f7b9001cfa093c',
    uuid: 'uuid-643d69a5c3f7b9001cfa093c'
  },
  {
    ...mockIngredients[1],
    id: 'uuid-643d69a5c3f7b9001cfa0941',
    uuid: 'uuid-643d69a5c3f7b9001cfa0941'
  },
  {
    ...mockIngredients[2],
    id: 'uuid-643d69a5c3f7b9001cfa0942',
    uuid: 'uuid-643d69a5c3f7b9001cfa0942'
  }
];

export const mockUser: TUser = {
  email: 'test-user@example.com',
  name: 'Test User'
};

export const mockOrder: TOrder = {
  _id: '6487f8a85a4b3a001b8a7f5a',
  ingredients: [
    '643d69a5c3f7b9001cfa093c',
    '643d69a5c3f7b9001cfa0941',
    '643d69a5c3f7b9001cfa093c'
  ],
  status: 'done',
  name: 'Space бургер',
  createdAt: '2023-06-13T14:20:24.000Z',
  updatedAt: '2023-06-13T14:20:24.000Z',
  number: 34567
};

export const mockFeedResponse: TOrdersData = {
  orders: [
    {
      _id: 'order-1',
      ingredients: ['643d69a5c3f7b9001cfa093c', '643d69a5c3f7b9001cfa0941'],
      status: 'done',
      name: 'Space бургер',
      createdAt: '2024-01-01T12:00:00.000Z',
      updatedAt: '2024-01-01T12:00:00.000Z',
      number: 12345
    }
  ],
  total: 100,
  totalToday: 10
};
