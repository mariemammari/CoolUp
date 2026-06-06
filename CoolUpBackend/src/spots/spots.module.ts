import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { SpotsController } from './spots.controller';
import { SpotsService } from './spots.service';

@Module({
    imports: [PrismaModule, ScheduleModule, HttpModule, ConfigModule],
    controllers: [SpotsController],
    providers: [SpotsService],
})
export class SpotsModule { }
