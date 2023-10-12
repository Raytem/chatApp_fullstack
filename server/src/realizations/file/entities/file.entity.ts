import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { AbstractBaseEntity } from '../../abstractBase.entity';
import { ProductEntity } from 'src/realizations/product/entities/product.entity';
import { UserEntity } from 'src/realizations/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';

export function toUrl(fileName: string) {
  return `${process.env.SERVER_URL}/${process.env.FILE_DESTINATION}/${fileName}`;
}

@Entity('file')
export class FileEntity extends AbstractBaseEntity {
  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @Column()
  size_bytes: number;

  @ApiProperty()
  @Column({ nullable: true })
  googleFileId: string;

  @ApiProperty()
  @Column({ nullable: true })
  link: string;

  @OneToOne(() => UserEntity, (user) => user.avatar)
  user: UserEntity;

  @Exclude()
  @ManyToOne(() => ProductEntity, (product) => product.photos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;

  constructor(partial?: Partial<FileEntity>) {
    super();
    Object.assign(this, partial);
  }
}
