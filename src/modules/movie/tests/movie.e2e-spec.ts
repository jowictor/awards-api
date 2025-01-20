import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as request from 'supertest';
import { MovieModule } from '../movie.module';
import { Movie } from '../movie.entity';
import { env } from '../../../config/env';

describe('MovieModule (integration)', () => {
  let app: INestApplication;

  const dataPath = 'data';
  const csvFilePath = `${dataPath}/${env.CSV_FILE}`;

  const createCsvFile = (filePath: string, content: string) => {
    if (!fs.existsSync(dataPath)) {
      fs.mkdirSync(dataPath);
    }
    fs.writeFileSync(filePath, content);
  };

  const initializeApp = async (csvContent: string) => {
    createCsvFile(csvFilePath, csvContent);

    const moduleFixture: TestingModule = await Test.createTestingModule({
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

    app = moduleFixture.createNestApplication();
    await app.init();
  };

  afterEach(() => {
    if (fs.existsSync(csvFilePath)) {
      fs.unlinkSync(csvFilePath);
    }
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return correct producer intervals from /movies/producers/intervals', async () => {
    const csvContent = `year;title;studios;producers;winner
1980;Movie 1;Studio 1;Producer A;yes
1981;Movie 2;Studio 1;Producer B;no
1982;Movie 3;Studio 2;Producer A;yes
1983;Movie 4;Studio 3;Producer A;yes`;

    await initializeApp(csvContent);

    const response = await request(app.getHttpServer()).get(
      '/movies/producers/intervals',
    );
    expect(response.status).toBe(200);

    expect(response.body.min).toEqual(
      expect.arrayContaining([
        {
          producer: 'Producer A',
          interval: 1,
          previousWin: 1982,
          followingWin: 1983,
        },
      ]),
    );

    expect(response.body.max).toEqual(
      expect.arrayContaining([
        {
          producer: 'Producer A',
          interval: 2,
          previousWin: 1980,
          followingWin: 1982,
        },
      ]),
    );
  });

  it('should handle empty CSV files gracefully with /movies/producers/intervals', async () => {
    const csvContent = ``;
    await initializeApp(csvContent);

    const response = await request(app.getHttpServer()).get(
      '/movies/producers/intervals',
    );
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ min: [], max: [] });
  });

  it('should handle large CSV files with /movies/producers/intervals', async () => {
    jest.setTimeout(30000);

    const largeCsvContent = Array.from(
      { length: 10000 },
      (_, i) => `1980;Movie ${i};Studio ${i};Producer ${i};yes`,
    ).join('\n');

    const csvContent = `year;title;studios;producers;winner\n${largeCsvContent}`;
    await initializeApp(csvContent);

    const response = await request(app.getHttpServer()).get(
      '/movies/producers/intervals',
    );
    expect(response.status).toBe(200);

    const movieRepository = app.get('MovieRepository');
    const movies = await movieRepository.find();
    expect(movies).toHaveLength(10000);
  });
});
