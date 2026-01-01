/// <reference types="cypress" />

// Селекторы для элементов интерфейса
const ELEMENT_SELECTORS = {
  MODAL_WINDOW: '[data-cy="modal"]',
  MODAL_CLOSE_BUTTON: '[data-cy="modal-close"]',
  MODAL_OVERLAY_BACKGROUND: '[data-cy="modal-overlay"]',
  INGREDIENT_INFO: '[data-cy="ingredient-details"]',
  ORDER_NUMERATION: '[data-cy="order-number"]',
  CONSTRUCTOR_AREA: '[data-cy="burger-constructor"]',
};

// Текстовые константы
const TEXT_CONTENT = {
  BUN_SELECTION_PROMPT: 'Выберите булки',
  FILLING_SELECTION_PROMPT: 'Выберите начинку',
};

// API маршруты
const API_ENDPOINTS = {
  INGREDIENTS_DATA: 'api/ingredients',
  USER_PROFILE_DATA: 'api/auth/user',
  ORDER_CREATION: 'api/orders',
};

// Файлы с тестовыми данными
const TEST_DATA_FILES = {
  INGREDIENTS_MOCK: 'ingredients.json',
  USER_PROFILE_MOCK: 'user.json',
  ORDER_DETAILS_MOCK: 'order.json',
};

// Настройки авторизации
const AUTH_CONFIG = {
  TOKEN_COOKIE_NAME: 'accessToken',
  TOKEN_COOKIE_VALUE: 'test-access-token',
  REFRESH_TOKEN_STORAGE_KEY: 'refreshToken',
  REFRESH_TOKEN_STORAGE_VALUE: 'test-refresh-token',
};

// Ингредиенты для тестирования
const TEST_INGREDIENTS = {
  FLUORESCENT_ROLL: 'Флюоресцентная булка R2-D3',
  KRASTOR_ROLL: 'Краторная булка N-200i',
  LUMINESCENT_MEAT: 'Филе Люминесцентного тетраодонтимформа',
  SPICY_SAUCE: 'Соус Spicy-X',
};

// Надписи на кнопках
const BUTTON_CAPTIONS = {
  ADD_ITEM: 'Добавить',
  FINALIZE_ORDER: 'Оформить заказ',
};

// Данные о заказе
const ORDER_INFO = {
  IDENTIFIER: '12345',
};

// Функция для поиска карточки ингредиента
const locateIngredientCard = (ingredientName: string) => {
  return cy.contains(ingredientName).parents('li');
};

// Функция добавления ингредиента в конструктор
const insertIngredient = (ingredientName: string) => {
  locateIngredientCard(ingredientName)
    .find(`button:contains("${BUTTON_CAPTIONS.ADD_ITEM}")`)
    .click();
};

// Функция проверки закрытия модального окна
const verifyModalIsClosed = () => {
  cy.get(ELEMENT_SELECTORS.MODAL_WINDOW).should('not.exist');
  cy.url().should('eq', Cypress.config().baseUrl + '/');
};

