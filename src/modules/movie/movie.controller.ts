import { Controller, Get, Inject } from '@nestjs/common';
import {
  AWARDS_SERVICE,
  AwardsService,
} from './contexts/awards/awards.interface';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('movies')
@ApiTags('Movies')
export class MovieController {
  constructor(
    @Inject(AWARDS_SERVICE) private readonly awardsService: AwardsService,
  ) {}

  @Get('/producers/intervals')
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        min: [
          {
            producer: 'Producer 1',
            interval: 1,
            previousWin: 2008,
            followingWin: 2009,
          },
        ],
        max: [
          {
            producer: 'Producer 2',
            interval: 99,
            previousWin: 1900,
            followingWin: 1999,
          },
        ],
      },
    },
  })
  async getProducersIntervals() {
    return this.awardsService.getProducersWithIntervals();
  }
}
