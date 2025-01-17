import { Participation } from 'src/webinars/entities/participation.entity';

export interface IParticipationRepository {
  addParticipant(webinarId: any, id: any): unknown;
  findByWebinarId(webinarId: string): Promise<Participation[]>;
  save(participation: Participation): Promise<void>;
  isUserParticipating(webinarId: string, userId: string): Promise<boolean>;
}
