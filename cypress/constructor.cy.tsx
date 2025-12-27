describe('Конструктор бургеров - интеграционные тесты', () => {
  const SELECTORS = {

    MODAL: '[data-testid="modal"]',
    MODAL_CLOSE: '[data-testid="modal-close"]',
    MODAL_OVERLAY: '[data-testid="modal-overlay"]',
    

    INGREDIENT_DETAILS: '[data-testid="ingredient-details"]',
    ORDER_NUMBER: '[data-testid="order-number"]',
    BURGER_CONSTRUCTOR: '[data-testid="burger-constructor"]',
    BUN_SECTION: '[data-testid="bun-section"]',
    FILLING_SECTION: '[data-testid="filling-section"]',
    

    ADD_BUTTON: 'button:contains("Добавить")',
    CREATE_ORDER_BUTTON: 'button:contains("Оформить заказ")',
    

    SELECT_BUNS_TEXT: 'Выберите булки',
    SELECT_FILLINGS_TEXT: 'Выберите начинку',
    

    API_INGREDIENTS: 'api/ingredients',
    API_AUTH_USER: 'api/auth/user',
    API_ORDERS: 'api/orders'
  };

  const INGREDIENT_NAMES = {
    BUN: 'Краторная булка N-200i',
    MAIN: 'Филе Люминесцентного тетраодонтимформа',
    SAUCE: 'Соус Spicy-X'
  };


  const getIngredientCard = (ingredientName) => {
    return cy.contains(ingredientName).parents('[data-testid="ingredient-card"]');
  };

  const addIngredientToConstructor = (ingredientName) => {
    getIngredientCard(ingredientName)
      .find(SELECTORS.ADD_BUTTON)
      .click();
  };

  const checkModalIsClosed = () => {
    cy.get(SELECTORS.MODAL).should('not.exist');
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  };

  const checkConstructorIsEmpty = () => {
    cy.get(SELECTORS.BUN_SECTION).should('contain', SELECTORS.SELECT_BUNS_TEXT);
    cy.get(SELECTORS.FILLING_SECTION).should('contain', SELECTORS.SELECT_FILLINGS_TEXT);
  };

  beforeEach(() => {
 
    cy.intercept('GET', SELECTORS.API_INGREDIENTS, {
      fixture: 'ingredients.json'
    }).as('getIngredients');


    cy.visit('/');
    cy.wait('@getIngredients');
    

    cy.get('[data-testid="ingredient-card"]').should('have.length.at.least', 4);
  });

  afterEach(() => {

    cy.clearCookies();
    cy.clearLocalStorage();
  });

  describe('Добавление ингредиентов в конструктор', () => {
    it('Добавляет булку в конструктор', () => {
      addIngredientToConstructor(INGREDIENT_NAMES.BUN);
      

      cy.get(SELECTORS.BUN_SECTION)
        .should('contain', INGREDIENT_NAMES.BUN)
        .and('not.contain', SELECTORS.SELECT_BUNS_TEXT);
    });

    it('Добавляет начинку в конструктор', () => {

      addIngredientToConstructor(INGREDIENT_NAMES.BUN);
      
      addIngredientToConstructor(INGREDIENT_NAMES.MAIN);
      
      cy.get(SELECTORS.FILLING_SECTION)
        .should('contain', INGREDIENT_NAMES.MAIN)
        .and('not.contain', SELECTORS.SELECT_FILLINGS_TEXT);
    });

    it('Добавляет соус в конструктор', () => {
      addIngredientToConstructor(INGREDIENT_NAMES.BUN);
      addIngredientToConstructor(INGREDIENT_NAMES.SAUCE);
      
      cy.get(SELECTORS.FILLING_SECTION)
        .should('contain', INGREDIENT_NAMES.SAUCE);
    });
  });

  describe('Работа модальных окон ингредиентов', () => {
    it('Открывает модальное окно при клике на ингредиент', () => {
      getIngredientCard(INGREDIENT_NAMES.BUN).click();
      
      cy.get(SELECTORS.MODAL).should('be.visible');
      cy.get(SELECTORS.INGREDIENT_DETAILS).should('be.visible');
      cy.get(SELECTORS.INGREDIENT_DETAILS).should('contain', INGREDIENT_NAMES.BUN);
      
      cy.url().should('include', '/ingredients/643d69a5c3f7b9001cfa093c');
    });

    it('Закрывает модальное окно по клику на крестик', () => {
      getIngredientCard(INGREDIENT_NAMES.BUN).click();
      cy.get(SELECTORS.MODAL_CLOSE).click();
      
      checkModalIsClosed();
    });

    it('Закрывает модальное окно по клику на оверлей', () => {
      getIngredientCard(INGREDIENT_NAMES.BUN).click();
      
      cy.get(SELECTORS.MODAL_OVERLAY).click({ force: true });
      
      checkModalIsClosed();
    });
  });

  describe('Создание заказа', () => {
    beforeEach(() => {
      cy.intercept('GET', SELECTORS.API_AUTH_USER, {
        fixture: 'user.json'
      }).as('getUser');
      
      cy.intercept('POST', SELECTORS.API_ORDERS, {
        fixture: 'order.json'
      }).as('createOrder');
      
      cy.setCookie('accessToken', 'test-access-token');
      cy.window().then((win) => {
        win.localStorage.setItem('refreshToken', 'test-refresh-token');
      });
      
      cy.reload();
      cy.wait('@getIngredients');
      cy.wait('@getUser');
    });

    it('Создает заказ и очищает конструктор', () => {
    
      addIngredientToConstructor(INGREDIENT_NAMES.BUN);
      addIngredientToConstructor(INGREDIENT_NAMES.MAIN);
      addIngredientToConstructor(INGREDIENT_NAMES.SAUCE);
      
      cy.get(SELECTORS.BUN_SECTION).should('not.contain', SELECTORS.SELECT_BUNS_TEXT);
      cy.get(SELECTORS.FILLING_SECTION).should('not.contain', SELECTORS.SELECT_FILLINGS_TEXT);
      
      cy.get(SELECTORS.CREATE_ORDER_BUTTON).click();
      
      cy.wait('@createOrder').then((interception) => {
        expect(interception.request.body).to.have.property('ingredients');
      });
      
      cy.get(SELECTORS.MODAL).should('be.visible');
      cy.get(SELECTORS.ORDER_NUMBER).should('contain', '12345');
      
      cy.get(SELECTORS.MODAL_CLOSE).click();
      
      cy.get(SELECTORS.MODAL).should('not.exist');
      
      checkConstructorIsEmpty();
    });

    it('Показывает ошибку при создании заказа без булки', () => {
      addIngredientToConstructor(INGREDIENT_NAMES.MAIN);
      
      cy.get(SELECTORS.CREATE_ORDER_BUTTON).should('be.disabled');
      
      cy.get(SELECTORS.BUN_SECTION).should('contain', SELECTORS.SELECT_BUNS_TEXT);
    });
  });


});