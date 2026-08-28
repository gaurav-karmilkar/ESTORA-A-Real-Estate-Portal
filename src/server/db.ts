import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'USER' | 'AGENT' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  agency?: string;
  isVerified?: boolean;
  avatarUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Property {
  id: number;
  title: string;
  description: string;
  price: number;
  propertyType: 'APARTMENT' | 'VILLA' | 'HOUSE' | 'PLOT' | 'COMMERCIAL' | 'OFFICE';
  listingType: 'BUY' | 'RENT';
  city: string;
  locality: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  parking: number;
  furnishing: 'FURNISHED' | 'SEMI_FURNISHED' | 'UNFURNISHED';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SOLD' | 'RENTED';
  featured: boolean;
  agentId: number;
  images: string[];
  amenities: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface Favorite {
  id: number;
  userId: number;
  propertyId: number;
  createdAt: string;
}

export interface Inquiry {
  id: number;
  userId?: number;
  propertyId: number;
  agentId: number;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: 'NEW' | 'CONTACTED' | 'CLOSED';
  createdAt: string;
}

export interface Database {
  users: User[];
  properties: Property[];
  favorites: Favorite[];
  inquiries: Inquiry[];
}

const DB_FILE = path.join(process.cwd(), 'data', 'database.json');

const INITIAL_USERS: User[] = [
  {
    id: 1,
    name: 'Estora Admin',
    email: 'admin@estora.com',
    phone: '+91 98200 11223',
    password: bcrypt.hashSync('password123', 10),
    role: 'ADMIN',
    status: 'ACTIVE',
    agency: 'Estora Global HQ',
    isVerified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    createdAt: new Date(Date.now() - 90 * 86400000).toISOString()
  },
  {
    id: 2,
    name: 'Aarav Sharma',
    email: 'agent@estora.com',
    phone: '+91 98110 44556',
    password: bcrypt.hashSync('password123', 10),
    role: 'AGENT',
    status: 'ACTIVE',
    agency: 'Prime Realty Advisory',
    isVerified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80',
    createdAt: new Date(Date.now() - 80 * 86400000).toISOString()
  },
  {
    id: 3,
    name: 'Rohan Verma',
    email: 'user@estora.com',
    phone: '+91 97123 77889',
    password: bcrypt.hashSync('password123', 10),
    role: 'USER',
    status: 'ACTIVE',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    createdAt: new Date(Date.now() - 40 * 86400000).toISOString()
  },
  {
    id: 4,
    name: 'Priya Kulkarni',
    email: 'priya.kulkarni@estora.com',
    phone: '+91 99201 22334',
    password: bcrypt.hashSync('password123', 10),
    role: 'AGENT',
    status: 'ACTIVE',
    agency: 'Apex Luxury Living',
    isVerified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString()
  },
  {
    id: 5,
    name: 'Vikram Malhotra',
    email: 'vikram.m@estora.com',
    phone: '+91 98330 99887',
    password: bcrypt.hashSync('password123', 10),
    role: 'AGENT',
    status: 'ACTIVE',
    agency: 'Malhotra Estates',
    isVerified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80',
    createdAt: new Date(Date.now() - 50 * 86400000).toISOString()
  },
  {
    id: 6,
    name: 'Neha Singhania',
    email: 'neha.s@estora.com',
    phone: '+91 97654 32109',
    password: bcrypt.hashSync('password123', 10),
    role: 'AGENT',
    status: 'ACTIVE',
    agency: 'Horizon Properties',
    isVerified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
    createdAt: new Date(Date.now() - 45 * 86400000).toISOString()
  },
  {
    id: 7,
    name: 'Kabir Mehta',
    email: 'kabir.mehta@estora.com',
    phone: '+91 98210 66778',
    password: bcrypt.hashSync('password123', 10),
    role: 'AGENT',
    status: 'ACTIVE',
    agency: 'Skyline Habitat',
    isVerified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    createdAt: new Date(Date.now() - 35 * 86400000).toISOString()
  },
  {
    id: 8,
    name: 'Ananya Patel',
    email: 'ananya.p@estora.com',
    phone: '+91 98450 11992',
    password: bcrypt.hashSync('password123', 10),
    role: 'AGENT',
    status: 'ACTIVE',
    agency: 'Heritage Properties',
    isVerified: true,
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString()
  },
  {
    id: 9,
    name: 'Devansh Nair',
    email: 'devansh.nair@estora.com',
    phone: '+91 99887 55443',
    password: bcrypt.hashSync('password123', 10),
    role: 'AGENT',
    status: 'ACTIVE',
    agency: 'Urban Nest Realtors',
    isVerified: false,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString()
  },
  {
    id: 10,
    name: 'Meera Reddy',
    email: 'meera.r@estora.com',
    phone: '+91 98765 44321',
    password: bcrypt.hashSync('password123', 10),
    role: 'USER',
    status: 'ACTIVE',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString()
  }
];

const INITIAL_PROPERTIES: Property[] = [
  {
    id: 1,
    title: 'The Glass Pavilion Residence',
    description: 'Ultra-luxury modern sea-facing apartment offering panoramic Arabian Sea vistas, designer Italian marble, smart home automation, and a climate-controlled open-air wooden deck. Complete with private elevator access and dedicated 2-car basement parking.',
    price: 28500000,
    propertyType: 'APARTMENT',
    listingType: 'BUY',
    city: 'Mumbai',
    locality: 'Bandra West',
    address: 'Carter Road, Bandra West, Mumbai 400050',
    bedrooms: 3,
    bathrooms: 3,
    area: 2150,
    parking: 2,
    furnishing: 'FURNISHED',
    status: 'APPROVED',
    featured: true,
    agentId: 2,
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['Parking', 'Gym', 'Swimming Pool', 'Security', 'Balcony', 'Power Backup', 'Lift', 'Clubhouse'],
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString()
  },
  {
    id: 2,
    title: 'Skyline Sovereign Penthouse',
    description: 'Exclusive duplex penthouse with private plunge pool, private elevator access, double-height living room and wraparound sunset terrace in prime Worli Sea Face. Fully bespoke interiors designed by renowned architectural studio.',
    price: 64000000,
    propertyType: 'APARTMENT',
    listingType: 'BUY',
    city: 'Mumbai',
    locality: 'Worli',
    address: 'Worli Sea Face, Mumbai 400018',
    bedrooms: 4,
    bathrooms: 5,
    area: 4350,
    parking: 3,
    furnishing: 'FURNISHED',
    status: 'APPROVED',
    featured: true,
    agentId: 4,
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['Parking', 'Gym', 'Swimming Pool', 'Security', 'Balcony', 'Garden', 'Lift', 'Power Backup', 'Clubhouse'],
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString()
  },
  {
    id: 3,
    title: 'Serene Palms Contemporary Villa',
    description: 'Lush green modern private villa featuring Zen courtyard, solar roof, private lap pool, guest suite, and designer modular kitchen in prestigious Indiranagar. Serene neighbourhood close to upscale cafes and boutique stores.',
    price: 42000000,
    propertyType: 'VILLA',
    listingType: 'BUY',
    city: 'Bengaluru',
    locality: 'Indiranagar',
    address: '12th Main, Indiranagar, Bengaluru 560038',
    bedrooms: 4,
    bathrooms: 4,
    area: 3800,
    parking: 2,
    furnishing: 'SEMI_FURNISHED',
    status: 'APPROVED',
    featured: true,
    agentId: 5,
    images: [
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80'
    ],
    amenities: ['Parking', 'Security', 'Balcony', 'Garden', 'Power Backup'],
    createdAt: new Date(Date.now() - 18 * 86400000).toISOString()
  },
  {
    id: 4,
    title: 'Koregaon Park Artisan Flat',
    description: 'Spacious sunlit apartment with authentic Burmese teakwood flooring, wrap-around balcony facing ancient banyan trees, and access to premium lifestyle amenities.',
    price: 75000,
    propertyType: 'APARTMENT',
    listingType: 'RENT',
    city: 'Pune',
    locality: 'Koregaon Park',
    address: 'Lane 7, Koregaon Park, Pune 411001',
    bedrooms: 3,
    bathrooms: 3,
    area: 1750,
    parking: 1,
    furnishing: 'FURNISHED',
    status: 'APPROVED',
    featured: true,
    agentId: 2,
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['Parking', 'Gym', 'Security', 'Balcony', 'Lift', 'Power Backup'],
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString()
  },
  {
    id: 5,
    title: 'The White Oak Villa',
    description: 'Elegant neoclassical villa surrounded by manicured lawns, cedarwood pergola, private acoustic home cinema, and imported Italian fixtures.',
    price: 55000000,
    propertyType: 'VILLA',
    listingType: 'BUY',
    city: 'Hyderabad',
    locality: 'Jubilee Hills',
    address: 'Road No 36, Jubilee Hills, Hyderabad 500033',
    bedrooms: 5,
    bathrooms: 6,
    area: 5200,
    parking: 4,
    furnishing: 'FURNISHED',
    status: 'APPROVED',
    featured: true,
    agentId: 6,
    images: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['Parking', 'Gym', 'Swimming Pool', 'Security', 'Garden', 'Power Backup'],
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString()
  },
  {
    id: 6,
    title: 'Cybercity Executive Suites',
    description: 'Premium high-rise apartment tailored for modern tech leaders, walking distance to Tech Parks with world-class clubhouse, infinity pool & round-the-clock concierge.',
    price: 55000,
    propertyType: 'APARTMENT',
    listingType: 'RENT',
    city: 'Hyderabad',
    locality: 'Gachibowli',
    address: 'Financial District, Gachibowli, Hyderabad 500032',
    bedrooms: 2,
    bathrooms: 2,
    area: 1380,
    parking: 1,
    furnishing: 'FURNISHED',
    status: 'APPROVED',
    featured: false,
    agentId: 6,
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['Parking', 'Gym', 'Swimming Pool', 'Security', 'Lift', 'Power Backup', 'Clubhouse'],
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString()
  },
  {
    id: 7,
    title: 'Golf Links Luxury Floor',
    description: 'Prestigious independent builder floor in prime Lutyens-adjacent zone with private terrace, Italian fittings, and landscaped rear deck.',
    price: 92000000,
    propertyType: 'HOUSE',
    listingType: 'BUY',
    city: 'Delhi',
    locality: 'Golf Links',
    address: 'Golf Links Avenue, New Delhi 110003',
    bedrooms: 4,
    bathrooms: 4,
    area: 4100,
    parking: 3,
    furnishing: 'SEMI_FURNISHED',
    status: 'APPROVED',
    featured: true,
    agentId: 7,
    images: [
      'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['Parking', 'Security', 'Balcony', 'Garden', 'Lift', 'Power Backup'],
    createdAt: new Date(Date.now() - 11 * 86400000).toISOString()
  },
  {
    id: 8,
    title: 'Lavelle Manor City View Loft',
    description: 'Chic urban loft apartment in Central Bengaluru with high ceilings, exposed brick accent walls, and bespoke designer lighting fixtures.',
    price: 95000,
    propertyType: 'APARTMENT',
    listingType: 'RENT',
    city: 'Bengaluru',
    locality: 'Lavelle Road',
    address: 'Lavelle Road, Bengaluru 560001',
    bedrooms: 2,
    bathrooms: 2,
    area: 1600,
    parking: 1,
    furnishing: 'FURNISHED',
    status: 'APPROVED',
    featured: false,
    agentId: 5,
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['Parking', 'Gym', 'Security', 'Lift', 'Power Backup'],
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString()
  },
  {
    id: 9,
    title: 'Kalyani Nagar Riverside Flat',
    description: 'East-facing garden view 3 BHK apartment with large master suite, private foyer, piped natural gas, and community clubhouse.',
    price: 16500000,
    propertyType: 'APARTMENT',
    listingType: 'BUY',
    city: 'Pune',
    locality: 'Kalyani Nagar',
    address: 'River Road, Kalyani Nagar, Pune 411006',
    bedrooms: 3,
    bathrooms: 3,
    area: 1920,
    parking: 2,
    furnishing: 'SEMI_FURNISHED',
    status: 'APPROVED',
    featured: false,
    agentId: 2,
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['Parking', 'Gym', 'Swimming Pool', 'Security', 'Balcony', 'Lift', 'Power Backup'],
    createdAt: new Date(Date.now() - 9 * 86400000).toISOString()
  },
  {
    id: 10,
    title: 'Green Valley Residential Plot',
    description: 'Clear title R-zone gated residential plot with dedicated water connection, 40-ft wide internal roads, and club access in expanding growth corridor.',
    price: 8500000,
    propertyType: 'PLOT',
    listingType: 'BUY',
    city: 'Pune',
    locality: 'Baner',
    address: 'Baner-Pashan Link Road, Pune 411045',
    bedrooms: 0,
    bathrooms: 0,
    area: 3000,
    parking: 0,
    furnishing: 'UNFURNISHED',
    status: 'APPROVED',
    featured: false,
    agentId: 2,
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['Security', 'Garden'],
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString()
  },
  {
    id: 11,
    title: 'Vasant Vihar Embassy Residence',
    description: 'Opulent standalone bungalow with central climate control, high-speed elevator, staff quarters, and manicured English rose garden.',
    price: 145000000,
    propertyType: 'VILLA',
    listingType: 'BUY',
    city: 'Delhi',
    locality: 'Vasant Vihar',
    address: 'Pashchimi Marg, Vasant Vihar, New Delhi 110057',
    bedrooms: 6,
    bathrooms: 7,
    area: 7500,
    parking: 5,
    furnishing: 'FURNISHED',
    status: 'APPROVED',
    featured: true,
    agentId: 7,
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['Parking', 'Gym', 'Swimming Pool', 'Security', 'Balcony', 'Garden', 'Lift', 'Power Backup'],
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString()
  },
  {
    id: 12,
    title: 'Bandra Kurla Business Suite',
    description: 'Grade-A fully-furnished commercial office space with conference rooms, soundproof pods, server room, and high-speed elevators.',
    price: 220000,
    propertyType: 'OFFICE',
    listingType: 'RENT',
    city: 'Mumbai',
    locality: 'BKC',
    address: 'G Block, Bandra Kurla Complex, Mumbai 400051',
    bedrooms: 0,
    bathrooms: 4,
    area: 3200,
    parking: 4,
    furnishing: 'FURNISHED',
    status: 'APPROVED',
    featured: false,
    agentId: 4,
    images: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['Parking', 'Security', 'Lift', 'Power Backup'],
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString()
  },
  {
    id: 13,
    title: 'Hiranandani Heritage 2 BHK',
    description: 'Classic European neoclassical apartment in Powai with scenic lake views, marble flooring, and access to international school & hospital.',
    price: 21000000,
    propertyType: 'APARTMENT',
    listingType: 'BUY',
    city: 'Mumbai',
    locality: 'Powai',
    address: 'Central Avenue, Hiranandani Gardens, Powai, Mumbai 400076',
    bedrooms: 2,
    bathrooms: 2,
    area: 1150,
    parking: 1,
    furnishing: 'SEMI_FURNISHED',
    status: 'APPROVED',
    featured: false,
    agentId: 4,
    images: [
      'https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['Parking', 'Gym', 'Swimming Pool', 'Security', 'Balcony', 'Lift', 'Power Backup', 'Clubhouse'],
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  {
    id: 14,
    title: 'Whitefield Tech Haven',
    description: 'Airy 3 BHK home overlooking courtyard gardens with EV charging dock, Olympic-size pool, squash court, and library lounge.',
    price: 14800000,
    propertyType: 'APARTMENT',
    listingType: 'BUY',
    city: 'Bengaluru',
    locality: 'Whitefield',
    address: 'ITPL Main Road, Whitefield, Bengaluru 560066',
    bedrooms: 3,
    bathrooms: 3,
    area: 1850,
    parking: 2,
    furnishing: 'UNFURNISHED',
    status: 'APPROVED',
    featured: false,
    agentId: 8,
    images: [
      'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['Parking', 'Gym', 'Swimming Pool', 'Security', 'Balcony', 'Garden', 'Lift', 'Power Backup'],
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString()
  },
  {
    id: 15,
    title: 'Civil Lines Heritage House',
    description: 'Graceful colonial-era restored bungalow featuring high teakwood ceilings, verandah, vintage chandeliers, and private manicured lawn.',
    price: 38000000,
    propertyType: 'HOUSE',
    listingType: 'BUY',
    city: 'Nagpur',
    locality: 'Civil Lines',
    address: 'Temple Road, Civil Lines, Nagpur 440001',
    bedrooms: 4,
    bathrooms: 4,
    area: 4500,
    parking: 3,
    furnishing: 'SEMI_FURNISHED',
    status: 'APPROVED',
    featured: true,
    agentId: 8,
    images: [
      'https://images.unsplash.com/photo-1576941089067-2de3c901e126?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['Parking', 'Security', 'Balcony', 'Garden', 'Power Backup'],
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    id: 16,
    title: 'Banjara Hills Panoramic Flat',
    description: 'Sun-drenched 4 BHK luxury apartment with floor-to-ceiling glass, Italian modular kitchen, and smart touch automation.',
    price: 31500000,
    propertyType: 'APARTMENT',
    listingType: 'BUY',
    city: 'Hyderabad',
    locality: 'Banjara Hills',
    address: 'Road No 12, Banjara Hills, Hyderabad 500034',
    bedrooms: 4,
    bathrooms: 4,
    area: 3100,
    parking: 2,
    furnishing: 'FURNISHED',
    status: 'APPROVED',
    featured: false,
    agentId: 6,
    images: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['Parking', 'Gym', 'Swimming Pool', 'Security', 'Balcony', 'Lift', 'Power Backup', 'Clubhouse'],
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 17,
    title: 'Aerocity Prime Commercial Plaza',
    description: 'Prime retail and corporate anchor space in modern business hub near International Airport with 24/7 security & high footfall.',
    price: 45000000,
    propertyType: 'COMMERCIAL',
    listingType: 'BUY',
    city: 'Delhi',
    locality: 'Aerocity',
    address: 'Hospitality District, Aerocity, New Delhi 110037',
    bedrooms: 0,
    bathrooms: 3,
    area: 2800,
    parking: 3,
    furnishing: 'UNFURNISHED',
    status: 'APPROVED',
    featured: false,
    agentId: 7,
    images: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['Parking', 'Security', 'Lift', 'Power Backup'],
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 18,
    title: 'Kothrud Hillview Apartment',
    description: 'Peaceful 2 BHK with serene mountain breeze, modular kitchen, piped gas, solar water heating, and children play park.',
    price: 42000,
    propertyType: 'APARTMENT',
    listingType: 'RENT',
    city: 'Pune',
    locality: 'Kothrud',
    address: 'Paud Road, Kothrud, Pune 411038',
    bedrooms: 2,
    bathrooms: 2,
    area: 1100,
    parking: 1,
    furnishing: 'SEMI_FURNISHED',
    status: 'APPROVED',
    featured: false,
    agentId: 2,
    images: [
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['Parking', 'Security', 'Balcony', 'Lift', 'Power Backup'],
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    id: 19,
    title: 'Sunny Palms Beachfront Studio',
    description: 'Boutique studio apartment minutes from Juhu Beach with sea-breeze balcony, dedicated workstation, and designer bathroom.',
    price: 60000,
    propertyType: 'APARTMENT',
    listingType: 'RENT',
    city: 'Mumbai',
    locality: 'Juhu',
    address: 'Juhu Tara Road, Juhu, Mumbai 400049',
    bedrooms: 1,
    bathrooms: 1,
    area: 650,
    parking: 1,
    furnishing: 'FURNISHED',
    status: 'APPROVED',
    featured: false,
    agentId: 4,
    images: [
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['Parking', 'Security', 'Balcony', 'Lift', 'Power Backup'],
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    id: 20,
    title: 'Koramangala Designer Villa',
    description: 'Triplex boutique villa with private home elevator, rooftop BBQ deck, heated jacuzzi, and 3-car garage.',
    price: 49000000,
    propertyType: 'VILLA',
    listingType: 'BUY',
    city: 'Bengaluru',
    locality: 'Koramangala',
    address: '3rd Block, Koramangala, Bengaluru 560034',
    bedrooms: 4,
    bathrooms: 5,
    area: 4200,
    parking: 3,
    furnishing: 'FURNISHED',
    status: 'PENDING',
    featured: false,
    agentId: 5,
    images: [
      'https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: ['Parking', 'Gym', 'Swimming Pool', 'Security', 'Garden', 'Lift', 'Power Backup'],
    createdAt: new Date().toISOString()
  }
];

const INITIAL_FAVORITES: Favorite[] = [
  { id: 1, userId: 3, propertyId: 1, createdAt: new Date(Date.now() - 10 * 86400000).toISOString() },
  { id: 2, userId: 3, propertyId: 3, createdAt: new Date(Date.now() - 8 * 86400000).toISOString() },
  { id: 3, userId: 3, propertyId: 5, createdAt: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: 4, userId: 10, propertyId: 2, createdAt: new Date(Date.now() - 4 * 86400000).toISOString() },
  { id: 5, userId: 10, propertyId: 7, createdAt: new Date(Date.now() - 2 * 86400000).toISOString() }
];

const INITIAL_INQUIRIES: Inquiry[] = [
  {
    id: 1,
    userId: 3,
    propertyId: 1,
    agentId: 2,
    name: 'Rohan Verma',
    email: 'user@estora.com',
    phone: '+91 97123 77889',
    message: 'Hello Aarav, I am interested in viewing the Bandra West sea-facing apartment this weekend. Please let me know your availability.',
    status: 'NEW',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  {
    id: 2,
    userId: 3,
    propertyId: 3,
    agentId: 5,
    name: 'Rohan Verma',
    email: 'user@estora.com',
    phone: '+91 97123 77889',
    message: 'Hi Vikram, please share the floor plan and association maintenance costs for the Indiranagar villa.',
    status: 'CONTACTED',
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString()
  },
  {
    id: 3,
    userId: 10,
    propertyId: 2,
    agentId: 4,
    name: 'Meera Reddy',
    email: 'meera.r@estora.com',
    phone: '+91 98765 44321',
    message: 'Is this Worli duplex penthouse negotiable on price? Looking for immediate closing.',
    status: 'NEW',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    id: 4,
    userId: 10,
    propertyId: 7,
    agentId: 7,
    name: 'Meera Reddy',
    email: 'meera.r@estora.com',
    phone: '+91 98765 44321',
    message: 'We would like to schedule a private tour for Golf Links Luxury floor next Tuesday morning.',
    status: 'CLOSED',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
  }
];

class DatabaseManager {
  private db: Database;

  constructor() {
    this.ensureDirectory();
    this.db = this.load();
  }

  private ensureDirectory() {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private load(): Database {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Error loading DB file, resetting to initial seed:', e);
    }

    const initialDb: Database = {
      users: INITIAL_USERS,
      properties: INITIAL_PROPERTIES,
      favorites: INITIAL_FAVORITES,
      inquiries: INITIAL_INQUIRIES
    };

    this.save(initialDb);
    return initialDb;
  }

  public save(data: Database = this.db) {
    this.ensureDirectory();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  }

  public getDatabase(): Database {
    return this.db;
  }
}

export const dbManager = new DatabaseManager();
