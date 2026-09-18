# Security Setup Guide

## Overview

The application now uses Firebase Admin SDK to verify authentication tokens on the backend. This prevents users from accessing or modifying other users' properties by sending fake email addresses in API requests.

## Security Improvements

✅ **All property endpoints now require authentication**
- Users must send a valid Firebase ID token in the `Authorization` header
- The backend verifies the token and extracts the user's email
- Users can only access/modify their own properties

✅ **Email verification**
- The backend uses the authenticated user's email from the token
- Email from request body/query params is ignored and replaced with the authenticated email
- Users cannot impersonate other users

## Setup Instructions

### 1. Install Firebase Admin SDK

```bash
npm install firebase-admin
```

### 2. Configure Firebase Admin

You have three options for authentication:

#### Option A: Service Account Key (Recommended for Production)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings → Service Accounts
4. Click "Generate New Private Key"
5. Save the JSON file securely
6. Add to your `.env` file:

```env
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}'
```

**Note:** The entire JSON should be on one line, or use a JSON file path instead.

#### Option B: Project ID (For Development/Emulator)

```env
FIREBASE_PROJECT_ID=your-project-id
```

#### Option C: Default Credentials (For Local Development with gcloud)

If you have `gcloud` CLI configured, Firebase Admin will use default credentials automatically.

### 3. Environment Variables

Add to your `.env` file:

```env
# Firebase Admin (choose one method above)
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
# OR
FIREBASE_PROJECT_ID=your-project-id

# Your existing variables
COSMOS_DB_ENDPOINT=...
COSMOS_DB_KEY=...
# etc.
```

## How It Works

### Backend Flow

1. **Request arrives** with `Authorization: Bearer <token>` header
2. **Middleware verifies token** using Firebase Admin SDK
3. **User email extracted** from verified token
4. **Email from request ignored** - backend uses authenticated email
5. **Property operations** use authenticated email only

### Frontend Flow

1. **User logs in** via Firebase Auth
2. **Token obtained** using `user.getIdToken()`
3. **Token sent** in `Authorization` header with all API requests
4. **Backend verifies** and uses authenticated email

## Protected Endpoints

All property endpoints now require authentication:

- `POST /api/properties` - Create property (uses authenticated email)
- `GET /api/properties/user/:email` - Get user properties (verifies email matches)
- `GET /api/properties/:propertyId` - Get property (verifies ownership)
- `PUT /api/properties/:propertyId` - Update property (verifies ownership)
- `DELETE /api/properties/:propertyId` - Delete property (verifies ownership)

## Testing Security

Try to delete someone else's property:

```bash
# This will FAIL with 403 Forbidden
curl -X DELETE "http://localhost:3000/api/properties/some-property-id?email=someone-else@example.com" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

The backend will:
1. Verify your token
2. Extract YOUR email from the token
3. Compare it with the requested email
4. Return 403 if they don't match

## Troubleshooting

### "Firebase Admin initialization failed"

- Make sure `firebase-admin` is installed: `npm install firebase-admin`
- Check your environment variables are set correctly
- Verify your service account key is valid JSON

### "Invalid or expired token"

- Token might be expired (tokens expire after 1 hour)
- Frontend should automatically refresh tokens
- Check that the token is being sent in the `Authorization` header

### "You do not have permission"

- This is expected! Users can only access their own properties
- The authenticated email doesn't match the requested email
- This is the security feature working correctly


