describe('Burger Constructor', () => {
  beforeEach(() => {
    // Перехват запроса на получение ингредиентов
    cy.intercept('GET', 'api/ingredients', {
      fixture: 'ingredients.json'
    }).as('getIngredients');
    
    // Перехват запроса на создание заказа
    cy.intercept('POST', 'api/orders', {
      fixture: 'order.json'
    }).as('createOrder');
    
    // Перехват запроса на получение данных пользователя
    cy.intercept('GET', 'api/auth/user', {
      fixture: 'user.json'
    }).as('getUser');
    
    // Устанавливаем моковый токен
    cy.setCookie('accessToken', 'test-access-token');
    window.localStorage.setItem('refreshToken', 'test-refresh-token');
    
    cy.visit('/');
    cy.wait('@getIngredients');
  });

  it('should load ingredients from mock data', () => {
    cy.get('[data-testid="ingredients-list"]').should('exist');
    cy.get('[data-testid="ingredient-item"]').should('have.length', 6);
    
    // Проверяем, что отображаются моковые данные
    cy.contains('Краторная булка N-200i');
    cy.contains('Флюоресцентная булка R2-D3');
    cy.contains('Биокотлета из марсианской Магнолии');
  });

  describe('Modal windows', () => {
    it('should open ingredient modal on click', () => {
      cy.get('[data-testid="ingredient-item"]').first().click();
      cy.get('[data-testid="ingredient-details-modal"]').should('be.visible');
      cy.contains('Краторная булка N-200i');
      cy.contains('Детали ингредиента');
    });

    it('should close modal by clicking close button', () => {
      cy.get('[data-testid="ingredient-item"]').first().click();
      cy.get('[data-testid="modal-close-button"]').click();
      cy.get('[data-testid="ingredient-details-modal"]').should('not.exist');
    });

    it('should close modal by clicking overlay', () => {
      cy.get('[data-testid="ingredient-item"]').first().click();
      cy.get('[data-testid="modal-overlay"]').click({ force: true });
      cy.get('[data-testid="ingredient-details-modal"]').should('not.exist');
    });
  });

  describe('Burger construction', () => {
    beforeEach(() => {
      // Добавляем булку в конструктор
      cy.get('[data-testid="ingredient-bun"]').first()
        .trigger('dragstart')
        .trigger('dragleave');
      
      cy.get('[data-testid="constructor-drop-target"]')
        .trigger('dragenter')
        .trigger('dragover')
        .trigger('drop')
        .trigger('dragend');
    });

    it('should add bun to constructor', () => {
      cy.get('[data-testid="constructor-bun-top"]')
        .should('contain', 'Краторная булка N-200i');
      cy.get('[data-testid="constructor-bun-bottom"]')
        .should('contain', 'Краторная булка N-200i');
    });

    it('should add main ingredient to constructor', () => {
      cy.get('[data-testid="ingredient-main"]').first()
        .trigger('dragstart')
        .trigger('dragleave');
      
      cy.get('[data-testid="constructor-drop-target"]')
        .trigger('dragenter')
        .trigger('dragover')
        .trigger('drop')
        .trigger('dragend');
      
      cy.get('[data-testid="constructor-ingredient"]')
        .should('have.length', 1)
        .and('contain', 'Биокотлета из марсианской Магнолии');
    });

    it('should add sauce ingredient to constructor', () => {
      cy.get('[data-testid="ingredient-sauce"]').first()
        .trigger('dragstart')
        .trigger('dragleave');
      
      cy.get('[data-testid="constructor-drop-target"]')
        .trigger('dragenter')
        .trigger('dragover')
        .trigger('drop')
        .trigger('dragend');
      
      cy.get('[data-testid="constructor-ingredient"]')
        .should('have.length', 1)
        .and('contain', 'Соус Spicy-X');
    });

    it('should calculate total price correctly', () => {
      // Булка: 1255 * 2 = 2510
      cy.get('[data-testid="total-price"]').should('contain', '2510');
      
      // Добавляем main ингредиент: 424
      cy.get('[data-testid="ingredient-main"]').first()
        .trigger('dragstart')
        .trigger('dragleave');
      cy.get('[data-testid="constructor-drop-target"]')
        .trigger('dragenter')
        .trigger('dragover')
        .trigger('drop')
        .trigger('dragend');
      
      // 2510 + 424 = 2934
      cy.get('[data-testid="total-price"]').should('contain', '2934');
    });
  });

  describe('Order creation', () => {
    beforeEach(() => {
      // Добавляем булку и начинку
      cy.get('[data-testid="ingredient-bun"]').first()
        .trigger('dragstart')
        .trigger('dragleave');
      cy.get('[data-testid="constructor-drop-target"]')
        .trigger('dragenter')
        .trigger('dragover')
        .trigger('drop')
        .trigger('dragend');
      
      cy.get('[data-testid="ingredient-main"]').first()
        .trigger('dragstart')
        .trigger('dragleave');
      cy.get('[data-testid="constructor-drop-target"]')
        .trigger('dragenter')
        .trigger('dragover')
        .trigger('drop')
        .trigger('dragend');
    });

    it('should create order with mock data', () => {
      // Нажимаем кнопку "Оформить заказ"
      cy.get('[data-testid="order-button"]').click();
      
      // Проверяем, что отправился запрос с правильными данными
      cy.wait('@createOrder').then((interception) => {
        expect(interception.request.body).to.have.property('ingredients');
        expect(interception.request.headers).to.have.property('authorization');
      });
      
      // Проверяем, что открылось модальное окно
      cy.get('[data-testid="order-details-modal"]').should('be.visible');
      
      // Проверяем номер заказа из моковых данных (34567)
      cy.contains('идентификатор заказа').should('be.visible');
      cy.get('[data-testid="order-number"]').should('contain', '34567');
      
      // Проверяем имя заказа из моковых данных
      cy.contains('Space бургер').should('be.visible');
    });

    it('should close order modal', () => {
      cy.get('[data-testid="order-button"]').click();
      cy.wait('@createOrder');
      
      // Закрываем модальное окно
      cy.get('[data-testid="modal-close-button"]').click();
      cy.get('[data-testid="order-details-modal"]').should('not.exist');
    });

    it('should clear constructor after order creation', () => {
      cy.get('[data-testid="order-button"]').click();
      cy.wait('@createOrder');
      cy.get('[data-testid="modal-close-button"]').click();
      
      // Проверяем, что конструктор очищен
      cy.get('[data-testid="constructor-bun-top"]').should('not.exist');
      cy.get('[data-testid="constructor-bun-bottom"]').should('not.exist');
      cy.get('[data-testid="constructor-ingredient"]').should('have.length', 0);
      
      // Проверяем, что отображается сообщение о пустом конструкторе
      cy.get('[data-testid="constructor-empty"]').should('be.visible');
    });
  });

  describe('Unauthorized user', () => {
    it('should redirect to login when unauthorized user tries to create order', () => {
      // Очищаем токены
      cy.clearCookie('accessToken');
      window.localStorage.removeItem('refreshToken');
      
      // Перезагружаем страницу
      cy.reload();
      cy.wait('@getIngredients');
      
      // Добавляем ингредиенты
      cy.get('[data-testid="ingredient-bun"]').first()
        .trigger('dragstart')
        .trigger('dragleave');
      cy.get('[data-testid="constructor-drop-target"]')
        .trigger('dragenter')
        .trigger('dragover')
        .trigger('drop')
        .trigger('dragend');
      
      // Пытаемся создать заказ
      cy.get('[data-testid="order-button"]').click();
      
      // Проверяем редирект на страницу логина
      cy.url().should('include', '/login');
    });
  });
});    