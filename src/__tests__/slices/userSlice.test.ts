// tests/userSlice.test.ts
jest.mock(
  '@api',
  () => ({
    getUserApi: jest.fn(),
    loginUserApi: jest.fn(),
    logoutApi: jest.fn(),
    registerUserApi: jest.fn(),
    updateUserApi: jest.fn(),
    refreshToken: jest.fn()
  }),
  { virtual: true }
);

jest.mock(
  '../../src/utils/cookie',
  () => ({
    setCookie: jest.fn(),
    deleteCookie: jest.fn(),
    getCookie: jest.fn(() => null)
  }),
  { virtual: true }
);

import userReducer, {
  initialState,
  checkUserAuth,
  loginUser,
  registerUser,
  logout,
  updateUser,
  clearError
} from '../../slices/userSlice';
import { mockUser } from '../mockData';

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
global.localStorage = localStorageMock as any;

describe('User Slice', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Должен возвращать начальное состояние', () => {
    expect(userReducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  describe('Асинхронные операции checkUserAuth', () => {
    describe('При вызове экшена Pending', () => {
      test('isAuthChecked меняется на false', () => {
        const action = { type: checkUserAuth.pending.type };
        const result = userReducer(initialState, action);
        expect(result.isAuthChecked).toBe(false);
      });
    });

    describe('При вызове экшена Fulfilled', () => {
      test('данные записываются в стор, isAuthChecked = true', () => {
        const action = {
          type: checkUserAuth.fulfilled.type,
          payload: mockUser
        };
        const result = userReducer(initialState, action);

        expect(result.user).toEqual(mockUser);
        expect(result.isAuthChecked).toBe(true);
        expect(result.error).toBe(null);
      });

      test('isLoading логика не используется в этом слайсе', () => {
        // В userSlice нет isLoading, проверяем что нет ошибок
        const action = {
          type: checkUserAuth.fulfilled.type,
          payload: mockUser
        };
        const result = userReducer(initialState, action);
        
        expect(result).toHaveProperty('user');
        expect(result).toHaveProperty('isAuthChecked');
        expect(result).toHaveProperty('error');
      });
    });

    describe('При вызове экшена Rejected', () => {
      test('ошибка записывается в стор, isAuthChecked = true', () => {
        const errorMessage = 'Сессия истекла';
        const action = {
          type: checkUserAuth.rejected.type,
          payload: errorMessage
        };
        const result = userReducer(initialState, action);

        expect(result.user).toBe(null);
        expect(result.isAuthChecked).toBe(true);
        expect(result.error).toBe(errorMessage);
      });
    });

    describe('Полные циклы', () => {
      test('Request -> Success цикл', () => {
        let state = userReducer(initialState, { type: checkUserAuth.pending.type });
        expect(state.isAuthChecked).toBe(false);
        
        state = userReducer(state, {
          type: checkUserAuth.fulfilled.type,
          payload: mockUser
        });
        
        expect(state.isAuthChecked).toBe(true);
        expect(state.user).toEqual(mockUser);
        expect(state.error).toBe(null);
      });

      test('Request -> Failed цикл', () => {
        let state = userReducer(initialState, { type: checkUserAuth.pending.type });
        expect(state.isAuthChecked).toBe(false);
        
        state = userReducer(state, {
          type: checkUserAuth.rejected.type,
          payload: 'Session expired'
        });
        
        expect(state.isAuthChecked).toBe(true);
        expect(state.user).toBe(null);
        expect(state.error).toBe('Session expired');
      });
    });
  });

  describe('Асинхронные операции loginUser', () => {
    describe('При вызове экшена Fulfilled', () => {
      test('данные записываются в стор', () => {
        const action = {
          type: loginUser.fulfilled.type,
          payload: mockUser
        };
        const stateWithError = { ...initialState, error: 'Предыдущая ошибка' };
        const result = userReducer(stateWithError, action);

        expect(result.user).toEqual(mockUser);
        expect(result.error).toBe(null);
      });
    });

    describe('При вызове экшена Rejected', () => {
      test('ошибка записывается в стор', () => {
        const errorMessage = 'Неверный email или пароль';
        const action = {
          type: loginUser.rejected.type,
          error: { message: errorMessage }
        };
        const result = userReducer(initialState, action);

        expect(result.error).toBe(errorMessage);
        expect(result.user).toBe(null);
      });
    });
  });

  describe('Асинхронные операции registerUser', () => {
    describe('При вызове экшена Fulfilled', () => {
      test('данные записываются в стор', () => {
        const action = {
          type: registerUser.fulfilled.type,
          payload: mockUser
        };
        const stateWithError = { ...initialState, error: 'Какая-то ошибка' };
        const result = userReducer(stateWithError, action);

        expect(result.user).toEqual(mockUser);
        expect(result.error).toBe(null);
      });
    });

    describe('При вызове экшена Rejected', () => {
      test('ошибка записывается в стор', () => {
        const errorMessage = 'Пользователь уже существует';
        const action = {
          type: registerUser.rejected.type,
          error: { message: errorMessage }
        };
        const result = userReducer(initialState, action);

        expect(result.error).toBe(errorMessage);
        expect(result.user).toBe(null);
      });
    });
  });

  describe('Асинхронные операции logout', () => {
    describe('При вызове экшена Fulfilled', () => {
      test('данные очищаются из стора', () => {
        const stateWithUser = {
          ...initialState,
          user: mockUser,
          error: 'Какая-то ошибка'
        };
        const action = { type: logout.fulfilled.type };
        const result = userReducer(stateWithUser, action);

        expect(result.user).toBe(null);
        expect(result.error).toBe(null);
      });
    });
  });

  describe('Асинхронные операции updateUser', () => {
    const updatedUser = {
      ...mockUser,
      name: 'Новое имя',
      email: 'new@example.com'
    };

    describe('При вызове экшена Fulfilled', () => {
      test('данные обновляются в сторе', () => {
        const action = {
          type: updateUser.fulfilled.type,
          payload: { user: updatedUser }
        };
        const stateWithUser = { ...initialState, user: mockUser };
        const result = userReducer(stateWithUser, action);

        expect(result.user).toEqual(updatedUser);
        expect(result.error).toBe(null);
      });
    });

    describe('При вызове экшена Rejected', () => {
      test('ошибка записывается в стор', () => {
        const errorMessage = 'Не удалось обновить данные';
        const action = {
          type: updateUser.rejected.type,
          error: { message: errorMessage }
        };
        const stateWithUser = { ...initialState, user: mockUser };
        const result = userReducer(stateWithUser, action);

        expect(result.error).toBe(errorMessage);
        expect(result.user).toEqual(mockUser);
      });
    });
  });

  describe('Синхронный экшен clearError', () => {
    test('очищает ошибку', () => {
      const stateWithError = { ...initialState, error: 'Какая-то ошибка' };
      const result = userReducer(stateWithError, clearError());

      expect(result.error).toBe(null);
      expect(result.user).toBe(null);
      expect(result.isAuthChecked).toBe(false);
    });

    test('не меняет состояние если ошибки нет', () => {
      const result = userReducer(initialState, clearError());
      expect(result).toEqual(initialState);
    });
  });

  describe('Взаимодействие между экшенами', () => {
    test('Очистка ошибки после успешного действия', () => {
      let state = userReducer(initialState, {
        type: loginUser.rejected.type,
        error: { message: 'Ошибка входа' }
      });
      
      expect(state.error).toBe('Ошибка входа');
      
      state = userReducer(state, {
        type: loginUser.fulfilled.type,
        payload: mockUser
      });
      
      expect(state.error).toBe(null);
      expect(state.user).toEqual(mockUser);
    });

    test('Полный цикл: регистрация -> вход -> обновление -> выход', () => {
      let state = initialState;

      // Регистрация
      state = userReducer(state, {
        type: registerUser.fulfilled.type,
        payload: mockUser
      });
      expect(state.user).toEqual(mockUser);

      // Вход (после перезагрузки)
      state = userReducer(initialState, {
        type: loginUser.fulfilled.type,
        payload: mockUser
      });
      expect(state.user).toEqual(mockUser);

      // Обновление
      const updatedUser = { ...mockUser, name: 'Обновленное имя' };
      state = userReducer(state, {
        type: updateUser.fulfilled.type,
        payload: { user: updatedUser }
      });
      expect(state.user?.name).toBe('Обновленное имя');

      // Выход
      state = userReducer(state, { type: logout.fulfilled.type });
      expect(state.user).toBe(null);
      expect(state.error).toBe(null);
    });
  });
});