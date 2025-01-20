import { Producer } from './awards.dto';

export const AWARDS_SERVICE = 'AWARDS_SERVICE';
export interface AwardsService {
  getProducersWithIntervals(): Promise<{ min: Producer[]; max: Producer[] }>;
}
