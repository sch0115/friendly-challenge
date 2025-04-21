import { Injectable } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  User,
  getIdToken,
  setPersistence,
  browserLocalPersistence, // Or browserSessionPersistence
  authState, // Import authState
  UserCredential
} from '@angular/fire/auth'; // Using AngularFire
import { Observable } from 'rxjs'; // Import Observable
import { map } from 'rxjs/operators'; // Import map operator

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Observable to track authentication state
  readonly isLoggedIn$: Observable<boolean>;
  readonly user$: Observable<User | null>;

  constructor(private auth: Auth) {
    // Set session persistence (e.g., keep user logged in across browser sessions)
    // Use browserLocalPersistence for persistent login, or browserSessionPersistence for session-only
    setPersistence(this.auth, browserLocalPersistence)
      .catch((error) => {
        console.error('Error setting auth persistence', error);
      });

    // Initialize observables based on Firebase auth state
    this.user$ = authState(this.auth);
    this.isLoggedIn$ = this.user$.pipe(map(user => !!user));
  }

  /**
   * Initiates the Google Sign-in popup flow.
   * @returns A promise that resolves with the UserCredential on successful sign-in.
   */
  async signInWithGoogle(): Promise<UserCredential> {
    console.log('Signing in with Google');
    const provider = new GoogleAuthProvider();
    try {
      const userCredential = await signInWithPopup(this.auth, provider);
      console.log('Signed in with Google', userCredential.user);
      return userCredential;
    } catch (error) {
      console.error('Google Sign-in error', error);
      throw error; // Re-throw the error for the caller to handle
    }
  }

  /**
   * Signs the current user out.
   * @returns A promise that resolves when sign-out is complete.
   */
  async signOut() {
    try {
      await firebaseSignOut(this.auth);
      console.log('User signed out');
    } catch (error) {
      console.error('Sign out error', error);
      throw error;
    }
  }

  /**
   * Gets the current authenticated user object.
   * Note: It's often better to use onAuthStateChanged for real-time state.
   * @returns The current Firebase User object or null.
   */
  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  /**
   * Gets the Firebase ID token for the current user.
   * @param forceRefresh Force refresh the token (optional).
   * @returns A promise that resolves with the ID token string or null if no user is signed in.
   */
  async getIdToken(forceRefresh: boolean = false): Promise<string | null> {
    const user = this.getCurrentUser();
    if (!user) {
      return null;
    }
    try {
      return await getIdToken(user, forceRefresh);
    } catch (error) {
      console.error('Error getting ID token', error);
      return null;
    }
  }
} 