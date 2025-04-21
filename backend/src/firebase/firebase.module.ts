import { Module, Global } from '@nestjs/common';
import { FIREBASE_ADMIN } from './firebase.constants';
import { firebaseAdmin } from '../../firebase/firebase.config'; // Import the initialized instance

const firebaseAdminProvider = {
  provide: FIREBASE_ADMIN,
  useValue: firebaseAdmin // Provide the already initialized instance
};

@Global() // Make the provider available globally
@Module({
  providers: [firebaseAdminProvider],
  exports: [firebaseAdminProvider], // Export the provider
})
export class FirebaseModule {} 