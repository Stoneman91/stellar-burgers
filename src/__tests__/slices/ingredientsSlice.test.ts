// tests/ingredientsSlice.test.ts
import reducer, {
  initialState,
  getIngredients,
  clearIngredients
} from '../../slices/ingredientsSlice';
import { mockIngredients } from '../mockData';

describe('Ingredients Slice', () => {
  test('Должен возвращать начальное состояние', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  describe('Асинхронные операции getIngredients', () => {
    describe('При вызове экшена Request', () => {
      test('isLoading меняется на true', () => {
        const action = { type: getIngredients.pending.type };
        const state = reducer(initialState, action);
        
        expect(state.isLoading).toBe(true);
      });

      test('error очищается', () => {
        const stateWithError = { ...initialState, error: 'Предыдущая ошибка' };
        const action = { type: getIngredients.pending.type };
        const state = reducer(stateWithError, action);
        
        expect(state.isLoading).toBe(true);
        expect(state.error).toBe(null);
      });
    });

    describe('При вызове экшена Success', () => {
      test('данные записываются в стор', () => {
        const action = {
          type: getIngredients.fulfilled.type,
          payload: mockIngredients
        };
        const state = reducer(initialState, action);
        
        expect(state.ingredients).toEqual(mockIngredients);
        expect(state.ingredients).toHaveLength(3);
      });

      test('isLoading меняется на false', () => {
        const loadingState = { ...initialState, isLoading: true };
        const action = {
          type: getIngredients.fulfilled.type,
          payload: mockIngredients
        };
        const state = reducer(loadingState, action);
        
        expect(state.isLoading).toBe(false);
      });

      test('данные фильтруются по типам', () => {
        const action = {
          type: getIngredients.fulfilled.type,
          payload: mockIngredients
        };
        const state = reducer(initialState, action);
        
        expect(state.buns).toHaveLength(1);
        expect(state.buns[0].type).toBe('bun');
        expect(state.buns[0].name).toBe('Краторная булка N-200i');
        
        expect(state.mains).toHaveLength(1);
        expect(state.mains[0].type).toBe('main');
        expect(state.mains[0].name).toBe('Биокотлета из марсианской Магнолии');
        
        expect(state.sauces).toHaveLength(1);
        expect(state.sauces[0].type).toBe('sauce');
        expect(state.sauces[0].name).toBe('Соус Spicy-X');
      });
    });

    describe('При вызове экшена Failed', () => {
      test('ошибка записывается в стор', () => {
        const errorMessage = 'Сервер недоступен';
        const action = {
          type: getIngredients.rejected.type,
          payload: errorMessage
        };
        const state = reducer(initialState, action);
        
        expect(state.error).toBe(errorMessage);
      });

      test('isLoading меняется на false', () => {
        const loadingState = { ...initialState, isLoading: true };
        const action = {
          type: getIngredients.rejected.type,
          payload: 'Ошибка'
        };
        const state = reducer(loadingState, action);
        
        expect(state.isLoading).toBe(false);
      });

      test('остальные данные не изменяются', () => {
        const stateWithData = {
          ...initialState,
          ingredients: mockIngredients.slice(0, 1),
          buns: mockIngredients.slice(0, 1),
          isLoading: true
        };
        
        const action = {
          type: getIngredients.rejected.type,
          payload: 'Новая ошибка'
        };
        const state = reducer(stateWithData, action);
        
        expect(state.isLoading).toBe(false);
        expect(state.error).toBe('Новая ошибка');
        expect(state.ingredients).toHaveLength(1);
        expect(state.buns).toHaveLength(1);
      });
    });

    describe('Полные циклы', () => {
      test('Request -> Success цикл', () => {
        let state = reducer(initialState, { type: getIngredients.pending.type });
        expect(state.isLoading).toBe(true);
        
        state = reducer(state, {
          type: getIngredients.fulfilled.type,
          payload: mockIngredients
        });
        
        expect(state.isLoading).toBe(false);
        expect(state.ingredients).toHaveLength(3);
        expect(state.error).toBe(null);
      });

      test('Request -> Failed цикл', () => {
        let state = reducer(initialState, { type: getIngredients.pending.type });
        expect(state.isLoading).toBe(true);
        
        state = reducer(state, {
          type: getIngredients.rejected.type,
          payload: 'Таймаут запроса'
        });
        
        expect(state.isLoading).toBe(false);
        expect(state.error).toBe('Таймаут запроса');
        expect(state.ingredients).toHaveLength(0);
      });

      test('Request -> Success -> Request -> Failed цикл', () => {
        let state = reducer(initialState, { type: getIngredients.pending.type });
        expect(state.isLoading).toBe(true);
        
        state = reducer(state, {
          type: getIngredients.fulfilled.type,
          payload: mockIngredients.slice(0, 2)
        });
        
        expect(state.isLoading).toBe(false);
        expect(state.ingredients).toHaveLength(2);
        
        // Вторая попытка
        state = reducer(state, { type: getIngredients.pending.type });
        expect(state.isLoading).toBe(true);
        
        state = reducer(state, {
          type: getIngredients.rejected.type,
          payload: 'Вторая ошибка'
        });
        
        expect(state.isLoading).toBe(false);
        expect(state.error).toBe('Вторая ошибка');
        expect(state.ingredients).toHaveLength(2);
      });
    });
  });

  describe('Синхронные экшены', () => {
    test('clearIngredients: полностью очищает состояние', () => {
      const stateWithData = {
        ...initialState,
        ingredients: mockIngredients,
        buns: mockIngredients.filter(i => i.type === 'bun'),
        mains: mockIngredients.filter(i => i.type === 'main'),
        sauces: mockIngredients.filter(i => i.type === 'sauce'),
        error: 'Какая-то ошибка',
        isLoading: false
      };
      
      const state = reducer(stateWithData, clearIngredients());
      
      expect(state.ingredients).toHaveLength(0);
      expect(state.buns).toHaveLength(0);
      expect(state.mains).toHaveLength(0);
      expect(state.sauces).toHaveLength(0);
      expect(state.error).toBe(null);
      expect(state.isLoading).toBe(false);
    });

    test('clearIngredients на пустом состоянии', () => {
      const state = reducer(initialState, clearIngredients());
      
      expect(state).toEqual(initialState);
    });
  });

  describe('Граничные случаи и типизация', () => {
    test('Обработка пустого массива ингредиентов', () => {
      const action = {
        type: getIngredients.fulfilled.type,
        payload: []
      };
      const state = reducer(initialState, action);
      
      expect(state.ingredients).toHaveLength(0);
      expect(state.buns).toHaveLength(0);
      expect(state.mains).toHaveLength(0);
      expect(state.sauces).toHaveLength(0);
    });

    test('Обработка ингредиентов без определенного типа', () => {
      const customIngredients = [
        {
          _id: '1',
          name: 'Тест',
          type: 'unknown' as any,
          proteins: 10,
          fat: 10,
          carbohydrates: 10,
          calories: 100,
          price: 100,
          image: '',
          image_mobile: '',
          image_large: '',
          __v: 0
        }
      ];
      
      const action = {
        type: getIngredients.fulfilled.type,
        payload: customIngredients
      };
      const state = reducer(initialState, action);
      
      expect(state.ingredients).toHaveLength(1);
      expect(state.buns).toHaveLength(0);
      expect(state.mains).toHaveLength(0);
      expect(state.sauces).toHaveLength(0);
    });

    test('Обработка строковой ошибки из payload', () => {
      const customError = 'Ошибка сети 500';
      const action = {
        type: getIngredients.rejected.type,
        payload: customError
      };
      const state = reducer(initialState, action);
      
      expect(state.error).toBe(customError);
      expect(state.isLoading).toBe(false);
    });

    test('Обработка отсутствия ошибки (undefined payload)', () => {
      const action = {
        type: getIngredients.rejected.type,
        payload: undefined
      };
      const state = reducer(initialState, action);
      
      expect(state.error).toBe('Ошибка загрузки ингредиентов');
      expect(state.isLoading).toBe(false);
    });

    test('Данные сохраняют структуру TIngredient', () => {
      const action = {
        type: getIngredients.fulfilled.type,
        payload: mockIngredients
      };
      const state = reducer(initialState, action);
      
      const ingredient = state.ingredients[0];
      expect(ingredient).toHaveProperty('_id');
      expect(ingredient).toHaveProperty('name');
      expect(ingredient).toHaveProperty('type');
      expect(ingredient).toHaveProperty('proteins');
      expect(ingredient).toHaveProperty('fat');
      expect(ingredient).toHaveProperty('carbohydrates');
      expect(ingredient).toHaveProperty('calories');
      expect(ingredient).toHaveProperty('price');
      expect(ingredient).toHaveProperty('image');
      expect(ingredient).toHaveProperty('image_mobile');
      expect(ingredient).toHaveProperty('image_large');
      expect(ingredient).toHaveProperty('__v');
    });
  });
});