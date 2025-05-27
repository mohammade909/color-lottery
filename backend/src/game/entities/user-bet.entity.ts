import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ColorGame } from './color-game.entity';

@Entity('user_bets')
export class UserBet {
  @PrimaryColumn()
  id: string;

  @Column()
  user_id: string;

  @Column()
  period_id: string;
  @Column()
  period: string;

  @Column()
  bet_type: string; // 'color', 'number', 'size'

  @Column()
  bet_value: string; // 'red', 'green', 'black', '0-9', 'big', 'small'

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  multiplier: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  total_amount: number;

  @Column({ nullable: true })
  result: string; // 'win', 'lose'

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  win_amount: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;

  @ManyToOne(() => ColorGame, (game) => game.user_bets)
  @JoinColumn({ name: 'period_id' })
  game: ColorGame;
}