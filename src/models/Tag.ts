import { Column, Entity, Index, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Bookmark } from './Bookmark';

@Entity()
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index({ unique: true })
  name: string;

  @ManyToMany(() => Bookmark, (bookmark) => bookmark.tags, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  bookmarks: Promise<Bookmark[]>;
}
