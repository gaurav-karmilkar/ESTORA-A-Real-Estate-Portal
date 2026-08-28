import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { dbManager, User, Property, Favorite, Inquiry } from './src/server/db.js';

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'estoraSuperSecretKeyWithMinimum256BitsLengthForSecureHMACSHA256Algorithms12345';

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Upload directory setup
const uploadDir = path.join(process.cwd(), 'uploads', 'properties');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'property-' + uniqueSuffix + ext);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Helper for JWT Auth Middleware
export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: 'USER' | 'AGENT' | 'ADMIN';
  };
}

const authenticateJwt = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string; role: 'USER' | 'AGENT' | 'ADMIN' };
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

const optionalJwt = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string; role: 'USER' | 'AGENT' | 'ADMIN' };
      req.user = decoded;
    } catch (e) {
      // ignore
    }
  }
  next();
};

const requireRole = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied: insufficient permissions' });
    }
    next();
  };
};

const sanitizeUser = (user: User) => {
  const { password, ...safeUser } = user;
  return safeUser;
};

// ==========================================
// REST API ROUTES
// ==========================================

// --- AUTHENTICATION ---

app.post(['/api/auth/register', '/auth/register'], async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password, role, agency } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }

    const db = dbManager.getDatabase();
    const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email address is already registered' });
    }

    const assignedRole = role === 'AGENT' ? 'AGENT' : role === 'ADMIN' ? 'ADMIN' : 'USER';
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser: User = {
      id: db.users.length ? Math.max(...db.users.map(u => u.id)) + 1 : 1,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone || '',
      password: hashedPassword,
      role: assignedRole,
      status: 'ACTIVE',
      agency: agency || (assignedRole === 'AGENT' ? 'Independent Realtor' : undefined),
      isVerified: assignedRole === 'ADMIN' || assignedRole === 'USER',
      avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80`,
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    dbManager.save();

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        type: 'Bearer',
        user: sanitizeUser(newUser)
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

app.post(['/api/auth/login', '/auth/login'], async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const db = dbManager.getDatabase();
    const user = db.users.find(u => u.email.toLowerCase() === String(email).toLowerCase().trim());
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.status === 'SUSPENDED' || user.status === 'INACTIVE') {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated or suspended. Please contact admin.' });
    }

    const isMatch = await bcrypt.compare(String(password), user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        type: 'Bearer',
        user: sanitizeUser(user)
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

app.get(['/api/auth/me', '/auth/me'], authenticateJwt, (req: AuthenticatedRequest, res: Response) => {
  const db = dbManager.getDatabase();
  const user = db.users.find(u => u.id === req.user!.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  return res.json({
    success: true,
    data: sanitizeUser(user)
  });
});

// --- PROPERTIES API ---

const attachAgentToProperty = (property: Property, dbUsers: User[]) => {
  const agent = dbUsers.find(u => u.id === property.agentId);
  return {
    ...property,
    agent: agent ? sanitizeUser(agent) : null
  };
};

app.get('/api/properties', (req: Request, res: Response) => {
  const db = dbManager.getDatabase();
  let list = db.properties.map(p => attachAgentToProperty(p, db.users));

  const {
    location,
    city,
    locality,
    propertyType,
    listingType,
    minPrice,
    maxPrice,
    bedrooms,
    bathrooms,
    minArea,
    maxArea,
    amenities,
    furnishing,
    status,
    page = '0',
    size = '12',
    sort = 'createdAt',
    direction = 'DESC'
  } = req.query;

  // By default, public list only shows APPROVED properties unless specified
  const targetStatus = (status as string) || 'APPROVED';
  if (targetStatus !== 'ALL') {
    list = list.filter(p => p.status === targetStatus);
  }

  if (city && typeof city === 'string' && city !== 'ALL' && city.trim()) {
    list = list.filter(p => p.city.toLowerCase() === city.toLowerCase().trim());
  }

  if (locality && typeof locality === 'string' && locality.trim()) {
    list = list.filter(p => p.locality.toLowerCase().includes(locality.toLowerCase().trim()));
  }

  if (location && typeof location === 'string' && location.trim()) {
    const loc = location.toLowerCase().trim();
    list = list.filter(p =>
      p.city.toLowerCase().includes(loc) ||
      p.locality.toLowerCase().includes(loc) ||
      p.address.toLowerCase().includes(loc) ||
      p.title.toLowerCase().includes(loc)
    );
  }

  if (propertyType && typeof propertyType === 'string' && propertyType !== 'ALL') {
    list = list.filter(p => p.propertyType === propertyType.toUpperCase());
  }

  if (listingType && typeof listingType === 'string' && listingType !== 'ALL') {
    list = list.filter(p => p.listingType === listingType.toUpperCase());
  }

  if (minPrice) {
    list = list.filter(p => p.price >= Number(minPrice));
  }

  if (maxPrice) {
    list = list.filter(p => p.price <= Number(maxPrice));
  }

  if (bedrooms && Number(bedrooms) > 0) {
    list = list.filter(p => p.bedrooms >= Number(bedrooms));
  }

  if (bathrooms && Number(bathrooms) > 0) {
    list = list.filter(p => p.bathrooms >= Number(bathrooms));
  }

  if (minArea) {
    list = list.filter(p => p.area >= Number(minArea));
  }

  if (maxArea) {
    list = list.filter(p => p.area <= Number(maxArea));
  }

  if (furnishing && typeof furnishing === 'string' && furnishing !== 'ALL') {
    list = list.filter(p => p.furnishing === furnishing.toUpperCase());
  }

  if (amenities) {
    const amenitiesArr = Array.isArray(amenities)
      ? (amenities as string[])
      : (amenities as string).split(',').map(a => a.trim());
    
    if (amenitiesArr.length > 0 && amenitiesArr[0] !== '') {
      list = list.filter(p =>
        amenitiesArr.every(reqAmenity =>
          p.amenities.some(a => a.toLowerCase() === reqAmenity.toLowerCase())
        )
      );
    }
  }

  // Sorting
  const sortKey = (sort as string) || 'createdAt';
  const sortDir = (direction as string)?.toUpperCase() === 'ASC' ? 1 : -1;

  list.sort((a: any, b: any) => {
    if (a[sortKey] < b[sortKey]) return -1 * sortDir;
    if (a[sortKey] > b[sortKey]) return 1 * sortDir;
    return 0;
  });

  const pageNum = parseInt(page as string, 10) || 0;
  const pageSize = parseInt(size as string, 10) || 12;
  const totalElements = list.length;
  const totalPages = Math.ceil(totalElements / pageSize);
  const paginatedData = list.slice(pageNum * pageSize, (pageNum + 1) * pageSize);

  return res.json({
    success: true,
    data: paginatedData,
    page: pageNum,
    size: pageSize,
    totalElements,
    totalPages
  });
});

app.get('/api/properties/featured', (req: Request, res: Response) => {
  const db = dbManager.getDatabase();
  const featured = db.properties
    .filter(p => p.status === 'APPROVED' && p.featured)
    .map(p => attachAgentToProperty(p, db.users));

  return res.json({
    success: true,
    data: featured
  });
});

app.get('/api/properties/:id', (req: Request, res: Response) => {
  const db = dbManager.getDatabase();
  const property = db.properties.find(p => p.id === Number(req.params.id));
  if (!property) {
    return res.status(404).json({ success: false, message: 'Property not found' });
  }

  return res.json({
    success: true,
    message: 'Property retrieved successfully',
    data: attachAgentToProperty(property, db.users)
  });
});

app.post('/api/properties', authenticateJwt, requireRole('AGENT', 'ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      title,
      description,
      price,
      propertyType,
      listingType,
      city,
      locality,
      address,
      bedrooms,
      bathrooms,
      area,
      parking,
      furnishing,
      amenities,
      images,
      featured
    } = req.body;

    if (!title || !price || !propertyType || !listingType || !city || !locality || !address || !area) {
      return res.status(400).json({ success: false, message: 'Please fill all required property fields' });
    }

    const db = dbManager.getDatabase();
    const newProperty: Property = {
      id: db.properties.length ? Math.max(...db.properties.map(p => p.id)) + 1 : 1,
      title: title.trim(),
      description: description || '',
      price: Number(price),
      propertyType: propertyType.toUpperCase(),
      listingType: listingType.toUpperCase(),
      city: city.trim(),
      locality: locality.trim(),
      address: address.trim(),
      bedrooms: Number(bedrooms) || 0,
      bathrooms: Number(bathrooms) || 0,
      area: Number(area),
      parking: Number(parking) || 0,
      furnishing: furnishing ? furnishing.toUpperCase() : 'UNFURNISHED',
      status: req.user!.role === 'ADMIN' ? 'APPROVED' : 'PENDING',
      featured: req.user!.role === 'ADMIN' ? Boolean(featured) : false,
      agentId: req.user!.id,
      images: Array.isArray(images) && images.length > 0 ? images : [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
      ],
      amenities: Array.isArray(amenities) ? amenities : ['Parking', 'Security'],
      createdAt: new Date().toISOString()
    };

    db.properties.unshift(newProperty);
    dbManager.save();

    return res.status(201).json({
      success: true,
      message: req.user!.role === 'ADMIN' 
        ? 'Property listing created and approved!' 
        : 'Property submitted successfully! It is currently PENDING approval by admin.',
      data: attachAgentToProperty(newProperty, db.users)
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/properties/:id', authenticateJwt, requireRole('AGENT', 'ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const db = dbManager.getDatabase();
  const index = db.properties.findIndex(p => p.id === Number(req.params.id));
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Property not found' });
  }

  const existing = db.properties[index];
  if (req.user!.role !== 'ADMIN' && existing.agentId !== req.user!.id) {
    return res.status(403).json({ success: false, message: 'You can only edit your own listings' });
  }

  const body = req.body;
  const updatedProperty: Property = {
    ...existing,
    title: body.title !== undefined ? body.title : existing.title,
    description: body.description !== undefined ? body.description : existing.description,
    price: body.price !== undefined ? Number(body.price) : existing.price,
    propertyType: body.propertyType !== undefined ? body.propertyType.toUpperCase() : existing.propertyType,
    listingType: body.listingType !== undefined ? body.listingType.toUpperCase() : existing.listingType,
    city: body.city !== undefined ? body.city : existing.city,
    locality: body.locality !== undefined ? body.locality : existing.locality,
    address: body.address !== undefined ? body.address : existing.address,
    bedrooms: body.bedrooms !== undefined ? Number(body.bedrooms) : existing.bedrooms,
    bathrooms: body.bathrooms !== undefined ? Number(body.bathrooms) : existing.bathrooms,
    area: body.area !== undefined ? Number(body.area) : existing.area,
    parking: body.parking !== undefined ? Number(body.parking) : existing.parking,
    furnishing: body.furnishing !== undefined ? body.furnishing.toUpperCase() : existing.furnishing,
    status: (req.user!.role === 'ADMIN' && body.status) ? body.status : existing.status,
    featured: (req.user!.role === 'ADMIN' && body.featured !== undefined) ? Boolean(body.featured) : existing.featured,
    images: Array.isArray(body.images) && body.images.length > 0 ? body.images : existing.images,
    amenities: Array.isArray(body.amenities) ? body.amenities : existing.amenities,
    updatedAt: new Date().toISOString()
  };

  db.properties[index] = updatedProperty;
  dbManager.save();

  return res.json({
    success: true,
    message: 'Property updated successfully',
    data: attachAgentToProperty(updatedProperty, db.users)
  });
});

app.delete('/api/properties/:id', authenticateJwt, requireRole('AGENT', 'ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const db = dbManager.getDatabase();
  const index = db.properties.findIndex(p => p.id === Number(req.params.id));
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Property not found' });
  }

  const existing = db.properties[index];
  if (req.user!.role !== 'ADMIN' && existing.agentId !== req.user!.id) {
    return res.status(403).json({ success: false, message: 'You can only delete your own listings' });
  }

  db.properties.splice(index, 1);
  // remove associated favorites
  db.favorites = db.favorites.filter(f => f.propertyId !== existing.id);
  // remove inquiries
  db.inquiries = db.inquiries.filter(i => i.propertyId !== existing.id);

  dbManager.save();
  return res.json({ success: true, message: 'Property deleted successfully' });
});

app.get('/api/properties/agent/:agentId', (req: Request, res: Response) => {
  const db = dbManager.getDatabase();
  const agentId = Number(req.params.agentId);
  const agentProps = db.properties
    .filter(p => p.agentId === agentId)
    .map(p => attachAgentToProperty(p, db.users));

  return res.json({
    success: true,
    data: agentProps
  });
});

// --- FAVORITES API ---

app.get('/api/favorites', authenticateJwt, (req: AuthenticatedRequest, res: Response) => {
  const db = dbManager.getDatabase();
  const userFavs = db.favorites.filter(f => f.userId === req.user!.id);
  const propertyIds = new Set(userFavs.map(f => f.propertyId));

  const properties = db.properties
    .filter(p => propertyIds.has(p.id))
    .map(p => attachAgentToProperty(p, db.users));

  return res.json({
    success: true,
    data: properties
  });
});

app.get('/api/favorites/ids', authenticateJwt, (req: AuthenticatedRequest, res: Response) => {
  const db = dbManager.getDatabase();
  const ids = db.favorites.filter(f => f.userId === req.user!.id).map(f => f.propertyId);
  return res.json({
    success: true,
    data: ids
  });
});

app.post('/api/favorites/:propertyId', authenticateJwt, (req: AuthenticatedRequest, res: Response) => {
  const db = dbManager.getDatabase();
  const propId = Number(req.params.propertyId);

  const exists = db.favorites.some(f => f.userId === req.user!.id && f.propertyId === propId);
  if (!exists) {
    db.favorites.push({
      id: db.favorites.length ? Math.max(...db.favorites.map(f => f.id)) + 1 : 1,
      userId: req.user!.id,
      propertyId: propId,
      createdAt: new Date().toISOString()
    });
    dbManager.save();
  }

  return res.json({
    success: true,
    message: 'Property added to favorites'
  });
});

app.delete('/api/favorites/:propertyId', authenticateJwt, (req: AuthenticatedRequest, res: Response) => {
  const db = dbManager.getDatabase();
  const propId = Number(req.params.propertyId);

  db.favorites = db.favorites.filter(f => !(f.userId === req.user!.id && f.propertyId === propId));
  dbManager.save();

  return res.json({
    success: true,
    message: 'Property removed from favorites'
  });
});

// --- INQUIRIES API ---

app.post('/api/inquiries', optionalJwt, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { propertyId, name, email, phone, message } = req.body;
    if (!propertyId || !name || !email || !phone || !message) {
      return res.status(400).json({ success: false, message: 'All inquiry fields are required' });
    }

    const db = dbManager.getDatabase();
    const prop = db.properties.find(p => p.id === Number(propertyId));
    if (!prop) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const newInquiry: Inquiry = {
      id: db.inquiries.length ? Math.max(...db.inquiries.map(i => i.id)) + 1 : 1,
      userId: req.user ? req.user.id : undefined,
      propertyId: prop.id,
      agentId: prop.agentId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      message: message.trim(),
      status: 'NEW',
      createdAt: new Date().toISOString()
    };

    db.inquiries.unshift(newInquiry);
    dbManager.save();

    return res.status(201).json({
      success: true,
      message: 'Inquiry submitted successfully! The verified agent will contact you shortly.',
      data: newInquiry
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/inquiries/my-inquiries', authenticateJwt, (req: AuthenticatedRequest, res: Response) => {
  const db = dbManager.getDatabase();
  const list = db.inquiries
    .filter(i => i.userId === req.user!.id || i.email.toLowerCase() === req.user!.email.toLowerCase())
    .map(i => {
      const prop = db.properties.find(p => p.id === i.propertyId);
      const agent = db.users.find(u => u.id === i.agentId);
      return {
        ...i,
        propertyTitle: prop ? prop.title : 'Property Listing',
        propertyCity: prop ? prop.city : '',
        agentName: agent ? agent.name : 'Verified Agent'
      };
    });

  return res.json({ success: true, data: list });
});

app.get('/api/inquiries/agent', authenticateJwt, requireRole('AGENT', 'ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const db = dbManager.getDatabase();
  const list = db.inquiries
    .filter(i => req.user!.role === 'ADMIN' || i.agentId === req.user!.id)
    .map(i => {
      const prop = db.properties.find(p => p.id === i.propertyId);
      const user = i.userId ? db.users.find(u => u.id === i.userId) : null;
      return {
        ...i,
        propertyTitle: prop ? prop.title : 'Property Listing',
        propertyCity: prop ? prop.city : '',
        user: user ? sanitizeUser(user) : null
      };
    });

  return res.json({ success: true, data: list });
});

app.put('/api/inquiries/:id/status', authenticateJwt, requireRole('AGENT', 'ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const db = dbManager.getDatabase();
  const inquiry = db.inquiries.find(i => i.id === Number(req.params.id));
  if (!inquiry) {
    return res.status(404).json({ success: false, message: 'Inquiry not found' });
  }

  const { status } = req.body;
  if (!['NEW', 'CONTACTED', 'CLOSED'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  inquiry.status = status;
  dbManager.save();

  return res.json({ success: true, message: 'Inquiry status updated', data: inquiry });
});

app.delete('/api/inquiries/:id', authenticateJwt, requireRole('AGENT', 'ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const db = dbManager.getDatabase();
  db.inquiries = db.inquiries.filter(i => i.id !== Number(req.params.id));
  dbManager.save();
  return res.json({ success: true, message: 'Inquiry deleted successfully' });
});

// --- USERS & AGENTS DIRECTORY ---

app.get('/api/agents', (req: Request, res: Response) => {
  const db = dbManager.getDatabase();
  const agents = db.users
    .filter(u => u.role === 'AGENT' && u.status === 'ACTIVE')
    .map(u => {
      const listingsCount = db.properties.filter(p => p.agentId === u.id && p.status === 'APPROVED').length;
      return {
        ...sanitizeUser(u),
        listingsCount
      };
    });

  return res.json({ success: true, data: agents });
});

app.get('/api/agents/:id', (req: Request, res: Response) => {
  const db = dbManager.getDatabase();
  const agent = db.users.find(u => u.id === Number(req.params.id) && u.role === 'AGENT');
  if (!agent) {
    return res.status(404).json({ success: false, message: 'Agent not found' });
  }

  const listings = db.properties
    .filter(p => p.agentId === agent.id && p.status === 'APPROVED')
    .map(p => attachAgentToProperty(p, db.users));

  return res.json({
    success: true,
    data: {
      ...sanitizeUser(agent),
      listings
    }
  });
});

app.put('/api/users/profile', authenticateJwt, async (req: AuthenticatedRequest, res: Response) => {
  const db = dbManager.getDatabase();
  const user = db.users.find(u => u.id === req.user!.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const { name, phone, agency, avatarUrl, password } = req.body;
  if (name) user.name = name.trim();
  if (phone !== undefined) user.phone = phone.trim();
  if (agency !== undefined) user.agency = agency.trim();
  if (avatarUrl) user.avatarUrl = avatarUrl.trim();

  if (password && password.trim().length >= 6) {
    user.password = await bcrypt.hash(password.trim(), 10);
  }

  user.updatedAt = new Date().toISOString();
  dbManager.save();

  return res.json({
    success: true,
    message: 'Profile updated successfully',
    data: sanitizeUser(user)
  });
});

// --- ADMIN API ---

app.get('/api/admin/stats', authenticateJwt, requireRole('ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const db = dbManager.getDatabase();
  const totalProps = db.properties.length;
  const approvedProps = db.properties.filter(p => p.status === 'APPROVED').length;
  const pendingProps = db.properties.filter(p => p.status === 'PENDING').length;
  const rejectedProps = db.properties.filter(p => p.status === 'REJECTED').length;

  const totalUsers = db.users.filter(u => u.role === 'USER').length;
  const totalAgents = db.users.filter(u => u.role === 'AGENT').length;
  const totalInquiries = db.inquiries.length;
  const newInquiries = db.inquiries.filter(i => i.status === 'NEW').length;

  // Breakdown by property type
  const propertiesByType: Record<string, number> = {};
  db.properties.forEach(p => {
    propertiesByType[p.propertyType] = (propertiesByType[p.propertyType] || 0) + 1;
  });

  // Breakdown by listing type
  const propertiesByListingType: Record<string, number> = {};
  db.properties.forEach(p => {
    propertiesByListingType[p.listingType] = (propertiesByListingType[p.listingType] || 0) + 1;
  });

  // Breakdown by city
  const propertiesByCity: Record<string, number> = {};
  db.properties.forEach(p => {
    propertiesByCity[p.city] = (propertiesByCity[p.city] || 0) + 1;
  });

  // Monthly trends (realistic simulation based on data)
  const monthlyListings = {
    Jan: 4,
    Feb: 7,
    Mar: 11,
    Apr: 14,
    May: 17,
    Jun: totalProps
  };

  const monthlyRegistrations = {
    Jan: 12,
    Feb: 19,
    Mar: 26,
    Apr: 34,
    May: 48,
    Jun: db.users.length
  };

  const inquiryStatusBreakdown = {
    NEW: db.inquiries.filter(i => i.status === 'NEW').length,
    CONTACTED: db.inquiries.filter(i => i.status === 'CONTACTED').length,
    CLOSED: db.inquiries.filter(i => i.status === 'CLOSED').length
  };

  return res.json({
    success: true,
    data: {
      totalProperties: totalProps,
      approvedProperties: approvedProps,
      pendingProperties: pendingProps,
      rejectedProperties: rejectedProps,
      totalUsers,
      totalAgents,
      totalInquiries,
      newInquiries,
      propertiesByType,
      propertiesByListingType,
      propertiesByCity,
      monthlyListings,
      monthlyRegistrations,
      inquiryStatusBreakdown
    }
  });
});

app.get('/api/admin/properties', authenticateJwt, requireRole('ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const db = dbManager.getDatabase();
  const properties = db.properties.map(p => attachAgentToProperty(p, db.users));
  return res.json({ success: true, data: properties });
});

app.put('/api/admin/properties/:id/approve', authenticateJwt, requireRole('ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const db = dbManager.getDatabase();
  const prop = db.properties.find(p => p.id === Number(req.params.id));
  if (!prop) return res.status(404).json({ success: false, message: 'Property not found' });

  prop.status = 'APPROVED';
  prop.updatedAt = new Date().toISOString();
  dbManager.save();
  return res.json({ success: true, message: 'Property approved successfully', data: attachAgentToProperty(prop, db.users) });
});

app.put('/api/admin/properties/:id/reject', authenticateJwt, requireRole('ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const db = dbManager.getDatabase();
  const prop = db.properties.find(p => p.id === Number(req.params.id));
  if (!prop) return res.status(404).json({ success: false, message: 'Property not found' });

  prop.status = 'REJECTED';
  prop.updatedAt = new Date().toISOString();
  dbManager.save();
  return res.json({ success: true, message: 'Property rejected', data: attachAgentToProperty(prop, db.users) });
});

app.put('/api/admin/properties/:id/feature', authenticateJwt, requireRole('ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const db = dbManager.getDatabase();
  const prop = db.properties.find(p => p.id === Number(req.params.id));
  if (!prop) return res.status(404).json({ success: false, message: 'Property not found' });

  prop.featured = !prop.featured;
  prop.updatedAt = new Date().toISOString();
  dbManager.save();
  return res.json({ success: true, message: `Property feature status set to ${prop.featured}`, data: attachAgentToProperty(prop, db.users) });
});

app.get('/api/admin/users', authenticateJwt, requireRole('ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const db = dbManager.getDatabase();
  return res.json({ success: true, data: db.users.map(sanitizeUser) });
});

app.put('/api/admin/users/:id/status', authenticateJwt, requireRole('ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const db = dbManager.getDatabase();
  const user = db.users.find(u => u.id === Number(req.params.id));
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  const { status } = req.body;
  if (!['ACTIVE', 'INACTIVE', 'SUSPENDED'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  user.status = status;
  user.updatedAt = new Date().toISOString();
  dbManager.save();
  return res.json({ success: true, message: `User status changed to ${status}`, data: sanitizeUser(user) });
});

app.delete('/api/admin/users/:id', authenticateJwt, requireRole('ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const db = dbManager.getDatabase();
  const id = Number(req.params.id);
  if (id === req.user!.id) {
    return res.status(400).json({ success: false, message: 'Cannot delete own admin account' });
  }

  db.users = db.users.filter(u => u.id !== id);
  db.properties = db.properties.filter(p => p.agentId !== id);
  db.favorites = db.favorites.filter(f => f.userId !== id);
  db.inquiries = db.inquiries.filter(i => i.userId !== id && i.agentId !== id);

  dbManager.save();
  return res.json({ success: true, message: 'User and associated data removed' });
});

app.get('/api/admin/agents', authenticateJwt, requireRole('ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const db = dbManager.getDatabase();
  const agents = db.users
    .filter(u => u.role === 'AGENT')
    .map(u => {
      const count = db.properties.filter(p => p.agentId === u.id).length;
      return {
        ...sanitizeUser(u),
        listingsCount: count
      };
    });
  return res.json({ success: true, data: agents });
});

app.put('/api/admin/agents/:id/verify', authenticateJwt, requireRole('ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const db = dbManager.getDatabase();
  const agent = db.users.find(u => u.id === Number(req.params.id) && u.role === 'AGENT');
  if (!agent) return res.status(404).json({ success: false, message: 'Agent not found' });

  agent.isVerified = req.body.verified !== undefined ? Boolean(req.body.verified) : !agent.isVerified;
  agent.updatedAt = new Date().toISOString();
  dbManager.save();
  return res.json({ success: true, message: `Agent verification set to ${agent.isVerified}`, data: sanitizeUser(agent) });
});

app.get('/api/admin/inquiries', authenticateJwt, requireRole('ADMIN'), (req: AuthenticatedRequest, res: Response) => {
  const db = dbManager.getDatabase();
  const list = db.inquiries.map(i => {
    const prop = db.properties.find(p => p.id === i.propertyId);
    const agent = db.users.find(u => u.id === i.agentId);
    return {
      ...i,
      propertyTitle: prop ? prop.title : 'Property Listing',
      propertyCity: prop ? prop.city : '',
      agentName: agent ? agent.name : 'Verified Agent'
    };
  });
  return res.json({ success: true, data: list });
});

// --- FILE UPLOAD ROUTE ---
app.post('/api/upload', authenticateJwt, upload.single('image'), (req: AuthenticatedRequest, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  const fileUrl = `/uploads/properties/${req.file.filename}`;
  return res.json({
    success: true,
    message: 'Image uploaded successfully',
    data: { url: fileUrl }
  });
});

// Global API error handler for body-parser or unhandled exceptions
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ success: false, message: 'Invalid JSON payload format' });
  }
  if (req.path.startsWith('/api/') || req.path.startsWith('/auth/')) {
    console.error('API Error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Internal server error' });
  }
  next(err);
});

// ==========================================
// FRONTEND STATIC FILE SERVING
// ==========================================

const frontendDir = path.join(process.cwd(), 'frontend');
app.use(express.static(frontendDir));

// Fallback routing for HTML pages
app.get('*', (req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) {
    return next();
  }

  // If user requests a specific html file or directory
  let filePath = path.join(frontendDir, req.path);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return res.sendFile(filePath);
  }

  if (fs.existsSync(filePath + '.html')) {
    return res.sendFile(filePath + '.html');
  }

  // Otherwise serve index.html
  return res.sendFile(path.join(frontendDir, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`ESTORA Server running on http://localhost:${PORT}`);
});
