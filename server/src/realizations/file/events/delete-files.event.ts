export class DeleteFilesEvent {
  public static eventName = 'file.delete';
  constructor(public fileNames: string[]) {}
}
