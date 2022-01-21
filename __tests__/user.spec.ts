import { omit } from 'ramda';
import request from 'supertest';

import app from '../src/app';
import { CreateUserInputValidation, UpdateUserInputValidation } from '../src/models/user.model';
import { mongooseConnection } from './common';

let mongodb: Awaited<ReturnType<typeof mongooseConnection>>;

let createdUserId: string;

beforeAll(async () => {
  mongodb = await mongooseConnection();
});

afterAll(async () => {
  await mongodb.closeDatabase();
});

const createPayload: CreateUserInputValidation['body'] = {
  firstName: 'first',
  lastName: 'last',
  password: 'password',
  email: 'email@test.dev'
};

const updatePayload: UpdateUserInputValidation['body'] = { firstName: 'updatedFirst', lastName: 'updatedLast' };

describe('User controller', () => {
  it('Should create an user', async () => {
    const response = await request(app).post('/users').send(createPayload);

    expect(response.statusCode).toBe(200);
    expect(response.body.data).toEqual(expect.objectContaining(createPayload));

    createdUserId = response.body.data._id;
  });

  it('Should get an array of users', async () => {
    const response = await request(app).get(`/users`);

    expect(response.statusCode).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data).toEqual(expect.arrayContaining([expect.objectContaining(createPayload)]));
  });

  it('Should get an user by id', async () => {
    const response = await request(app).get(`/users/${createdUserId}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.data).toEqual(expect.objectContaining(createPayload));
  });

  it('Should update an user by id', async () => {
    const response = await request(app).patch(`/users/${createdUserId}`).send(updatePayload);

    expect(response.statusCode).toBe(200);

    const getResponse = await request(app).get(`/users/${createdUserId}`);

    expect(getResponse.statusCode).toBe(200);
    expect(response.body.data).toEqual(expect.objectContaining({ ...createPayload, ...updatePayload }));
  });

  it('Should validate inputs during creation and update', async () => {
    const createResponse = await request(app)
      .post('/users')
      .send(omit(['password'], createPayload));

    expect(createResponse.statusCode).toBe(500);

    const updateResponse = await request(app)
      .patch(`/users/${createdUserId}`)
      .send(omit(['firstName'], updatePayload));

    expect(updateResponse.statusCode).toBe(500);
  });

  it('Should delete an user by id', async () => {
    const response = await request(app).delete(`/users/${createdUserId}`);

    expect(response.statusCode).toBe(200);

    const getResponse = await request(app).get(`/users/${createdUserId}`);

    expect(getResponse.statusCode).toBe(404);
  });
});
