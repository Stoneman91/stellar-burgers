// tests/ordersSlice.test.ts
import reducer, {
  initialState,
  getOrders,
  createOrder,
  setCurrentOrder,
  setOrderModalData,
  clearOrder
} from '../../slices/ordersSlice';
import { mockOrder } from '../mockData';

describe('Orders Slice', () => {
  test('Должен возвращать начальное состояние', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  describe('Асинхронные операции getOrders', () => {
    describe('При вызове экшена Pending', () => {
      test('isLoading меняется на true', () => {
        const action = { type: getOrders.pending.type };
        const state = reducer(initialState, action);
        
        expect(state.isLoading).toBe(true);
        expect(state.error).toBe(null);
      });
    });

    describe('При вызове экшена Fulfilled', () => {
      test('данные записываются в стор', () => {
        const orders = [mockOrder, { ...mockOrder, _id: 'order-2', number: 54321 }];
        const action = {
          type: getOrders.fulfilled.type,
          payload: orders
        };
        const state = reducer(initialState, action);
        
        expect(state.isLoading).toBe(false);
        expect(state.orders).toEqual(orders);
        expect(state.orders).toHaveLength(2);
      });

      test('isLoading меняется на false', () => {
        const loadingState = { ...initialState, isLoading: true };
        const action = {
          type: getOrders.fulfilled.type,
          payload: [mockOrder]
        };
        const state = reducer(loadingState, action);
        
        expect(state.isLoading).toBe(false);
      });
    });

    describe('При вызове экшена Rejected', () => {
      test('ошибка записывается в стор', () => {
        const errorMessage = 'Ошибка загрузки истории заказов';
        const action = {
          type: getOrders.rejected.type,
          payload: errorMessage
        };
        const state = reducer(initialState, action);
        
        expect(state.isLoading).toBe(false);
        expect(state.error).toBe(errorMessage);
      });

      test('isLoading меняется на false', () => {
        const loadingState = { ...initialState, isLoading: true };
        const action = {
          type: getOrders.rejected.type,
          payload: 'Ошибка'
        };
        const state = reducer(loadingState, action);
        
        expect(state.isLoading).toBe(false);
      });
    });

    describe('Полные циклы', () => {
      test('Request -> Success цикл', () => {
        let state = reducer(initialState, { type: getOrders.pending.type });
        expect(state.isLoading).toBe(true);
        
        const orders = [mockOrder];
        state = reducer(state, {
          type: getOrders.fulfilled.type,
          payload: orders
        });
        
        expect(state.isLoading).toBe(false);
        expect(state.orders).toHaveLength(1);
      });

      test('Request -> Failed цикл', () => {
        let state = reducer(initialState, { type: getOrders.pending.type });
        expect(state.isLoading).toBe(true);
        
        state = reducer(state, {
          type: getOrders.rejected.type,
          payload: 'Network Error'
        });
        
        expect(state.isLoading).toBe(false);
        expect(state.error).toBe('Network Error');
      });
    });
  });

  describe('Асинхронные операции createOrder', () => {
    describe('При вызове экшена Pending', () => {
      test('orderRequest меняется на true', () => {
        const action = { type: createOrder.pending.type };
        const state = reducer(initialState, action);
        
        expect(state.orderRequest).toBe(true);
        expect(state.error).toBe(null);
      });
    });

    describe('При вызове экшена Fulfilled', () => {
      test('данные записываются в стор', () => {
        const action = {
          type: createOrder.fulfilled.type,
          payload: mockOrder
        };
        const state = reducer(initialState, action);
        
        expect(state.orderRequest).toBe(false);
        expect(state.currentOrder).toEqual(mockOrder);
        expect(state.orderModalData).toEqual(mockOrder);
        expect(state.orders).toHaveLength(1);
        expect(state.orders[0]).toEqual(mockOrder);
      });

      test('orderRequest меняется на false', () => {
        const requestingState = { ...initialState, orderRequest: true };
        const action = {
          type: createOrder.fulfilled.type,
          payload: mockOrder
        };
        const state = reducer(requestingState, action);
        
        expect(state.orderRequest).toBe(false);
      });

      test('заказ добавляется в начало списка', () => {
        const existingOrder = { ...mockOrder, _id: 'existing', number: 11111 };
        const newOrder = { ...mockOrder, _id: 'new', number: 22222 };
        
        let state = reducer(initialState, {
          type: getOrders.fulfilled.type,
          payload: [existingOrder]
        });
        
        expect(state.orders).toHaveLength(1);
        
        state = reducer(state, {
          type: createOrder.fulfilled.type,
          payload: newOrder
        });
        
        expect(state.orders).toHaveLength(2);
        expect(state.orders[0]).toEqual(newOrder);
        expect(state.orders[1]).toEqual(existingOrder);
      });
    });

    describe('При вызове экшена Rejected', () => {
      test('ошибка записывается в стор', () => {
        const errorMessage = 'Ошибка создания заказа';
        const action = {
          type: createOrder.rejected.type,
          payload: errorMessage
        };
        const state = reducer(initialState, action);
        
        expect(state.orderRequest).toBe(false);
        expect(state.error).toBe(errorMessage);
        expect(state.currentOrder).toBe(null);
        expect(state.orderModalData).toBe(null);
      });

      test('orderRequest меняется на false', () => {
        const requestingState = { ...initialState, orderRequest: true };
        const action = {
          type: createOrder.rejected.type,
          payload: 'Ошибка'
        };
        const state = reducer(requestingState, action);
        
        expect(state.orderRequest).toBe(false);
      });
    });

    describe('Полные циклы', () => {
      test('Request -> Success цикл', () => {
        let state = reducer(initialState, { type: createOrder.pending.type });
        expect(state.orderRequest).toBe(true);
        
        state = reducer(state, {
          type: createOrder.fulfilled.type,
          payload: mockOrder
        });
        
        expect(state.orderRequest).toBe(false);
        expect(state.currentOrder).toEqual(mockOrder);
        expect(state.orders).toHaveLength(1);
      });

      test('Request -> Failed цикл', () => {
        let state = reducer(initialState, { type: createOrder.pending.type });
        expect(state.orderRequest).toBe(true);
        
        state = reducer(state, {
          type: createOrder.rejected.type,
          payload: 'Ошибка валидации'
        });
        
        expect(state.orderRequest).toBe(false);
        expect(state.error).toBe('Ошибка валидации');
      });
    });
  });

  describe('Синхронные экшены', () => {
    test('setCurrentOrder: устанавливает текущий заказ', () => {
      const action = setCurrentOrder(mockOrder);
      const state = reducer(initialState, action);
      
      expect(state.currentOrder).toEqual(mockOrder);
      expect(state.orders).toHaveLength(0);
      expect(state.orderRequest).toBe(false);
    });

    test('setCurrentOrder(null): очищает текущий заказ', () => {
      const stateWithOrder = {
        ...initialState,
        currentOrder: mockOrder
      };
      
      const action = setCurrentOrder(null);
      const state = reducer(stateWithOrder, action);
      
      expect(state.currentOrder).toBe(null);
    });

    test('setOrderModalData: устанавливает данные для модального окна', () => {
      const action = setOrderModalData(mockOrder);
      const state = reducer(initialState, action);
      
      expect(state.orderModalData).toEqual(mockOrder);
      expect(state.currentOrder).toBe(null);
    });

    test('setOrderModalData(null): очищает данные модального окна', () => {
      const stateWithModal = {
        ...initialState,
        orderModalData: mockOrder
      };
      
      const action = setOrderModalData(null);
      const state = reducer(stateWithModal, action);
      
      expect(state.orderModalData).toBe(null);
    });

    test('clearOrder: очищает данные заказа', () => {
      const stateWithData = {
        ...initialState,
        currentOrder: mockOrder,
        orderModalData: mockOrder,
        orderRequest: true
      };
      
      const state = reducer(stateWithData, clearOrder());
      
      expect(state.currentOrder).toBe(null);
      expect(state.orderModalData).toBe(null);
      expect(state.orderRequest).toBe(false);
    });
  });
});