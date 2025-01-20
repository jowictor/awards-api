import * as fs from 'fs';
import * as csv from 'csv-parser';
import { Injectable } from '@nestjs/common';
import { Movie } from '../../movie.entity';
import { DataLoaderService } from './data-loader.interface';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { env } from '../../../../config/env';

@Injectable()
export class CsvDataLoaderService implements DataLoaderService {
  private readonly MAX_FILE_SIZE_MB = 10;
  private readonly filePath = `data/${env.CSV_FILE}`;
  private readonly requiredHeaders = [
    'year',
    'title',
    'studios',
    'producers',
    'winner',
  ];

  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
  ) {}

  async loadData(): Promise<void> {
    if (!fs.existsSync(this.filePath)) {
      console.error('CSV file not found');
      return;
    }

    const stats = fs.statSync(this.filePath);
    if (stats.size === 0) {
      return;
    }

    if (stats.size > this.MAX_FILE_SIZE_MB * 1024 * 1024) {
      console.error(
        `CSV file exceeds the maximum allowed size of ${this.MAX_FILE_SIZE_MB} MB.`,
      );
    }

    const existingMovies = await this.movieRepository.count();
    if (existingMovies === 0) {
      const movies: Movie[] = [];

      console.info('Loading movies...');
      return new Promise((resolve, reject) => {
        fs.createReadStream(this.filePath)
          .pipe(csv({ separator: ';' }))
          .on('headers', (headers) => {
            if (!this.validateHeaders(headers)) {
              return reject(
                new Error(
                  `Invalid CSV headers. Expected: ${this.requiredHeaders.join(', ')}, but got: ${headers.join(', ')}`,
                ),
              );
            }
          })
          .on('data', async (row) => {
            if (!this.validateRow(row)) {
              console.warn(
                `Invalid row detected and skipped: ${JSON.stringify(row)}`,
              );
              return;
            }

            const normalizedRow = this.normalizeRow(row);
            movies.push(normalizedRow);
          })
          .on('end', async () => {
            if (movies.length > 0) {
              await this.saveMovies(movies);
              console.log('Movies loaded successfully.');
              resolve();
            }
            return;
          })
          .on('error', (error) => {
            console.error('Error processing CSV:', error);
            reject(error);
          });
      });
    }
  }

  private validateHeaders(headers: string[]): boolean {
    return this.requiredHeaders.every((header) => headers.includes(header));
  }

  private normalizeRow(row: any): Movie {
    return {
      id: null,
      year: +row.year,
      title: row.title?.trim(),
      studios: this.splitAndTrim(row.studios),
      producers: this.splitAndTrim(row.producers),
      winner: row.winner?.toLowerCase() === 'yes',
    };
  }
  private validateRow(row: any): boolean {
    if (!row.year || isNaN(+row.year)) return false;
    if (!row.title || !row.producers || !row.studios) return false;
    return true;
  }

  private splitAndTrim(value: string): string {
    return value
      ?.split(',')
      .map((v) => v.trim())
      .join(', ');
  }

  private async saveMovies(newMovies: Movie[]): Promise<void> {
    const batchSize = 500;
    for (let i = 0; i < newMovies.length; i += batchSize) {
      const batch = newMovies.slice(i, i + batchSize);
      await this.movieRepository.save(batch);

      if (i === newMovies.length) {
        console.log(`Saved new movies.`);
      }
    }
  }
}
