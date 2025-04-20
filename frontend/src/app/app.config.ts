import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { authInterceptor } from './interceptors/auth.interceptor';

const firebaseConfig = {
  projectId: "friendly-challange",
  appId: "1:1061516672820:web:807cd57897200b258f2f61",
  databaseURL: "https://friendly-challange-default-rtdb.europe-west1.firebasedatabase.app",
  storageBucket: "friendly-challange.firebasestorage.app",
  apiKey: "AIzaSyD6fARYvb8Bsvam0fH5FaLPlVrng1U2kuw",
  authDomain: "friendly-challange.firebaseapp.com",
  messagingSenderId: "1061516672820",
  measurementId: "G-CWTRM3ME73"
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideDatabase(() => getDatabase()),
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
};
