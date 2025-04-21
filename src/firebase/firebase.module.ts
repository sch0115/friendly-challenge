import { Module, Global } from '@nestjs/common';
import { FirebaseService } from './firebase.service';

@Global() // Make the module global so FirebaseService is available everywhere
@Module({
  providers: [FirebaseService],
  exports: [FirebaseService], // Export the service so other modules can import it
})
export class FirebaseModule {} 