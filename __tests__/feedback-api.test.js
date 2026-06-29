import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('next/server', () => ({
  NextResponse: {
    json: (data, init) => ({
      status: init?.status ?? 200,
      json: async () => data,
    }),
  },
}));

vi.mock('../lib/store.js', () => ({
  readAll: vi.fn(() => []),
  writeAll: vi.fn(),
}));

vi.mock('../lib/dateUtils.js', () => ({
  formatRelativeTime: vi.fn((iso) => iso),
}));

import { POST, DELETE } from '../app/api/feedback/route.js';
import { readAll, writeAll } from '../lib/store.js';

function makeRequest(body, headers = {}) {
  return {
    json: async () => body,
    headers: { get: (key) => headers[key] ?? null },
  };
}

describe('POST /api/feedback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    readAll.mockReturnValue([]);
  });

  it('returns 400 when name is missing', async () => {
    const res = await POST(makeRequest({ text: 'hello' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when name exceeds 100 chars', async () => {
    const res = await POST(makeRequest({ name: 'a'.repeat(101), text: 'hello' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when text is missing', async () => {
    const res = await POST(makeRequest({ name: 'Alice' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when text exceeds 2000 chars', async () => {
    const res = await POST(makeRequest({ name: 'Alice', text: 'a'.repeat(2001) }));
    expect(res.status).toBe(400);
  });

  it('returns 201 and writes to store for valid input', async () => {
    const res = await POST(makeRequest({ name: 'Alice', text: 'Great app!' }));
    expect(res.status).toBe(201);
    expect(writeAll).toHaveBeenCalledOnce();
  });

  it('returns 500 when store write throws', async () => {
    writeAll.mockImplementationOnce(() => { throw new Error('disk full'); });
    const res = await POST(makeRequest({ name: 'Alice', text: 'Great app!' }));
    expect(res.status).toBe(500);
  });
});

describe('DELETE /api/feedback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    readAll.mockReturnValue([{ id: '123', name: 'Alice', text: 'Test', createdAt: '2024-01-01T00:00:00.000Z' }]);
  });

  it('returns 403 when Authorization header is missing', async () => {
    const res = await DELETE(makeRequest({ id: '123' }));
    expect(res.status).toBe(403);
  });

  it('returns 403 when Authorization header has wrong key', async () => {
    const res = await DELETE(makeRequest({ id: '123' }, { Authorization: 'Bearer wrong-key' }));
    expect(res.status).toBe(403);
  });

  it('returns 200 and writes to store with correct Authorization', async () => {
    const res = await DELETE(makeRequest({ id: '123' }, { Authorization: `Bearer ${process.env.ADMIN_KEY}` }));
    expect(res.status).toBe(200);
    expect(writeAll).toHaveBeenCalledOnce();
  });
});
