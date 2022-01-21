import request from 'supertest';

import app from '../src/app';

describe('Test App Root', () => {
  it('Should return a 200 code and a message', async () => {
    const response = await request(app).get('/');

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Hello, Synesthesia!');
  });
});
