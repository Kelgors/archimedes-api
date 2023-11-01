import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { List } from './List';
import { User } from './User';

@Entity()
export class ListPermission {
  @ManyToOne(() => List, (list) => list.permissions, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  list: Promise<List>;

  @PrimaryColumn()
  listId: List['id'];

  @ManyToOne(() => User, (user) => user.permissions)
  @JoinColumn()
  user: Promise<User>;

  @PrimaryColumn()
  userId: User['id'];

  @Column({ default: false })
  isWritable: boolean;
}
