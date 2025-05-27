// src/color-game/color-game.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ColorGameController } from './color-game.controller';
import { ColorGameService } from './color-game.service';
import { ColorGame } from './entities/color-game.entity';
import { UserBet } from './entities/user-bet.entity';
import { GameResult } from './entities/game-result.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ColorGame, UserBet, GameResult, User]),
    ScheduleModule.forRoot(),
  ],
  controllers: [ColorGameController],
  providers: [ColorGameService],
  exports: [ColorGameService],
})
export class ColorGameModule {}