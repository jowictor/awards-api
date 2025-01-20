import { Injectable } from '@nestjs/common';
import { AwardsService } from './awards.interface';
import { Producer } from './awards.dto';
import { Movie } from '../../movie.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AwardsServiceImpl implements AwardsService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
  ) {}

  async getProducersWithIntervals(): Promise<{
    min: Producer[];
    max: Producer[];
  }> {
    const winners = await this.movieRepository.find({
      where: { winner: true },
    });

    const producerMap: Record<string, number[]> = {};
    winners.forEach((movie) => {
      const producers = movie.producers.split(',').map((p) => p.trim());
      producers.forEach((producer) => {
        if (!producerMap[producer]) {
          producerMap[producer] = [];
        }
        producerMap[producer].push(movie.year);
      });
    });

    const intervals = Object.entries(producerMap)
      .filter(([, years]) => years.length > 1)
      .flatMap(([producer, years]) => {
        years.sort((a, b) => a - b);
        return years.slice(1).map((year, index) => ({
          producer,
          interval: year - years[index],
          previousWin: years[index],
          followingWin: year,
        }));
      });

    const minInterval = Math.min(...intervals.map((i) => i.interval));
    const maxInterval = Math.max(...intervals.map((i) => i.interval));

    return {
      min: intervals.filter((i) => i.interval === minInterval),
      max: intervals.filter((i) => i.interval === maxInterval),
    };
  }
}
