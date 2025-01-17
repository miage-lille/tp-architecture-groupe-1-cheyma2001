import { Webinar } from 'src/webinars/entities/webinar.entity';
import { IWebinarRepository } from 'src/webinars/ports/webinar-repository.interface';

export class InMemoryWebinarRepository implements IWebinarRepository {
  constructor(public database: Webinar[] = []) {}

  async create(webinar: Webinar): Promise<void> {
    this.database.push(webinar);
  }
  async findById(webinarId: string): Promise<Webinar | null> {
    const webinar = this.database.find((w) => w.props.id === webinarId);
    return webinar || null;
  }

  async save(webinar: Webinar): Promise<void> {
    const index = this.database.findIndex(
      (w) => w.props.id === webinar.props.id,
    );
    if (index === -1) {
      throw new Error(`Webinaire avec l'ID ${webinar.props.id} introuvable`);
    }
    this.database[index] = webinar;
  }
}
