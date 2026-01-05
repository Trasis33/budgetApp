import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import { useAuth } from '../context/AuthContext';

// Mock useAuth
jest.mock('../context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock API config
jest.mock('../api/config', () => ({
  API_URL: 'http://localhost:5001/api',
}));

// Mock axios/apiClient
jest.mock('../api/axios', () => ({
  apiClient: {
    get: jest.fn().mockResolvedValue([]),
    post: jest.fn().mockResolvedValue({}),
    put: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue({}),
  },
}));

// Mock recurring hooks to prevent crashes
jest.mock('../hooks', () => ({
  useRecurringSummary: jest.fn().mockReturnValue({
    templates: [],
    summary: { total_amount: 0, count: 0, generated_count: 0, generated_amount: 0 },
    refresh: jest.fn()
  }),
  useRecurringGeneration: jest.fn().mockReturnValue({
    generate: jest.fn(),
    isGenerating: false
  })
}));

describe('App Routing & Navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      loading: false,
      user: { id: 1, name: 'Test User' },
      logout: jest.fn(),
    });
  });

  it('renders Savings Goals page on /savings route', async () => {
    render(
      <MemoryRouter initialEntries={['/savings']}>
        <App />
      </MemoryRouter>
    );
    
    expect(await screen.findByRole('heading', { name: /Savings Goals/i })).toBeInTheDocument();
  });

  it('renders Savings Goal Detail page on /savings/:id route', async () => {
    render(
      <MemoryRouter initialEntries={['/savings/123']}>
        <App />
      </MemoryRouter>
    );
    
    expect(await screen.findByText(/Goal Details/i)).toBeInTheDocument();
  });

  it('has Savings link in navigation', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <App />
      </MemoryRouter>
    );
    
    // Find Savings link in navigation (there might be one in the desktop nav and one in mobile nav)
    const savingsLinks = await screen.findAllByRole('link', { name: /Savings/i });
    expect(savingsLinks.length).toBeGreaterThan(0);
    expect(savingsLinks[0]).toHaveAttribute('href', '/savings');
  });
});
