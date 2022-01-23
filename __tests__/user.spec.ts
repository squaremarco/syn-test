import { omit } from 'ramda';
import request from 'supertest';

import app from '../src/app';
import { SigninInputValidation, SignupInputValidation, UpdateUserInputValidation } from '../src/models/user.model';
import { mongooseConnection } from './common';

let mongodb: Awaited<ReturnType<typeof mongooseConnection>>;

let createdUserId: string;
let accessToken: string;

beforeAll(async () => {
  mongodb = await mongooseConnection();
});

afterAll(async () => {
  await mongodb.closeDatabase();
});

const signinPayload: SignupInputValidation['body'] = {
  firstName: 'test',
  lastName: 'user',
  email: 'test.user@test.dev',
  password: 'password',
  roles: ['admin']
};

const signupPayload: SigninInputValidation['body'] = {
  email: 'test.user@test.dev',
  password: 'password'
};

const updatePayload: Partial<UpdateUserInputValidation['body']> = {
  firstName: 'updatedFirst',
  lastName: 'updatedLast'
};

describe('User controller', () => {
  it('Should create an user', async () => {
    const signupResponse = await request(app).post('/signup').send(signinPayload);
    const signinResponse = await request(app).post('/signin').send(signupPayload);

    expect(signupResponse.statusCode).toBe(200);
    expect(signupResponse.body.data).toEqual(expect.objectContaining(omit(['password'], signinPayload)));

    createdUserId = signupResponse.body.data._id;
    accessToken = `Bearer ${signinResponse.body.data.accessToken}`;
  });

  it('Should get an array of users', async () => {
    const response = await request(app).get(`/users`);

    expect(response.statusCode).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data).toEqual(
      expect.arrayContaining([expect.objectContaining(omit(['password'], signinPayload))])
    );
  });

  it('Should get an user by id', async () => {
    const response = await request(app).get(`/users/${createdUserId}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.data).toEqual(expect.objectContaining(omit(['password'], signinPayload)));
  });

  it('Should update an user by id', async () => {
    const response = await request(app)
      .patch(`/users/${createdUserId}`)
      .set('Authorization', accessToken)
      .send(updatePayload);

    expect(response.statusCode).toBe(200);

    const getResponse = await request(app).get(`/users/${createdUserId}`);

    expect(getResponse.statusCode).toBe(200);
    expect(response.body.data).toEqual(
      expect.objectContaining(omit(['password'], { ...signinPayload, ...updatePayload }))
    );
  });

  it('Should delete an user by id', async () => {
    const response = await request(app).delete(`/users/${createdUserId}`).set('Authorization', accessToken);

    expect(response.statusCode).toBe(200);

    const getResponse = await request(app).get(`/users/${createdUserId}`);

    expect(getResponse.statusCode).toBe(404);
  });
});
