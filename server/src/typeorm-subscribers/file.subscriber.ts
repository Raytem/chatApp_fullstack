import { FileEntity } from 'src/realizations/file/entities/file.entity';
import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  RemoveEvent,
} from 'typeorm';

@EventSubscriber()
export class FileEntitySubscriber
  implements EntitySubscriberInterface<FileEntity>
{
  constructor(dataSource: DataSource) {
    // dataSource.subscribers.push(this);
  }

  listenTo(): string | Function {
    return FileEntity;
  }

  beforeInsert(event: InsertEvent<FileEntity>): void | Promise<any> {
    console.log('------file insert');
  }

  beforeRemove(event: RemoveEvent<FileEntity>): void | Promise<any> {
    console.log('------file remove');
  }
}
