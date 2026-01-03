// tests/feedSlice.test.ts
import reducer, {
  initialState,
  getFeeds,
  getOrderByNumber,
  clearCurrentOrder,
  setOrders
} from '../../slices/feed';
import { mockFeedResponse, mockOrder } from '../mockData';

describe('Feed Slice', () => {
  test('Должен возвращать начальное состояние', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  describe('Асинхронные операции getFeeds', () => {
    describe('При вызове экшена Pending', () => {
      test('isLoading меняется на true', () => {
        const action = { type: getFeeds.pending.type };
        const state = reducer(initialState, action);
        
        expect(state.isLoading).toBe(true);
      });

      test('error очищается', () => {
        const stateWithError = { ...initialState, error: 'Предыдущая ошибка' };
        const action = { type: getFeeds.pending.type };
        const state = reducer(stateWithError, action);
        
        expect(state.isLoading).toBe(true);
        expect(state.error).toBe(null);
      });
    });

    describe('При вызове экшена Fulfilled', () => {
      test('данные записываются в стор', () => {
        const action = {
          type: getFeeds.fulfilled.type,
          payload: mockFeedResponse
        };
        const state = reducer(initialState, action);
        
        expect(state.orders).toEqual(mockFeedResponse.orders);
        expect(state.total).toBe(mockFeedResponse.total);
        expect(state.totalToday).toBe(mockFeedResponse.totalToday);
      });

      test('isLoading меняется на false', () => {
        const loadingState = { ...initialState, isLoading: true };
        const action = {
          type: getFeeds.fulfilled.type,
          payload: mockFeedResponse
        };
        const state = reducer(loadingState, action);
        
        expect(state.isLoading).toBe(false);
      });
    });

    describe('При вызове экшена Rejected', () => {
      test('ошибка записывается в стор', () => {
        const errorMessage = 'Ошибка соединения с сервером';
        const action = {
          type: getFeeds.rejected.type,
          payload: errorMessage
        };
        const state = reducer(initialState, action);
        
        expect(state.error).toBe(errorMessage);
      });

      test('isLoading меняется на false', () => {
        const loadingState = { ...initialState, isLoading: true };
        const action = {
          type: getFeeds.rejected.type,
          payload: 'Ошибка'
        };
        const state = reducer(loadingState, action);
        
        expect(state.isLoading).toBe(false);
      });
    });

    describe('Полные циклы', () => {
      test('Request -> Success цикл', () => {
        let state = reducer(initialState, { type: getFeeds.pending.type });
        expect(state.isLoading).toBe(true);
        
        state = reducer(state, {
          type: getFeeds.fulfilled.type,
          payload: mockFeedResponse
        });
        
        expect(state.isLoading).toBe(false);
        expect(state.orders).toHaveLength(1);
        expect(state.total).toBe(100);
        expect(state.totalToday).toBe(10);
      });

      test('Request -> Failed цикл', () => {
        let state = reducer(initialState, { type: getFeeds.pending.type });
        expect(state.isLoading).toBe(true);
        
        state = reducer(state, {
          type: getFeeds.rejected.type,
          payload: 'Таймаут'
        });
        
        expect(state.isLoading).toBe(false);
        expect(state.error).toBe('Таймаут');
        expect(state.orders).toHaveLength(0);
      });
    });
  });

  describe('Асинхронные операции getOrderByNumber', () => {
    describe('При вызове экшена Pending', () => {
      test('isLoading меняется на true', () => {
        const action = { type: getOrderByNumber.pending.type };
        const state = reducer(initialState, action);
        
        expect(state.isLoading).toBe(true);
        expect(state.error).toBe(null);
      });
    });

    describe('При вызове экшена Fulfilled', () => {
      test('currentOrder устанавливается', () => {
        const action = {
          type: getOrderByNumber.fulfilled.type,
          payload: mockOrder
        };
        const state = reducer(initialState, action);
        
        expect(state.isLoading).toBe(false);
        expect(state.currentOrder).toEqual(mockOrder);
        expect(state.currentOrder?.number).toBe(34567);
      });

      test('isLoading меняется на false', () => {
        const loadingState = { ...initialState, isLoading: true };
        const action = {
          type: getOrderByNumber.fulfilled.type,
          payload: mockOrder
        };
        const state = reducer(loadingState, action);
        
        expect(state.isLoading).toBe(false);
      });
    });

    describe('При вызове экшена Rejected', () => {
      test('ошибка записывается в стор', () => {
        const errorMessage = 'Заказ не найден';
        const action = {
          type: getOrderByNumber.rejected.type,
          payload: errorMessage
        };
        const state = reducer(initialState, action);
        
        expect(state.isLoading).toBe(false);
        expect(state.error).toBe(errorMessage);
        expect(state.currentOrder).toBe(null);
      });
    });

    describe('Полные циклы', () => {
      test('Request -> Success цикл', () => {
        let state = reducer(initialState, { type: getOrderByNumber.pending.type });
        expect(state.isLoading).toBe(true);
        
        state = reducer(state, {
          type: getOrderByNumber.fulfilled.type,
          payload: mockOrder
        });
        
        expect(state.isLoading).toBe(false);
        expect(state.currentOrder?.number).toBe(34567);
      });

      test('Request -> Failed цикл', () => {
        let state = reducer(initialState, { type: getOrderByNumber.pending.type });
        expect(state.isLoading).toBe(true);
        
        state = reducer(state, {
          type: getOrderByNumber.rejected.type,
          payload: 'Заказ не найден'
        });
        
        expect(state.isLoading).toBe(false);
        expect(state.error).toBe('Заказ не найден');
      });
    });
  });

  describe('Синхронные экшены', () => {
    test('clearCurrentOrder: очищает текущий заказ', () => {
      const stateWithOrder = {
        ...initialState,
        currentOrder: mockOrder
      };
      
      const state = reducer(stateWithOrder, clearCurrentOrder());
      
      expect(state.currentOrder).toBe(null);
      expect(state.orders).toHaveLength(0);
      expect(state.isLoading).toBe(false);
    });

    test('setOrders: устанавливает массив заказов', () => {
      const orders = [
        mockOrder,
        { ...mockOrder, _id: 'order-2', number: 54321, name: 'Другой бургер' }
      ];
      
      const action = setOrders(orders);
      const state = reducer(initialState, action);
      
      expect(state.orders).toEqual(orders);
      expect(state.orders).toHaveLength(2);
    });

    test('setOrders с пустым массивом', () => {
      const action = setOrders([]);
      const state = reducer(initialState, action);
      
      expect(state.orders).toHaveLength(0);
    });
  });

  describe('Взаимодействие между экшенами', () => {
    test('Не перезаписывает ленту заказов при получении одного заказа', () => {
      let state = reducer(initialState, {
        type: getFeeds.fulfilled.type,
        payload: mockFeedResponse
      });
      
      state = reducer(state, {
        type: getOrderByNumber.fulfilled.type,
        payload: mockOrder
      });
      
      expect(state.orders).toHaveLength(1);
      expect(state.orders[0].number).toBe(12345);
      expect(state.currentOrder?.number).toBe(34567);
    });

      test('Изолированность состояний isLoading для разных экшенов', () => {
    let state = reducer(initialState, { type: getFeeds.pending.type });
    expect(state.isLoading).toBe(true);
    
    state = reducer(state, { type: getOrderByNumber.pending.type });
    expect(state.isLoading).toBe(true);
    
    state = reducer(state, {
      type: getOrderByNumber.fulfilled.type,
      payload: mockOrder
    });
    // ИСПРАВЛЕНО: после выполнения экшена флаг должен стать false
    expect(state.isLoading).toBe(false);
    
    state = reducer(state, {
      type: getFeeds.fulfilled.type,
      payload: mockFeedResponse
    });
    expect(state.isLoading).toBe(false);
  });

    test('Ошибка в одном экшене не влияет на данные другого', () => {
      let state = reducer(initialState, {
        type: getFeeds.fulfilled.type,
        payload: mockFeedResponse
      });
      
      state = reducer(state, {
        type: getOrderByNumber.rejected.type,
        payload: 'Ошибка загрузки заказа'
      });
      
      expect(state.orders).toHaveLength(1);
      expect(state.error).toBe('Ошибка загрузки заказа');
      expect(state.currentOrder).toBe(null);
    });
  });
});