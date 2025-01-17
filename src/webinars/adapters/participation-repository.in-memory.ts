import { IParticipationRepository } from 'src/webinars/ports/participation-repository.interface';
import { Participation } from 'src/webinars/entities/participation.entity';

export class InMemoryParticipationRepository implements IParticipationRepository {
  private participations: Participation[] = [];

  async addParticipant(webinarId: string, userId: string): Promise<void> {
    this.participations.push(new Participation({ webinarId, userId }));
  }

  async findByWebinarId(webinarId: string): Promise<Participation[]> {
    return this.participations.filter((p) => p.props.webinarId === webinarId);
  }

  async save(participation: Participation): Promise<void> {
    const index = this.participations.findIndex(
      (p) =>
        p.props.webinarId === participation.props.webinarId &&
        p.props.userId === participation.props.userId,
    );
    if (index === -1) {
      this.participations.push(participation);
    } else {
      this.participations[index] = participation;
    }
  }

  async isUserParticipating(webinarId: string, userId: string): Promise<boolean> {
    return this.participations.some(
      (p) => p.props.webinarId === webinarId && p.props.userId === userId,
    );
  }
}
