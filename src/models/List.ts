import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Bookmark } from './Bookmark';
import { ListPermission } from './ListPermission';
import { ListVisibility } from './ListVisibility';
import { User } from './User';

@Entity()
export class List {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: String, nullable: true })
  description: string | null;

  @Column(() => ListVisibility)
  visibility: ListVisibility;

  @ManyToOne(() => User, (user) => user.lists, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  owner: Promise<User>;

  @Column()
  ownerId: string;

  @OneToMany(() => ListPermission, (permission) => permission.list)
  permissions: Promise<ListPermission[]>;

  @ManyToMany(() => Bookmark, (bookmark) => bookmark.lists, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  bookmarks: Promise<Bookmark[]>;
}
