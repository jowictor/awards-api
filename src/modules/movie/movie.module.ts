import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MovieController } from './movie.controller';
import { Movie } from './movie.entity';
import { CsvDataLoaderService } from './contexts/data-loading/data-loader.service';
import { AwardsServiceImpl } from './contexts/awards/awards.service';
import { AWARDS_SERVICE } from './contexts/awards/awards.interface';
import { MovieInitService } from './contexts/data-loading/movie-init.service';

@Module({
  imports: [TypeOrmModule.forFeature([Movie])],
  controllers: [MovieController],
  providers: [
    CsvDataLoaderService,
    MovieInitService,
    {
      provide: AWARDS_SERVICE,
      useClass: AwardsServiceImpl,
    },
  ],
  exports: [CsvDataLoaderService, AWARDS_SERVICE],
})
export class MovieModule {}
