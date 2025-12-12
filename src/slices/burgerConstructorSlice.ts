// src/slices/burgerConstructorSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TIngredient } from '@utils-types';
import { RootState } from '../services/store';

interface ConstructorIngredient extends TIngredient {
  uuid: string;
}

interface BurgerConstructorState {
  bun: TIngredient | null;
  ingredients: ConstructorIngredient[];
  totalPrice: number;
}

export const initialState: BurgerConstructorState = {
  bun: null,
  ingredients: [],
  totalPrice: 0
};

export const burgerConstructorSlice = createSlice({
  name: 'burgerConstructor',
  initialState,
  reducers: {
    addBun: (state, action: PayloadAction<TIngredient>) => {
      state.bun = action.payload;
      state.totalPrice = calculateTotalPrice(state.bun, state.ingredients);
    },
    addIngredient: {
      reducer: (state, action: PayloadAction<ConstructorIngredient>) => {
        state.ingredients.push(action.payload);
        state.totalPrice = calculateTotalPrice(state.bun, state.ingredients);
      },
      prepare: (ingredient: TIngredient) => {
        const uuid = crypto.randomUUID();
        return { payload: { ...ingredient, uuid } };
      }
    },
    removeIngredient: (state, action: PayloadAction<string>) => {
      state.ingredients = state.ingredients.filter(
        (item) => item.uuid !== action.payload
      );
      state.totalPrice = calculateTotalPrice(state.bun, state.ingredients);
    },
    moveIngredient: (
      state,
      action: PayloadAction<{ dragIndex: number; hoverIndex: number }>
    ) => {
      const { dragIndex, hoverIndex } = action.payload;
      const draggedItem = state.ingredients[dragIndex];
      
      const newIngredients = [...state.ingredients];
      newIngredients.splice(dragIndex, 1);
      newIngredients.splice(hoverIndex, 0, draggedItem);
      
      state.ingredients = newIngredients;
    },
    clearConstructor: (state) => {
      state.bun = null;
      state.ingredients = [];
      state.totalPrice = 0;
    },
    updateTotalPrice: (state) => {
      state.totalPrice = calculateTotalPrice(state.bun, state.ingredients);
    }
  }
});


const calculateTotalPrice = (
  bun: TIngredient | null,
  ingredients: ConstructorIngredient[]
): number => {
  const bunPrice = bun ? bun.price * 2 : 0;
  const ingredientsPrice = ingredients.reduce(
    (sum, item) => sum + item.price,
    0
  );
  return bunPrice + ingredientsPrice;
};

export const {
  addBun,
  addIngredient,
  removeIngredient,
  moveIngredient,
  clearConstructor,
  updateTotalPrice
} = burgerConstructorSlice.actions;
export default burgerConstructorSlice.reducer;

export const selectConstructor = (state: RootState) => state.burgerConstructor;
export const selectBun = (state: RootState) => state.burgerConstructor.bun;
export const selectIngredients = (state: RootState) =>
  state.burgerConstructor.ingredients;
export const selectTotalPrice = (state: RootState) =>
  state.burgerConstructor.totalPrice;
export const selectConstructorIngredientsIds = (state: RootState) => {
  const { bun, ingredients } = state.burgerConstructor;
  const bunIds = bun ? [bun._id] : [];
  const ingredientIds = ingredients.map((item) => item._id);
  return [...bunIds, ...ingredientIds, ...bunIds];
};