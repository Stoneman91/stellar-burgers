// tests/burgerConstructorSlice.test.ts
import reducer, {
  initialState,
  addIngredient,
  removeIngredient,
  moveIngredient
} from '../../slices/burgerConstructor';
import { mockIngredients } from '../mockData';

describe('burgerConstructorSlice reducer', () => {
  const mockMainIngredient = {
    ...mockIngredients[1],
    id: 'test-id-1',
    uuid: 'test-uuid-1'
  };

  const mockSecondIngredient = {
    ...mockIngredients[2],
    id: 'test-id-2',
    uuid: 'test-uuid-2'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Правильная инициализация', () => {
    const result = reducer(undefined, { type: '' });
    expect(result).toEqual(initialState);
  });

  describe('Обработка экшена добавления ингредиента', () => {
    test('добавляет ингредиент в конструктор', () => {
      // Создаем ингредиент без id и uuid, они будут добавлены в редьюсере
      const ingredientWithoutIds = { ...mockIngredients[1] };
      
      const action = addIngredient(ingredientWithoutIds);
      const result = reducer(initialState, action);

      expect(result.ingredients).toHaveLength(1);
      expect(result.ingredients[0]._id).toBe(mockIngredients[1]._id);
      expect(result.ingredients[0].name).toBe(mockIngredients[1].name);
      expect(result.ingredients[0].type).toBe('main');
      expect(result.ingredients[0].uuid).toBeDefined();
      expect(result.ingredients[0].id).toBeDefined();
    });

    test('добавляет несколько ингредиентов', () => {
      let state = initialState;

      const firstIngredient = { ...mockIngredients[1] };
      const secondIngredient = { ...mockIngredients[2] };

      state = reducer(state, addIngredient(firstIngredient));
      state = reducer(state, addIngredient(secondIngredient));

      expect(state.ingredients).toHaveLength(2);
      expect(state.ingredients[0]._id).toBe(mockIngredients[1]._id);
      expect(state.ingredients[1]._id).toBe(mockIngredients[2]._id);
    });
  });

  describe('Обработка экшена удаления ингредиента', () => {
    test('удаляет ингредиент по идентификатору', () => {
      const stateWithIngredients = {
        ...initialState,
        ingredients: [
          { 
            ...mockMainIngredient,
            uuid: 'uuid-1',
            id: 'uuid-1'
          },
          { 
            ...mockSecondIngredient,
            uuid: 'uuid-2',
            id: 'uuid-2'
          }
        ]
      };

      const action = removeIngredient('uuid-1');
      const result = reducer(stateWithIngredients, action);

      expect(result.ingredients).toHaveLength(1);
      expect(result.ingredients[0]._id).toBe(mockIngredients[2]._id);
    });

    test('не удаляет ингредиенты при неверном uuid', () => {
      const stateWithIngredients = {
        ...initialState,
        ingredients: [
          { 
            ...mockMainIngredient,
            uuid: 'uuid-1',
            id: 'uuid-1'
          },
          { 
            ...mockSecondIngredient,
            uuid: 'uuid-2',
            id: 'uuid-2'
          }
        ]
      };

      const action = removeIngredient('non-existent-uuid');
      const result = reducer(stateWithIngredients, action);

      expect(result.ingredients).toHaveLength(2);
    });
  });

  describe('Обработка экшена изменения порядка ингредиентов в начинке', () => {
    const mockThirdIngredient = {
      ...mockIngredients[0],
      _id: 'third-ingredient',
      name: 'Третий ингредиент',
      type: 'main',
      id: 'uuid-3',
      uuid: 'uuid-3'
    };

    test('опускает ингредиент вниз по списку', () => {
      const startState = {
        ...initialState,
        ingredients: [
          { 
            ...mockMainIngredient,
            uuid: 'uuid-1',
            id: 'uuid-1'
          },
          { 
            ...mockSecondIngredient,
            uuid: 'uuid-2',
            id: 'uuid-2'
          },
          { 
            ...mockThirdIngredient,
            uuid: 'uuid-3',
            id: 'uuid-3'
          }
        ]
      };

      const action = moveIngredient({ dragIndex: 0, hoverIndex: 1 });
      const result = reducer(startState, action);

      expect(result.ingredients[0].uuid).toBe('uuid-2');
      expect(result.ingredients[1].uuid).toBe('uuid-1');
      expect(result.ingredients[2].uuid).toBe('uuid-3');
    });

    test('поднимает ингредиент вверх в списке', () => {
      const startState = {
        ...initialState,
        ingredients: [
          { 
            ...mockMainIngredient,
            uuid: 'uuid-1',
            id: 'uuid-1'
          },
          { 
            ...mockSecondIngredient,
            uuid: 'uuid-2',
            id: 'uuid-2'
          },
          { 
            ...mockThirdIngredient,
            uuid: 'uuid-3',
            id: 'uuid-3'
          }
        ]
      };

      const action = moveIngredient({ dragIndex: 2, hoverIndex: 1 });
      const result = reducer(startState, action);

      expect(result.ingredients[0].uuid).toBe('uuid-1');
      expect(result.ingredients[1].uuid).toBe('uuid-3');
      expect(result.ingredients[2].uuid).toBe('uuid-2');
    });

    test('не изменяет порядок при одинаковых индексах', () => {
      const startState = {
        ...initialState,
        ingredients: [
          { 
            ...mockMainIngredient,
            uuid: 'uuid-1',
            id: 'uuid-1'
          },
          { 
            ...mockSecondIngredient,
            uuid: 'uuid-2',
            id: 'uuid-2'
          }
        ]
      };

      const action = moveIngredient({ dragIndex: 0, hoverIndex: 0 });
      const result = reducer(startState, action);

      expect(result.ingredients[0].uuid).toBe('uuid-1');
      expect(result.ingredients[1].uuid).toBe('uuid-2');
    });
  });
});