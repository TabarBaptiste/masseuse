import { Module } from '@nestjs/common';
import { BlockedSlotsService } from './blocked-slots.service';
import { BlockedSlotsController } from './blocked-slots.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BlockedSlotsController],
  providers: [BlockedSlotsService],
  exports: [BlockedSlotsService],
})
export class BlockedSlotsModule {}
