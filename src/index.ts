import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import {
  initializeSupabaseDb,
  createProperty,
  getUserProperties,
  getPropertyById,
  updateProperty,
  deleteProperty,
  getAllProperties,
  Property,
  isSupabaseInitialized,
  getContainerInfo,
} from './services/supabaseDb';
import { authenticateUser } from './middleware/auth';
import admin from 'firebase-admin';

const app = express();
const PORT = process.env.PORT || 3000;

// Increase body size limit to handle base64 images (50MB limit)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    res.header('Access-Control-Allow-Origin', '*');
  } else if (process.env.NODE_ENV !== 'production') {
    res.header('Access-Control-Allow-Origin', '*');
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

let supabaseInitialized = false;

async function startServer() {
  try {
    console.log('🔄 Initializing Supabase...');
    await initializeSupabaseDb();
    supabaseInitialized = true;
    console.log('✅ Supabase initialized successfully');
  } catch (error: any) {
    console.error('❌ Supabase initialization failed:', error);
    console.warn('⚠️ Server will start, but database operations will fail');
    console.warn('⚠️ Make sure your .env file has:');
    console.warn('   - SUPABASE_URL');
    console.warn('   - SUPABASE_SERVICE_ROLE_KEY');
    console.warn('⚠️ And that you ran supabase/schema.sql in the Supabase SQL Editor');
    supabaseInitialized = false;
  }

  const serverPort = process.env.PORT || 3000;

  app.listen(serverPort, () => {
    console.log(`🚀 Server is running on port ${serverPort}`);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`📡 API endpoints available at http://localhost:${serverPort}/api`);
      console.log(`💚 Health check: http://localhost:${serverPort}/health`);
    }
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`✅ CORS allowed origins: ${allowedOrigins.join(', ')}`);
    if (!supabaseInitialized) {
      console.warn('⚠️ WARNING: Supabase not initialized - API endpoints will fail');
    }
  });
}

startServer();

app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    supabase: isSupabaseInitialized() ? 'connected' : 'not initialized',
    firebaseAdmin: admin.apps.length > 0 ? 'initialized' : 'not initialized',
  });
});

app.get('/api', (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to Landfello API',
    status: 'running',
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/properties', authenticateUser, async (req: Request, res: Response) => {
  try {
    console.log('POST /api/properties - Request received');
    const property: Property = req.body;

    if (!req.user || !req.user.uid) {
      return res.status(401).json({ error: 'User ID not found in token' });
    }

    property.userId = req.user.uid;

    const propertySize = JSON.stringify(property).length;
    console.log(`Property data size: ${(propertySize / 1024).toFixed(2)} KB`);
    if (property.images && property.images.length > 0) {
      console.log(`Number of images: ${property.images.length}`);
      const totalImageSize = property.images.reduce((sum, img) => sum + (img?.length || 0), 0);
      console.log(`Total image data size: ${(totalImageSize / 1024 / 1024).toFixed(2)} MB`);
    }

    console.log(`Creating property for authenticated user: ${req.user.uid}`);
    const created = await createProperty(property);
    console.log(`✅ Property created successfully: ${created.propertyID}`);
    res.status(201).json(created);
  } catch (error: any) {
    console.error('❌ Error creating property:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message || 'Failed to create property' });
  }
});

app.get('/api/properties/user/:userId', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!req.user || req.user.uid !== userId) {
      return res.status(403).json({ error: 'You do not have permission to access this resource' });
    }

    console.log(`GET /api/properties/user/${userId} (authenticated: ${req.user.uid})`);
    const properties = await getUserProperties(userId);
    console.log(`✅ Found ${properties.length} properties for user ${userId}`);
    res.json(properties);
  } catch (error: any) {
    console.error('❌ Error fetching user properties:', error);
    res.status(500).json({
      error: error.message || 'Failed to fetch properties',
      ...(process.env.NODE_ENV !== 'production' && { stack: error.stack }),
    });
  }
});

