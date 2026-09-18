import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    // Option 1: Service account key from environment variable (single-line JSON)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('✅ Firebase Admin initialized from environment variable');
    }
    // Option 2: Service account key from file path
    else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      const serviceAccountPath = path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
      if (fs.existsSync(serviceAccountPath)) {
        const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        console.log('✅ Firebase Admin initialized from file:', serviceAccountPath);
      } else {
        throw new Error(`Service account file not found: ${serviceAccountPath}`);
      }
    }
    // Option 3: Try default location (firebase-service-account.json in project root)
    else {
      const defaultPath = path.resolve(process.cwd(), 'firebase-service-account.json');
      console.log('🔍 Checking for Firebase service account at:', defaultPath);
      if (fs.existsSync(defaultPath)) {
        console.log('✅ Found service account file');
        try {
          const serviceAccount = JSON.parse(fs.readFileSync(defaultPath, 'utf8'));
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
          });
          console.log('✅ Firebase Admin initialized from default file:', defaultPath);
          console.log('   Project ID:', serviceAccount.project_id);
        } catch (parseError: any) {
          console.error('❌ Failed to parse service account file:', parseError.message);
          throw parseError;
        }
      } else {
        console.log('⚠️ Service account file not found at:', defaultPath);
        // Option 4: Project ID (for emulator or default credentials)
        if (process.env.FIREBASE_PROJECT_ID) {
          admin.initializeApp({
            projectId: process.env.FIREBASE_PROJECT_ID,
          });
          console.log('✅ Firebase Admin initialized with project ID');
        }
        // Option 5: Fallback to default credentials (for local development with gcloud)
        else {
          try {
            admin.initializeApp();
            console.log('✅ Firebase Admin initialized with default credentials');
          } catch (defaultError: any) {
            console.error('❌ Failed to initialize with default credentials:', defaultError.message);
            throw defaultError;
          }
        }
      }
    }
  } catch (error: any) {
    console.warn('⚠️ Firebase Admin initialization failed:', error.message);
    console.warn('⚠️ Authentication will not work until Firebase Admin is properly configured');
    console.warn('⚠️ Options:');
    console.warn('   1. Put firebase-service-account.json in project root');
    console.warn('   2. Set FIREBASE_SERVICE_ACCOUNT_PATH in .env');
    console.warn('   3. Set FIREBASE_SERVICE_ACCOUNT_KEY in .env (single-line JSON)');
    console.warn('   4. Set FIREBASE_PROJECT_ID in .env');
  }
}

// Extend Express Request to include user info
declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email: string | undefined;
      };
    }
  }
}

/**
 * Authentication middleware that verifies Firebase ID tokens
 * Extracts user info and attaches it to the request
 */
export async function authenticateUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({ error: 'Authorization header is required' });
      return;
    }

    // Extract token from "Bearer <token>" format
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : authHeader;

    if (!token) {
      res.status(401).json({ error: 'Token is required' });
      return;
    }

    // Verify the token with Firebase Admin
    try {
      // Check if Firebase Admin is initialized
      if (!admin.apps.length) {
        console.error('❌ Firebase Admin is not initialized');
        res.status(500).json({ error: 'Authentication service not configured' });
        return;
      }

      const decodedToken = await admin.auth().verifyIdToken(token);
      
      // Attach user info to request
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
      };

      console.log(`✅ Authenticated user: ${decodedToken.email} (${decodedToken.uid})`);
      next();
    } catch (error: any) {
      console.error('❌ Token verification failed:', error.message);
      console.error('Error code:', error.code);
      console.error('Error stack:', error.stack);
      
      // Provide more specific error messages
      if (error.code === 'auth/argument-error') {
        res.status(401).json({ error: 'Invalid token format' });
      } else if (error.code === 'auth/id-token-expired') {
        res.status(401).json({ error: 'Token expired. Please refresh and try again' });
      } else if (error.code === 'auth/id-token-revoked') {
        res.status(401).json({ error: 'Token revoked. Please sign in again' });
      } else {
        res.status(401).json({ error: `Invalid or expired token: ${error.message}` });
      }
      return;
    }
  } catch (error: any) {
    console.error('❌ Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
    return;
  }
}

/**
 * Middleware to ensure the authenticated user's email matches the requested email
 * Prevents users from accessing other users' resources
 */
export function requireEmailMatch(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'User not authenticated' });
    return;
  }

  // Get email from params (URL path), query params, or body
  const requestedEmail = (req.params.email as string) || (req.query.email as string) || req.body.email;
  
  if (!requestedEmail) {
    res.status(400).json({ error: 'Email is required' });
    return;
  }

  const decodedEmail = decodeURIComponent(requestedEmail);

  // Verify the authenticated user's email matches the requested email
  if (req.user.email !== decodedEmail) {
    console.error(`❌ Email mismatch: authenticated=${req.user.email}, requested=${decodedEmail}`);
    res.status(403).json({ error: 'You do not have permission to access this resource' });
    return;
  }

  next();
}

