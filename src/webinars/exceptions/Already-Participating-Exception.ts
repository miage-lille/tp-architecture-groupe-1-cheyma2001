export class AlreadyParticipatingException extends Error {
  constructor() {
    super('Vous participez déjà à ce webinaire.');
  }
}
