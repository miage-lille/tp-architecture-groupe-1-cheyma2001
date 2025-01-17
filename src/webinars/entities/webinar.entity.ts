import { differenceInDays } from 'date-fns';
import { Entity } from 'src/shared/entity';

type WebinarProps = {
  id: string;
  organizerId: string;
  title: string;
  startDate: Date;
  endDate: Date;
  seats: number;
};


export class Webinar extends Entity<WebinarProps> {
  private readonly participants: string[] = [];
  isTooSoon(now: Date): boolean {
    const diff = differenceInDays(this.props.startDate, now);
    return diff < 3;
  }

  hasTooManySeats(): boolean {
    return this.props.seats > 1000;
  }

  hasNotEnoughSeats(): boolean {
    return this.props.seats < 1;
  }

  isOrganizer(userId: string) {
    return this.props.organizerId === userId;
  }

  hasAvailableSeats(): boolean {
    return this.props.seats > 0;
  }
  
  isUserParticipating(userId: string): boolean {
    return this.participants.includes(userId);
  }


addParticipant(userId: string): void {
  if (!this.hasAvailableSeats()) {
    throw new Error('Le webinaire est complet.');
  }
  if (this.isUserParticipating(userId)) {
    throw new Error('L’utilisateur participe déjà à ce webinaire.');
  }

  this.participants.push(userId);
  this.props.seats -= 1; // Réduire le nombre de places disponibles
}
}
/**Les ajouts nécessaires incluent :

    La gestion des participants.
    La vérification des places disponibles.
    La vérification de l'inscription des utilisateurs.
     */