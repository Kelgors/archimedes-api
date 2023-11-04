import { Column, Entity } from 'typeorm';

export enum Visibility {
  /** visible on an easy-to-access web page */
  PUBLIC = 'PUBLIC',
  /** visible by sharing a link */
  SHAREABLE = 'SHAREABLE',
  /** only for your eyes */
  PRIVATE = 'PRIVATE',
}

@Entity()
export class ListVisibility {
  @Column({ default: Visibility.PRIVATE })
  anonymous: Visibility;

  @Column({ default: Visibility.PRIVATE })
  instance: Visibility;
}
