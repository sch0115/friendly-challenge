import { Module, forwardRef } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UserService } from './users.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [UsersController],
  providers: [UserService],
  exports: [UserService]
})
export class UsersModule {}
