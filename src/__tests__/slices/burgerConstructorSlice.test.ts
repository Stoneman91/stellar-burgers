import reducer, {
  initialState,
  addIngredient,
  removeIngredient,
  moveIngredient
} from '../../slices/burgerConstructor';
import { mockIngredients, mockConstructorIngredients } from '../mockData';
import { TIngredient } from '../../utils/types';

describe('burgerConstructorSlice reducer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Правильная инициализация', () => {
    const result = reducer(undefined, { type: '' });
    expect(result).toEqual(initialState);
  });

  describe('Обработка экшена добавления ингредиента', () => {
    test('добавляет ингредиент в конструктор', () => {
      const ingredient: TIngredient = mockIngredients[1];

      const action = addIngredient(ingredient);
      const result = reducer(initialState, action);

      expect(result.ingredients).toHaveLength(1);
      expect(result.ingredients[0]._id).toBe(ingredient._id);
      expect(result.ingredients[0].name).toBe(ingredient.name);
      expect(result.ingredients[0].type).toBe('main');
      expect(result.ingredients[0].uuid).toBeDefined();
      expect(result.ingredients[0].id).toBeDefined();
    });

    test('добавляет несколько ингредиентов', () => {
      let state = initialState;

      const firstIngredient: TIngredient = mockIngredients[1];
      const secondIngredient: TIngredient = mockIngredients[2];

      state = reducer(state, addIngredient(firstIngredient));
      state = reducer(state, addIngredient(secondIngredient));

      expect(state.ingredients).toHaveLength(2);
      expect(state.ingredients[0]._id).toBe(firstIngredient._id);
      expect(state.ingredients[1]._id).toBe(secondIngredient._id);
    });
  });

  describe('Обработка экшена удаления ингредиента', () => {
    test('удаляет ингредиент по идентификатору', () => {
      const stateWithIngredients = {
        ...initialState,
        ingredients: [
          mockConstructorIngredients[0],
          mockConstructorIngredients[1]
        ]
      };

      const action = removeIngredient(mockConstructorIngredients[0].uuid!);
      const result = reducer(stateWithIngredients, action);

      expect(result.ingredients).toHaveLength(1);
      expect(result.ingredients[0]._id).toBe(mockConstructorIngredients[1]._id);
    });

    test('не удаляет ингредиенты при неверном uuid', () => {
      const stateWithIngredients = {
        ...initialState,
        ingredients: [
          mockConstructorIngredients[0],
          mockConstructorIngredients[1]
        ]
      };

      const action = removeIngredient('non-existent-uuid');
      const result = reducer(stateWithIngredients, action);

      expect(result.ingredients).toHaveLength(2);
    });
  });

  describe('Обработка экшена изменения порядка ингредиентов в начинке', () => {
    test('опускает ингредиент вниз по списку', () => {
      const startState = {
        ...initialState,
        ingredients: [
          mockConstructorIngredients[0],
          mockConstructorIngredients[1],
          mockConstructorIngredients[2]
        ]
      };

      const action = moveIngredient({ dragIndex: 0, hoverIndex: 1 });
      const result = reducer(startState, action);

      expect(result.ingredients[0].uuid).toBe(
        mockConstructorIngredients[1].uuid
      );
      expect(result.ingredients[1].uuid).toBe(
        mockConstructorIngredients[0].uuid
      );
      expect(result.ingredients[2].uuid).toBe(
        mockConstructorIngredients[2].uuid
      );
    });

    test('поднимает ингредиент вверх в списке', () => {
      const startState = {
        ...initialState,
        ingredients: [
          mockConstructorIngredients[0],
          mockConstructorIngredients[1],
          mockConstructorIngredients[2]
        ]
      };

      const action = moveIngredient({ dragIndex: 2, hoverIndex: 1 });
      const result = reducer(startState, action);

      expect(result.ingredients[0].uuid).toBe(
        mockConstructorIngredients[0].uuid
      );
      expect(result.ingredients[1].uuid).toBe(
        mockConstructorIngredients[2].uuid
      );
      expect(result.ingredients[2].uuid).toBe(
        mockConstructorIngredients[1].uuid
      );
    });

    test('не изменяет порядок при одинаковых индексах', () => {
      const startState = {
        ...initialState,
        ingredients: [
          mockConstructorIngredients[0],
          mockConstructorIngredients[1]
        ]
      };

      const action = moveIngredient({ dragIndex: 0, hoverIndex: 0 });
      const result = reducer(startState, action);

      expect(result.ingredients[0].uuid).toBe(
        mockConstructorIngredients[0].uuid
      );
      expect(result.ingredients[1].uuid).toBe(
        mockConstructorIngredients[1].uuid
      );
    });
  });
});
