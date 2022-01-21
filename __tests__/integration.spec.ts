import request from 'supertest';

import app from '../src/app';
import { mongooseConnection } from './common';

let mongodb: Awaited<ReturnType<typeof mongooseConnection>>;

let createdUserId: string;
let createdRestaurantId: string;
let createdReviewId: string;

beforeAll(async () => {
  mongodb = await mongooseConnection();
});

beforeEach(async () => {
  await mongodb.clearDatabase();

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

  const reviewCreationResponse = await request(app).post('/reviews').send({
    user: createdUserId,
    restaurant: createdRestaurantId,
    content: 'Lorem Ipsum Dolor Sit Amet.',
    score: 8,
    price: 10
  });

  createdReviewId = reviewCreationResponse.body.data._id;
});

afterAll(async () => {
  await mongodb.closeDatabase();
});

describe('Integration', () => {
  test('Deleting a user should delete its reviews and these reviews references', async () => {
    await request(app).delete(`/users/${createdUserId}`);

    const getReviewsResponse = await request(app).get('/reviews');

    expect(getReviewsResponse.statusCode).toBe(200);
    expect(getReviewsResponse.body.data).toHaveLength(0);

    const getRestaurantResponse = await request(app).get(`/restaurants/${createdRestaurantId}`);

    expect(getRestaurantResponse.statusCode).toBe(200);
    expect(getRestaurantResponse.body.data.reviews).toHaveLength(0);
  });

  test('Deleting a review should delete all its references', async () => {
    await request(app).delete(`/reviews/${createdReviewId}`);

    const getUsersResponse = await request(app).get(`/users/${createdUserId}`);

    expect(getUsersResponse.statusCode).toBe(200);
    expect(getUsersResponse.body.data.reviews).toHaveLength(0);

    const getRestaurantResponse = await request(app).get(`/restaurants/${createdRestaurantId}`);

    expect(getRestaurantResponse.statusCode).toBe(200);
    expect(getRestaurantResponse.body.data.reviews).toHaveLength(0);
  });
});
