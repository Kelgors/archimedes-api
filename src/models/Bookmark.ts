import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn, RelationId } from 'typeorm';
import { List } from './List';
import { Tag } from './Tag';

@Entity()
export class Bookmark {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: String, nullable: true })
  description: string | null;

  @Column()
  url: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date = new Date();

  @ManyToMany(() => Tag, (tag) => tag.bookmarks, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinTable()
  tags: Promise<Tag[]>;

  @RelationId('tags')
  tagIds: string[];

  @ManyToMany(() => List, (list) => list.bookmarks, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinTable()
  lists: Promise<List[]>;

  @RelationId('lists')
  listIds: string[];
}
