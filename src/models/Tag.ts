import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Bookmark } from './Bookmark';

@Entity()
export class Tag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: String, nullable: true })
  description: string | null;

  @ManyToMany(() => Bookmark, (bookmark) => bookmark.tags)
  bookmarks: Promise<Bookmark[]>;
}
