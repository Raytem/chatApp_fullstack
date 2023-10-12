import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Transform } from 'class-transformer';
import { AbstractBaseEntity } from '../../abstractBase.entity';
import { FileEntity } from 'src/realizations/file/entities/file.entity';
import { UserEntity } from 'src/realizations/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';

@Entity('product')
export class ProductEntity extends AbstractBaseEntity {
  @ApiProperty()
  @Transform(({ value }) => value.map((file: FileEntity) => file.link))
  @OneToMany(() => FileEntity, (file) => file.product, {
    eager: true,
    onUpdate: 'CASCADE',
    cascade: true,
  })
  photos: FileEntity[];

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @Column()
  description: string;

  @ApiProperty()
  @Column()
  price: number;

  @ApiProperty({ type: () => UserEntity })
  @ManyToOne(() => UserEntity, (user) => user.products, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  constructor(partial?: Partial<ProductEntity>) {
    super();
    Object.assign(this, partial);
  }
}
