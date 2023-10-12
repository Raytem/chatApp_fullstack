export class UserPrintedEvent {
  public static eventName = 'user.printed';
  constructor(public userId: number) {}
}
