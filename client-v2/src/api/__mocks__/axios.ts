const mockGet = jest.fn();
const mockPost = jest.fn();
const mockPut = jest.fn();
const mockDelete = jest.fn();

const mockApiInstance = {
  get: mockGet,
  post: mockPost,
  put: mockPut,
  delete: mockDelete,
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() }
  }
};

const mockAxios = {
  create: jest.fn(() => mockApiInstance),
  get: mockGet,
  post: mockPost,
  put: mockPut,
  delete: mockDelete
};

export default mockAxios;
export { mockGet, mockPost, mockPut, mockDelete };
