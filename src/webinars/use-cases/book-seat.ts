import { IMailer } from 'src/core/ports/mailer.interface';
import { Executable } from 'src/shared/executable';
import { User } from 'src/users/entities/user.entity';
import { IUserRepository } from 'src/users/ports/user-repository.interface';
import { IParticipationRepository } from 'src/webinars/ports/participation-repository.interface';
import { IWebinarRepository } from 'src/webinars/ports/webinar-repository.interface';
import { AlreadyParticipatingException } from '../exceptions/Already-Participating-Exception';
import { WebinarFullException } from '../exceptions/Webinar-Full-Exception';


type Request = {
  webinarId: string;
  user: User;
};
type Response = void;

export class BookSeat implements Executable<Request, Response> {
  constructor(
    private readonly participationRepository: IParticipationRepository,
    private readonly userRepository: IUserRepository | null,
    private readonly webinarRepository: IWebinarRepository,
    private readonly mailer: IMailer,
  ) {}

  async execute({ webinarId, user }: Request): Promise<Response> {
   
    // Ajout : Vérification si le webinaire est présent dans le dépôt
    const webinar = await this.webinarRepository.findById(webinarId);
    if (!webinar) {
      throw new Error('Webinaire non trouvé.'); 
    }

    
    // Ajout : Utilisation de participationRepository pour vérifier si l'utilisateur est déjà inscrit
    const isParticipating = await this.participationRepository.isUserParticipating(
      webinarId,
      user.props.id,
    );
    if (isParticipating) {
      throw new AlreadyParticipatingException(); // Ajout : Exception pour utilisateur déjà inscrit
    }

   
    // Ajout : Vérification si des places sont encore disponibles dans le webinaire
    if (!webinar.hasAvailableSeats()) {
      throw new WebinarFullException(); 
    }


    // Ajout : Enregistrement de l'utilisateur comme participant dans participationRepository
    await this.participationRepository.addParticipant(webinarId, user.props.id);


    // Modification : Réduction du nombre de places disponibles et sauvegarde du webinaire
    webinar.props.seats -= 1; 
    await this.webinarRepository.save(webinar);


    // Ajout : Envoi d'un email à l'organisateur pour notifier la nouvelle inscription
    await this.mailer.send({
      to: webinar.props.organizerId,
      subject: 'Nouveau participant à votre webinaire',
      body: `L'utilisateur avec l'email ${user.props.email} s'est inscrit au webinaire "${webinar.props.title}".`,
    });
    
  }
}
