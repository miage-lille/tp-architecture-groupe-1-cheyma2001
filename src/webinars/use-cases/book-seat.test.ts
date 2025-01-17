import { BookSeat } from './book-seat';
import { InMemoryWebinarRepository } from '../adapters/webinar-repository.in-memory';

import { IMailer } from 'src/core/ports/mailer.interface';
import { Webinar } from '../entities/webinar.entity';
import { User } from 'src/users/entities/user.entity';
import { WebinarFullException } from '../exceptions/Webinar-Full-Exception';
import { AlreadyParticipatingException } from '../exceptions/Already-Participating-Exception';
import { InMemoryParticipationRepository } from '../adapters/participation-repository.in-memory';

class MockMailer implements IMailer {
  public sentEmails: { to: string; subject: string; body: string }[] = [];

  async send(email: { to: string; subject: string; body: string }): Promise<void> {
    this.sentEmails.push(email);
  }
}

describe('BookSeat', () => {
  let webinarRepository: InMemoryWebinarRepository;
  let participationRepository: InMemoryParticipationRepository;
  let mailer: MockMailer;
  let bookSeat: BookSeat;

  beforeEach(() => {
    webinarRepository = new InMemoryWebinarRepository();
    participationRepository = new InMemoryParticipationRepository();
    mailer = new MockMailer();
    bookSeat = new BookSeat(participationRepository, null, webinarRepository, mailer);
  });

  it('should book a seat if all conditions are met', async () => {
    const webinar = new Webinar({
      id: 'webinar-1',
      organizerId: 'organizer@example.com',
      title: 'Test Webinar',
      startDate: new Date(),
      endDate: new Date(),
      seats: 10,
    });
    const user = new User({
      id: 'user-1',
      email: 'user1@example.com',
      password: 'password',
   
    });

    await webinarRepository.create(webinar);

    await bookSeat.execute({ webinarId: 'webinar-1', user });

    const updatedWebinar = await webinarRepository.findById('webinar-1');
    const isParticipating = await participationRepository.isUserParticipating(
      'webinar-1',
      'user-1',
    );

    expect(updatedWebinar?.props.seats).toBe(9);
    expect(isParticipating).toBe(true);
    expect(mailer.sentEmails.length).toBe(1);
    expect(mailer.sentEmails[0].to).toBe('organizer@example.com');
  });

  it('should throw an error if the webinar is full', async () => {
    const webinar = new Webinar({
      id: 'webinar-2',
      organizerId: 'organizer@example.com',
      title: 'Full Webinar',
      startDate: new Date(),
      endDate: new Date(),
      seats: 0, // Aucun siège disponible
    });
    const user = new User({
      id: 'user-2',
      email: 'user2@example.com',
      password: 'password',
      
    });

    await webinarRepository.create(webinar);

    await expect(bookSeat.execute({ webinarId: 'webinar-2', user })).rejects.toThrow(
      WebinarFullException,
    );
  });

  it('should throw an error if the user is already participating', async () => {
    const webinar = new Webinar({
      id: 'webinar-3',
      organizerId: 'organizer@example.com',
      title: 'Test Webinar',
      startDate: new Date(),
      endDate: new Date(),
      seats: 10,
    });
    const user = new User({
      id: 'user-3',
      email: 'user3@example.com',
      password: 'password',
     
    });

    await webinarRepository.create(webinar);
    await participationRepository.addParticipant('webinar-3', 'user-3');

    await expect(bookSeat.execute({ webinarId: 'webinar-3', user })).rejects.toThrow(
      AlreadyParticipatingException,
    );
  });

  it('should throw an error if the webinar does not exist', async () => {
    const user = new User({
      id: 'user-4',
      email: 'user4@example.com',
      password: 'password',
      
    });

    await expect(bookSeat.execute({ webinarId: 'non-existent-webinar', user })).rejects.toThrow(
      'Webinaire non trouvé.',
    );
  });
});
