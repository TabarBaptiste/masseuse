import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlockedSlotDto, UpdateBlockedSlotDto } from './dto';

@Injectable()
export class BlockedSlotsService {
  constructor(private prisma: PrismaService) {}

  async create(createBlockedSlotDto: CreateBlockedSlotDto) {
    return this.prisma.blockedSlot.create({
      data: {
        date: new Date(createBlockedSlotDto.date),
        startTime: createBlockedSlotDto.startTime,
        endTime: createBlockedSlotDto.endTime,
        reason: createBlockedSlotDto.reason,
      },
    });
  }

  async findAll(fromDate?: string, toDate?: string) {
    const where: any = {};
    
    if (fromDate || toDate) {
      where.date = {};
      if (fromDate) {
        where.date.gte = new Date(fromDate);
      }
      if (toDate) {
        where.date.lte = new Date(toDate);
      }
    }

    return this.prisma.blockedSlot.findMany({
      where,
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' },
      ],
    });
  }

  async findOne(id: string) {
    const blockedSlot = await this.prisma.blockedSlot.findUnique({
      where: { id },
    });

    if (!blockedSlot) {
      throw new NotFoundException('Blocked slot not found');
    }

    return blockedSlot;
  }

  async update(id: string, updateBlockedSlotDto: UpdateBlockedSlotDto) {
    await this.findOne(id); // Check if blocked slot exists

    const data: any = { ...updateBlockedSlotDto };
    if (updateBlockedSlotDto.date) {
      data.date = new Date(updateBlockedSlotDto.date);
    }

    return this.prisma.blockedSlot.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Check if blocked slot exists
    
    return this.prisma.blockedSlot.delete({
      where: { id },
    });
  }
}
