import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as request from 'supertest';
import { MovieModule } from '../movie.module';
import { Movie } from '../movie.entity';

describe('MovieModule (integration)', () => {
  let app: INestApplication;
  let testingModule: TestingModule;

  beforeAll(async () => {
    testingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Movie],
          synchronize: true,
          keepConnectionAlive: false,
        }),
        MovieModule,
      ],
    }).compile();

    app = testingModule.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await testingModule.close();
  });

  it('should return correct producer intervals from /movies/producers/intervals', async () => {
    const response = await request(app.getHttpServer()).get(
      '/movies/producers/intervals',
    );
    expect(response.status).toBe(200);

    expect(response.body.min).toEqual(
      expect.arrayContaining([
        {
          producer: 'Joel Silver',
          interval: 1,
          previousWin: 1990,
          followingWin: 1991,
        },
      ]),
    );

    expect(response.body.max).toEqual(
      expect.arrayContaining([
        {
          producer: 'Matthew Vaughn',
          interval: 13,
          previousWin: 2002,
          followingWin: 2015,
        },
      ]),
    );
  });
});
