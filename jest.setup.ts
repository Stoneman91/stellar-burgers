// jest.setup.ts
import '@testing-library/jest-dom';

// Простой мок для crypto.randomUUID без сложной логики
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'mock-uuid-123'
  },
  writable: true
});

// Глобальные моки
global.scrollTo = jest.fn();