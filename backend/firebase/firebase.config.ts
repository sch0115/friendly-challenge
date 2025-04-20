import * as admin from 'firebase-admin';
// Make sure the path to your service account key is correct
import * as serviceAccount from './serviceAccountKey.json';

// Type assertion to satisfy TypeScript's expectations for the credential structure
const serviceAccountParams = {
  type: serviceAccount.type,
  projectId: serviceAccount.project_id,
  privateKeyId: serviceAccount.private_key_id,
  privateKey: serviceAccount.private_key,
  clientEmail: serviceAccount.client_email,
  clientId: serviceAccount.client_id,
  authUri: serviceAccount.auth_uri,
  tokenUri: serviceAccount.token_uri,
  authProviderX509CertUrl: serviceAccount.auth_provider_x509_cert_url,
  clientX509CertUrl: serviceAccount.client_x509_cert_url,
  // Include universe_domain if it exists in your key file
  ...(serviceAccount.universe_domain && { universeDomain: serviceAccount.universe_domain }),
};

export const firebaseAdmin = admin.initializeApp({
  credential: admin.credential.cert(serviceAccountParams as admin.ServiceAccount),
});

console.log('Firebase Admin SDK initialized successfully.'); // Optional: Add log for verification 