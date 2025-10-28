// Jest manual mock for axios to avoid ESM parsing issues in tests.
// Provides minimal get/post/delete/create used in code, each returning a controllable promise.
const mockAxios = {
  get: jest.fn(() => Promise.resolve({ data: {} })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  put: jest.fn(() => Promise.resolve({ data: {} })),
  delete: jest.fn(() => Promise.resolve({ data: {} })),
  create: jest.fn(function create() { return mockAxios; }),
  interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } }
};

export default mockAxios;
export const get = mockAxios.get;
export const post = mockAxios.post;
export const put = mockAxios.put;
export const del = mockAxios.delete;
export const create = mockAxios.create;