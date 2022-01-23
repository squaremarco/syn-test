import request from 'supertest';

import app from '../src/app';
import { CreateReviewInputValidation, UpdateReviewInputValidation } from '../src/models/review.model';
import { mongooseConnection } from './common';

let mongodb: Awaited<ReturnType<typeof mongooseConnection>>;

let createdReviewId: string;
let createdUserId: string;
let createdRestaurantId: string;
let accessToken: string;

beforeAll(async () => {
  mongodb = await mongooseConnection();

  const signupResponse = await request(app)
    .post('/signup')
    .send({
      firstName: 'test',
      lastName: 'user',
      email: 'test.user@test.dev',
      password: 'password',
      roles: ['admin']
    });

  const signinResponse = await request(app).post('/signin').send({
    email: 'test.user@test.dev',
    password: 'password'
  });

  accessToken = `Bearer ${signinResponse.body.data.accessToken}`;

  const restaurantCreationResponse = await request(app)
    .post('/restaurants')
    .set('Authorization', accessToken)
    .send({
      name: 'Restaurant',
      paymentTypes: ['card'],
      pictures: [],
      tags: ['Tag'],
      menuGroups: []
    });

  createdUserId = signupResponse.body.data._id;
  createdRestaurantId = restaurantCreationResponse.body.data._id;
});

afterAll(async () => {
  await mongodb.closeDatabase();
});

const createPayload: Omit<CreateReviewInputValidation['body'], 'restaurant'> = {
  content: 'Lorem Ipsum Dolor Sit Amet.',
  score: 8,
  price: 10
};

const updatePayload: Partial<UpdateReviewInputValidation['body']> = {
  content: 'Lorem Ipsum Dolor Sit Amet.',
  score: 6
};

describe('Review controller', () => {
  it('Should create a review', async () => {
    const response = await request(app)
      .post('/reviews')
      .set('Authorization', accessToken)
      .send({
        ...createPayload,
        user: createdUserId,
        restaurant: createdRestaurantId
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.data).toEqual(expect.objectContaining(createPayload));

    createdReviewId = response.body.data._id;
  });

  it('Should get an array of reviews', async () => {
    const response = await request(app).get(`/reviews`);

    expect(response.statusCode).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data).toEqual(expect.arrayContaining([expect.objectContaining(createPayload)]));
  });

  it('Should get a review by id', async () => {
    const response = await request(app).get(`/reviews/${createdReviewId}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.data).toEqual(expect.objectContaining(createPayload));
  });

  it('Should update a review by id', async () => {
    const response = await request(app)
      .patch(`/reviews/${createdReviewId}`)
      .set('Authorization', accessToken)
      .send(updatePayload);

    expect(response.statusCode).toBe(200);

    const getResponse = await request(app).get(`/reviews/${createdReviewId}`);

    expect(getResponse.statusCode).toBe(200);
    expect(response.body.data).toEqual(expect.objectContaining({ ...createPayload, ...updatePayload }));
  });

  it('Should prevent deleting another user review', async () => {
    await request(app)
      .post('/signup')
      .send({
        firstName: 'test',
        lastName: 'delete',
        email: 'test.delete@test.dev',
        password: 'password',
        roles: ['admin']
      });

    const signinResponse = await request(app).post('/signin').send({
      email: 'test.delete@test.dev',
      password: 'password'
    });

    const token = `Bearer ${signinResponse.body.data.accessToken}`;

    const response = await request(app).delete(`/reviews/${createdReviewId}`).set('Authorization', token);

    expect(response.statusCode).toBe(422);
  });

  it('Should delete a review by id', async () => {
    const response = await request(app).delete(`/reviews/${createdReviewId}`).set('Authorization', accessToken);

    expect(response.statusCode).toBe(200);

    const getResponse = await request(app).get(`/reviews/${createdReviewId}`);

    expect(getResponse.statusCode).toBe(404);
  });
});
