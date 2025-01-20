import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { CsvDataLoaderService } from './data-loader.service';

@Injectable()
export class MovieInitService implements OnApplicationBootstrap {
  constructor(public readonly csvDataLoaderService: CsvDataLoaderService) {}

  async onApplicationBootstrap() {
    await this.csvDataLoaderService.loadData();
  }
}
