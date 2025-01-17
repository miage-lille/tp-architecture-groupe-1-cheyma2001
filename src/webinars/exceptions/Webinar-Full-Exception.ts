export class WebinarFullException extends Error {
  constructor() {
    super('Le webinaire est complet.');
  }
}
