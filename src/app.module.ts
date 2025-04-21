import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FirebaseModule } from './firebase/firebase.module';
import { UsersModule } from './users/users.module';
import { GroupsModule } from './groups.module';
import { ActivitiesModule } from './activities.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    FirebaseModule,
    UsersModule,
    GroupsModule,
    ActivitiesModule,
  ],
})
export class AppModule {} 