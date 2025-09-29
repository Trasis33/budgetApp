// Global test setup: extends expect with jest-dom matchers.
import '@testing-library/jest-dom';

// Automatically mock axios to use the manual mock in __mocks__.
jest.mock('axios');