describe('Проверка функционала конструктора бургеров', () => {
  beforeEach(() => {
    cy.intercept('GET', API_ENDPOINTS.INGREDIENTS_DATA, { 
      fixture: TEST_DATA_FILES.INGREDIENTS_MOCK 
    }).as('loadIngredients');

    cy.visit('/');
    cy.wait('@loadIngredients');
    cy.wait(1000);
  });

  afterEach(() => {
    cy.clearCookies();
    cy.window().then((win) => {
      win.localStorage.clear();
    });
  });

  describe('Добавление элементов в конструктор', () => {
    it('Вставляет булку через кнопку добавления', () => {
      insertIngredient(TEST_INGREDIENTS.FLUORESCENT_ROLL);

      cy.get('body').should('contain', TEST_INGREDIENTS.FLUORESCENT_ROLL);
    });

    it('Добавляет начинку через соответствующую кнопку', () => {
      insertIngredient(TEST_INGREDIENTS.FLUORESCENT_ROLL);
      insertIngredient(TEST_INGREDIENTS.LUMINESCENT_MEAT);

      cy.get('body').should('contain', TEST_INGREDIENTS.LUMINESCENT_MEAT);
    });

    it('Включает соус через интерфейс добавления', () => {
      insertIngredient(TEST_INGREDIENTS.FLUORESCENT_ROLL);
      insertIngredient(TEST_INGREDIENTS.SPICY_SAUCE);

      cy.get('body').should('contain', TEST_INGREDIENTS.SPICY_SAUCE);
    });
  });

  describe('Функционирование всплывающих окон', () => {
    it('Активирует окно с информацией об ингредиенте по клику', () => {
      cy.contains(TEST_INGREDIENTS.KRASTOR_ROLL).click();

      cy.get(ELEMENT_SELECTORS.MODAL_WINDOW).should('be.visible');
      cy.get(ELEMENT_SELECTORS.INGREDIENT_INFO).should('be.visible');

      cy.get(ELEMENT_SELECTORS.MODAL_CLOSE_BUTTON).click();
      verifyModalIsClosed();
    });

    it('Завершает работу окна по нажатию на крестик', () => {
      cy.contains(TEST_INGREDIENTS.KRASTOR_ROLL).click();
      cy.wait(1000);

      cy.get(ELEMENT_SELECTORS.MODAL_CLOSE_BUTTON).click();
      verifyModalIsClosed();
    });

    it('Закрывает диалоговое окно кликом по фону', () => {
      cy.contains(TEST_INGREDIENTS.KRASTOR_ROLL).click();
      cy.wait(1000);

      cy.get(ELEMENT_SELECTORS.MODAL_OVERLAY_BACKGROUND).click({ force: true });
      verifyModalIsClosed();
    });
  });

  describe('Процедура формирования заказа', () => {
    beforeEach(() => {
      cy.intercept('GET', API_ENDPOINTS.USER_PROFILE_DATA, { 
        fixture: TEST_DATA_FILES.USER_PROFILE_MOCK 
      }).as('fetchUserProfile');

      cy.intercept('POST', API_ENDPOINTS.ORDER_CREATION, { 
        fixture: TEST_DATA_FILES.ORDER_DETAILS_MOCK 
      }).as('processOrder');

      cy.setCookie(AUTH_CONFIG.TOKEN_COOKIE_NAME, AUTH_CONFIG.TOKEN_COOKIE_VALUE);
      cy.window().then((win) => {
        win.localStorage.setItem(AUTH_CONFIG.REFRESH_TOKEN_STORAGE_KEY, AUTH_CONFIG.REFRESH_TOKEN_STORAGE_VALUE);
      });

      cy.reload();
      cy.wait('@loadIngredients');
      cy.wait('@fetchUserProfile');
      cy.wait(1000);
    });

    it('Формирует заказ с корректным идентификатором', () => {
      insertIngredient(TEST_INGREDIENTS.FLUORESCENT_ROLL);
      insertIngredient(TEST_INGREDIENTS.SPICY_SAUCE);

      cy.get('body').should('contain', TEST_INGREDIENTS.FLUORESCENT_ROLL);
      cy.get('body').should('contain', TEST_INGREDIENTS.SPICY_SAUCE);

      cy.contains(BUTTON_CAPTIONS.FINALIZE_ORDER).click();

      cy.wait('@processOrder');

      cy.get(ELEMENT_SELECTORS.MODAL_WINDOW).should('be.visible');
      cy.get(ELEMENT_SELECTORS.ORDER_NUMERATION).should('contain', ORDER_INFO.IDENTIFIER);

      cy.get(ELEMENT_SELECTORS.MODAL_CLOSE_BUTTON).click();

      cy.get(ELEMENT_SELECTORS.MODAL_WINDOW).should('not.exist');

      cy.get(ELEMENT_SELECTORS.CONSTRUCTOR_AREA).within(() => {
        cy.contains(TEXT_CONTENT.BUN_SELECTION_PROMPT).should('be.visible');
        cy.contains(TEXT_CONTENT.FILLING_SELECTION_PROMPT).should('be.visible');
      });
    });
  });
});