import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ColorGame } from './color-game.entity';

@Entity('game_results')
export class GameResult {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  period_id: string;

  @Column()
  number: number; // 0-9

  @Column()
  color: string; // 'red', 'green', 'black'

  @Column()
  size: string; // 'big', 'small'

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  duration: string;

  @ManyToOne(() => ColorGame, (game) => game.game_results)
  @JoinColumn({ name: 'period_id' })
  game: ColorGame;
}