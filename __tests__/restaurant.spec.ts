import request from 'supertest';

import app from '../src/app';
import { CreateRestaurantInputValidation, UpdateRestaurantInputValidation } from '../src/models/restaurant.model';
import { mongooseConnection } from './common';

let mongodb: Awaited<ReturnType<typeof mongooseConnection>>;

let createdRestaurantId: string;

beforeAll(async () => {
  mongodb = await mongooseConnection();
});

afterAll(async () => {
  await mongodb.closeDatabase();
});

const createPayload: CreateRestaurantInputValidation['body'] = {
  name: 'Restaurant',
  paymentTypes: ['card'],
  pictures: [],
  tags: ['Tag'],
  menuGroups: []
};

const updatePayload: UpdateRestaurantInputValidation['body'] = {
  name: 'Restaurant',
  paymentTypes: ['card', 'voucher'],
  pictures: ['https://via.placeholder.com/150'],
  tags: ['Tag', 'Second Tag'],
  menuGroups: [
    {
      title: 'Test Menu Group',
      items: [],
      description: 'Test Menu Description',
      pinned: true
    }
  ],
  pinnedReview: null
};

describe('Restaurant controller', () => {
  it('Should create a restaurant', async () => {
    const response = await request(app).post('/restaurants').send(createPayload);

    expect(response.statusCode).toBe(200);
    expect(response.body.data).toEqual(expect.objectContaining(createPayload));

    createdRestaurantId = response.body.data._id;
  });

  it('Should get an array of restaurants', async () => {
    const response = await request(app).get(`/restaurants`);

    expect(response.statusCode).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data).toEqual(expect.arrayContaining([expect.objectContaining(createPayload)]));
  });

  it('Should get a restaurant by id', async () => {
    const response = await request(app).get(`/restaurants/${createdRestaurantId}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.data).toEqual(expect.objectContaining(createPayload));
  });

  it('Should update a restaurant by id', async () => {
    const response = await request(app).patch(`/restaurants/${createdRestaurantId}`).send(updatePayload);

    expect(response.statusCode).toBe(200);

    const getResponse = await request(app).get(`/restaurants/${createdRestaurantId}`);

    expect(getResponse.statusCode).toBe(200);
    expect(response.body.data).toEqual(expect.objectContaining(updatePayload));
  });

  it('Should delete a restaurant by id', async () => {
    const response = await request(app).delete(`/restaurants/${createdRestaurantId}`);

    expect(response.statusCode).toBe(200);

    const getResponse = await request(app).get(`/restaurants/${createdRestaurantId}`);

    expect(getResponse.statusCode).toBe(404);
  });
});
