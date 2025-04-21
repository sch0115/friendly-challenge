import { Module } from '@nestjs/common';
import { ActivityLogsController } from './activity-logs.controller';
import { ActivityLogsService } from './activity-logs.service';

@Module({
  controllers: [ActivityLogsController],
  providers: [ActivityLogsService]
})
export class ActivityLogsModule {}