app.get('/api/properties/:propertyId', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { propertyId } = req.params;
    const userId = req.query.userId as string;

    if (!userId) {
      return res.status(400).json({ error: 'userId query parameter is required' });
    }

    if (!req.user || req.user.uid !== userId) {
      return res.status(403).json({ error: 'You do not have permission to access this property' });
    }

    const property = await getPropertyById(propertyId, userId);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    if (property.userId !== userId) {
      return res.status(403).json({ error: 'You do not have permission to access this property' });
    }

    res.json(property);
  } catch (error: any) {
    console.error('❌ Error fetching property:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch property' });
  }
});

app.put('/api/properties/:propertyId', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { propertyId } = req.params;
    const updates = req.body;

    if (!req.user || !req.user.uid) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const authenticatedUserId = req.user.uid;

    delete updates.userId;
    delete updates.propertyID;

    const updated = await updateProperty(
      propertyId,
      authenticatedUserId,
      updates,
      req.user.email
    );

    if (updated.userId !== authenticatedUserId) {
      return res.status(403).json({ error: 'You do not have permission to update this property' });
    }

    res.json(updated);
  } catch (error: any) {
    console.error('❌ Error updating property:', error);

    if (error.message?.includes('Property not found')) {
      return res.status(404).json({ error: 'Property not found' });
    }
    if (error.message?.includes('belongs to a different user')) {
      return res.status(403).json({ error: 'You do not have permission to update this property' });
    }

    res.status(500).json({ error: error.message || 'Failed to update property' });
  }
});

app.delete('/api/properties/:propertyId', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { propertyId } = req.params;
    const userId = req.query.userId as string;

    if (!userId) {
      return res.status(400).json({ error: 'userId query parameter is required' });
    }

    if (!req.user || req.user.uid !== userId) {
      return res.status(403).json({ error: 'You do not have permission to delete this property' });
    }

    const property = await getPropertyById(propertyId, userId);
    if (property && property.userId !== userId) {
      return res.status(403).json({ error: 'You do not have permission to delete this property' });
    }

    await deleteProperty(propertyId, req.user.uid);
    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting property:', error);
    res.status(500).json({ error: error.message || 'Failed to delete property' });
  }
});

app.get('/api/debug/container', async (req: Request, res: Response) => {
  try {
    const info = await getContainerInfo();
    res.json({
      status: 'success',
      databaseInfo: info,
    });
  } catch (error: any) {
    res.status(500).json({
      error: error.message || 'Failed to get database info',
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
    });
  }
});

app.get('/api/debug/property/:propertyId', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { propertyId } = req.params;
    const property = await getPropertyById(propertyId, req.user!.uid);

    if (!property) {
      return res.status(404).json({ error: 'Property not found for this user' });
    }

    res.json({
      propertyId: property.propertyID,
      storedUserId: property.userId,
      storedEmail: property.email,
      authenticatedUserId: req.user?.uid,
      authenticatedEmail: req.user?.email,
      userIdMatch: property.userId === req.user?.uid,
      fullProperty: property,
    });
  } catch (error: any) {
    console.error('❌ Debug endpoint error:', error);
    res.status(500).json({ error: error.message || 'Failed to debug property' });
  }
});

app.get('/api/properties', async (req: Request, res: Response) => {
  try {
    const filters: any = {};

    if (req.query.country) filters.country = req.query.country as string;
    if (req.query.propertyType) filters.propertyType = req.query.propertyType as string;
    if (req.query.listingType) filters.listingType = req.query.listingType as 'sale' | 'rent';
    if (req.query.minPrice) filters.minPrice = Number(req.query.minPrice);
    if (req.query.maxPrice) filters.maxPrice = Number(req.query.maxPrice);

    console.log('GET /api/properties - Filters:', filters);
    const properties = await getAllProperties(filters);
    console.log(`✅ Returning ${properties.length} properties`);
    res.json(properties);
  } catch (error: any) {
    console.error('❌ GET /api/properties failed:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch properties' });
  }
});

app.use((err: any, req: Request, res: Response, next: express.NextFunction) => {
  console.error('UNHANDLED ERROR:', err);
  console.error('Error stack:', err.stack);
  res.status(500).json({
    error: err?.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));

app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});
