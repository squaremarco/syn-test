import { omit } from 'ramda';
import request from 'supertest';

import app from '../src/app';
import { CreateReviewInputValidation, UpdateReviewInputValidation } from '../src/models/review.model';
import { mongooseConnection } from './common';

let mongodb: Awaited<ReturnType<typeof mongooseConnection>>;

let createdReviewId: string;
let createdUserId: string;
let createdRestaurantId: string;

beforeAll(async () => {
  mongodb = await mongooseConnection();

  const userCreationResponse = await request(app).post('/users').send({
    firstName: 'first',
    lastName: 'last',
    email: 'email@test.dev',
    password: 'password'
  });

  const restaurantCreationResponse = await request(app)
    .post('/restaurants')
    .send({
      name: 'Restaurant',
      paymentTypes: ['card'],
      pictures: [],
      tags: ['Tag'],
      menuGroups: []
    });

  createdUserId = userCreationResponse.body.data._id;
  createdRestaurantId = restaurantCreationResponse.body.data._id;
});

afterAll(async () => {
  await mongodb.closeDatabase();
});

const createPayload: Omit<CreateReviewInputValidation['body'], 'userId' | 'restaurantId'> = {
  content: 'Lorem Ipsum Dolor Sit Amet.',
  score: 8,
  price: 10
};

const updatePayload: UpdateReviewInputValidation['body'] = {
  content: 'Lorem Ipsum Dolor Sit Amet.',
  score: 6,
  price: 5
};

describe('Review controller', () => {
  it('Should create a review', async () => {
    const response = await request(app)
      .post('/reviews')
      .send({
        ...createPayload,
        userId: createdUserId,
        restaurantId: createdRestaurantId
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
    const response = await request(app).patch(`/reviews/${createdReviewId}`).send(updatePayload);

    expect(response.statusCode).toBe(200);

    const getResponse = await request(app).get(`/reviews/${createdReviewId}`);

    expect(getResponse.statusCode).toBe(200);
    expect(response.body.data).toEqual(expect.objectContaining({ ...createPayload, ...updatePayload }));
  });

  it('Should validate inputs during creation and update', async () => {
    const createResponse = await request(app)
      .post('/reviews')
      .send(omit(['content'], createPayload));

    expect(createResponse.statusCode).toBe(500);

    const updateResponse = await request(app)
      .patch(`/reviews/${createdReviewId}`)
      .send(omit(['score'], updatePayload));

    expect(updateResponse.statusCode).toBe(500);
  });

  it('Should delete a review by id', async () => {
    const response = await request(app).delete(`/reviews/${createdReviewId}`);

    expect(response.statusCode).toBe(200);

    const getResponse = await request(app).get(`/reviews/${createdReviewId}`);

    expect(getResponse.statusCode).toBe(404);
  });
});
