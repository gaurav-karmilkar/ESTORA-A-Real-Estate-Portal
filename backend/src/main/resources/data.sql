-- =========================================================
-- ESTORA REAL ESTATE PORTAL - DATABASE SCHEMA & SEED DATA
-- Database: real_estate_portal
-- =========================================================

-- Create Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    role ENUM('USER', 'AGENT', 'ADMIN') NOT NULL DEFAULT 'USER',
    status ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
    agency VARCHAR(100),
    is_verified BOOLEAN DEFAULT FALSE,
    avatar_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email),
    INDEX idx_user_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create Amenities Table
CREATE TABLE IF NOT EXISTS amenities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create Properties Table
CREATE TABLE IF NOT EXISTS properties (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(15, 2) NOT NULL,
    property_type ENUM('APARTMENT', 'VILLA', 'HOUSE', 'PLOT', 'COMMERCIAL', 'OFFICE') NOT NULL,
    listing_type ENUM('BUY', 'RENT') NOT NULL,
    city VARCHAR(100) NOT NULL,
    locality VARCHAR(150) NOT NULL,
    address VARCHAR(255) NOT NULL,
    bedrooms INT DEFAULT 0,
    bathrooms INT DEFAULT 0,
    area DECIMAL(10, 2) NOT NULL,
    parking INT DEFAULT 0,
    furnishing ENUM('FURNISHED', 'SEMI_FURNISHED', 'UNFURNISHED') DEFAULT 'UNFURNISHED',
    status ENUM('PENDING', 'APPROVED', 'REJECTED', 'SOLD', 'RENTED') NOT NULL DEFAULT 'PENDING',
    featured BOOLEAN DEFAULT FALSE,
    agent_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_property_city (city),
    INDEX idx_property_type (property_type),
    INDEX idx_listing_type (listing_type),
    INDEX idx_property_status (status),
    INDEX idx_property_price (price)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create Property Images Table
CREATE TABLE IF NOT EXISTS property_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    property_id BIGINT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create Property Amenities Mapping Table
CREATE TABLE IF NOT EXISTS property_amenities (
    property_id BIGINT NOT NULL,
    amenity_id BIGINT NOT NULL,
    PRIMARY KEY (property_id, amenity_id),
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (amenity_id) REFERENCES amenities(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create Favorites Table
CREATE TABLE IF NOT EXISTS favorites (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    property_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_property (user_id, property_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create Inquiries Table
CREATE TABLE IF NOT EXISTS inquiries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    property_id BIGINT NOT NULL,
    agent_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('NEW', 'CONTACTED', 'CLOSED') NOT NULL DEFAULT 'NEW',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_inquiry_agent (agent_id),
    INDEX idx_inquiry_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================
-- SEED DATA
-- Passwords below are BCrypt hashed for 'password123' ($2a$10$eAccYoNOz2fvLTWv6w/s1eP51aU3s1VpQWjR6wKvZfI/iQz7fKq1G)
-- =========================================================

-- Seed Amenities
INSERT IGNORE INTO amenities (id, name) VALUES
(1, 'Parking'),
(2, 'Gym'),
(3, 'Swimming Pool'),
(4, 'Security'),
(5, 'Balcony'),
(6, 'Garden'),
(7, 'Lift'),
(8, 'Power Backup'),
(9, 'Clubhouse'),
(10, 'Kids Play Area');

-- Seed Users (Admins, Agents, Buyers)
INSERT IGNORE INTO users (id, name, email, phone, password, role, status, agency, is_verified, avatar_url) VALUES
(1, 'Estora Admin', 'admin@estora.com', '+91 98200 11223', '$2a$10$w6z/6H0k6sQnQZJ0y4vTle1W.g5F5G0rP5wZ5yKxG3yqjI/qE0jOe', 'ADMIN', 'ACTIVE', 'Estora Global HQ', TRUE, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'),
(2, 'Aarav Sharma', 'agent@estora.com', '+91 98110 44556', '$2a$10$w6z/6H0k6sQnQZJ0y4vTle1W.g5F5G0rP5wZ5yKxG3yqjI/qE0jOe', 'AGENT', 'ACTIVE', 'Prime Realty Advisory', TRUE, 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80'),
(3, 'Rohan Verma', 'user@estora.com', '+91 97123 77889', '$2a$10$w6z/6H0k6sQnQZJ0y4vTle1W.g5F5G0rP5wZ5yKxG3yqjI/qE0jOe', 'USER', 'ACTIVE', NULL, FALSE, 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'),
(4, 'Priya Kulkarni', 'priya.kulkarni@estora.com', '+91 99201 22334', '$2a$10$w6z/6H0k6sQnQZJ0y4vTle1W.g5F5G0rP5wZ5yKxG3yqjI/qE0jOe', 'AGENT', 'ACTIVE', 'Apex Luxury Living', TRUE, 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80'),
(5, 'Vikram Malhotra', 'vikram.m@estora.com', '+91 98330 99887', '$2a$10$w6z/6H0k6sQnQZJ0y4vTle1W.g5F5G0rP5wZ5yKxG3yqjI/qE0jOe', 'AGENT', 'ACTIVE', 'Malhotra Estates', TRUE, 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80'),
(6, 'Neha Singhania', 'neha.s@estora.com', '+91 97654 32109', '$2a$10$w6z/6H0k6sQnQZJ0y4vTle1W.g5F5G0rP5wZ5yKxG3yqjI/qE0jOe', 'AGENT', 'ACTIVE', 'Horizon Properties', TRUE, 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80'),
(7, 'Kabir Mehta', 'kabir.mehta@estora.com', '+91 98210 66778', '$2a$10$w6z/6H0k6sQnQZJ0y4vTle1W.g5F5G0rP5wZ5yKxG3yqjI/qE0jOe', 'AGENT', 'ACTIVE', 'Skyline Habitat', TRUE, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'),
(8, 'Ananya Patel', 'ananya.p@estora.com', '+91 98450 11992', '$2a$10$w6z/6H0k6sQnQZJ0y4vTle1W.g5F5G0rP5wZ5yKxG3yqjI/qE0jOe', 'AGENT', 'ACTIVE', 'Heritage Properties', TRUE, 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80'),
(9, 'Devansh Nair', 'devansh.nair@estora.com', '+91 99887 55443', '$2a$10$w6z/6H0k6sQnQZJ0y4vTle1W.g5F5G0rP5wZ5yKxG3yqjI/qE0jOe', 'AGENT', 'ACTIVE', 'Urban Nest Realtors', FALSE, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80'),
(10, 'Meera Reddy', 'meera.r@estora.com', '+91 98765 44321', '$2a$10$w6z/6H0k6sQnQZJ0y4vTle1W.g5F5G0rP5wZ5yKxG3yqjI/qE0jOe', 'USER', 'ACTIVE', NULL, FALSE, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80');

-- Seed Properties
INSERT IGNORE INTO properties (id, title, description, price, property_type, listing_type, city, locality, address, bedrooms, bathrooms, area, parking, furnishing, status, featured, agent_id) VALUES
(1, 'The Glass Pavilion Residence', 'Ultra-luxury modern sea-facing apartment offering panoramic Arabian Sea vistas, designer Italian marble, smart home automation, and temperature-controlled deck.', 28500000.00, 'APARTMENT', 'BUY', 'Mumbai', 'Bandra West', 'Carter Road, Bandra West, Mumbai 400050', 3, 3, 2150.00, 2, 'FURNISHED', 'APPROVED', TRUE, 2),
(2, 'Skyline Sovereign Penthouse', 'Exclusive duplex penthouse with private plunge pool, private elevator access, double-height living room and wraparound sunset terrace in prime Worli.', 64000000.00, 'APARTMENT', 'BUY', 'Mumbai', 'Worli', 'Worli Sea Face, Mumbai 400018', 4, 5, 4350.00, 3, 'FURNISHED', 'APPROVED', TRUE, 4),
(3, 'Serene Palms Contemporary Villa', 'Lush green modern private villa featuring Zen courtyard, solar roof, private swimming pool, guest suite, and designer modular kitchen.', 42000000.00, 'VILLA', 'BUY', 'Bengaluru', 'Indiranagar', '12th Main, Indiranagar, Bengaluru 560038', 4, 4, 3800.00, 2, 'SEMI_FURNISHED', 'APPROVED', TRUE, 5),
(4, 'Koregaon Park Artisan Flat', 'Spacious sunlit apartment with wooden flooring, wrap-around balcony facing banyan trees, and access to premium lifestyle amenities.', 75000.00, 'APARTMENT', 'RENT', 'Pune', 'Koregaon Park', 'Lane 7, Koregaon Park, Pune 411001', 3, 3, 1750.00, 1, 'FURNISHED', 'APPROVED', TRUE, 2),
(5, 'The White Oak Villa', 'Elegant neoclassical villa surrounded by landscaped lawns, cedarwood pergola, private home cinema, and Italian fixtures.', 55000000.00, 'VILLA', 'BUY', 'Hyderabad', 'Jubilee Hills', 'Road No 36, Jubilee Hills, Hyderabad 500033', 5, 6, 5200.00, 4, 'FURNISHED', 'APPROVED', TRUE, 6),
(6, 'Cybercity Executive Suites', 'Premium high-rise apartment tailored for modern professionals, walking distance to Tech Parks with world-class clubhouse & concierge.', 55000.00, 'APARTMENT', 'RENT', 'Hyderabad', 'Gachibowli', 'Financial District, Gachibowli, Hyderabad 500032', 2, 2, 1380.00, 1, 'FURNISHED', 'APPROVED', FALSE, 6),
(7, 'Golf Links Luxury Floor', 'Prestigious independent builder floor in prime Lutyens-adjacent zone with private terrace, Italian fittings, and landscaped rear deck.', 92000000.00, 'HOUSE', 'BUY', 'Delhi', 'Golf Links', 'Golf Links Avenue, New Delhi 110003', 4, 4, 4100.00, 3, 'SEMI_FURNISHED', 'APPROVED', TRUE, 7),
(8, 'Lavelle Manor City View Loft', 'Chic urban loft apartment in Central Bengaluru with high ceilings, exposed brick accent walls, and bespoke lighting fixtures.', 95000.00, 'APARTMENT', 'RENT', 'Bengaluru', 'Lavelle Road', 'Lavelle Road, Bengaluru 560001', 2, 2, 1600.00, 1, 'FURNISHED', 'APPROVED', FALSE, 5),
(9, 'Kalyani Nagar Riverside Flat', 'East-facing garden view 3 BHK apartment with large master suite, private foyer, piped gas, and community clubhouse.', 16500000.00, 'APARTMENT', 'BUY', 'Pune', 'Kalyani Nagar', 'River Road, Kalyani Nagar, Pune 411006', 3, 3, 1920.00, 2, 'SEMI_FURNISHED', 'APPROVED', FALSE, 2),
(10, 'Green Valley Residential Plot', 'Clear title R-zone gated residential plot with water connection, 40-ft wide internal roads, and club access in expanding growth corridor.', 8500000.00, 'PLOT', 'BUY', 'Pune', 'Baner', 'Baner-Pashan Link Road, Pune 411045', 0, 0, 3000.00, 0, 'UNFURNISHED', 'APPROVED', FALSE, 2),
(11, 'Vasant Vihar Embassy Residence', 'Opulent standalone bungalow with central climate control, elevator, staff quarters, and manicured English rose garden.', 145000000.00, 'VILLA', 'BUY', 'Delhi', 'Vasant Vihar', 'Pashchimi Marg, Vasant Vihar, New Delhi 110057', 6, 7, 7500.00, 5, 'FURNISHED', 'APPROVED', TRUE, 7),
(12, 'Bandra Kurla Business Suite', 'Grade-A fully-furnished commercial office space with conference rooms, soundproof pods, server room, and high-speed elevators.', 220000.00, 'OFFICE', 'RENT', 'Mumbai', 'BKC', 'G Block, Bandra Kurla Complex, Mumbai 400051', 0, 4, 3200.00, 4, 'FURNISHED', 'APPROVED', FALSE, 4),
(13, 'Hiranandani Heritage 2 BHK', 'Classic European neoclassical apartment in Powai with scenic lake views, marble flooring, and access to international school & hospital.', 21000000.00, 'APARTMENT', 'BUY', 'Mumbai', 'Powai', 'Central Avenue, Hiranandani Gardens, Powai, Mumbai 400076', 2, 2, 1150.00, 1, 'SEMI_FURNISHED', 'APPROVED', FALSE, 4),
(14, 'Whitefield Tech Haven', 'Airy 3 BHK home overlooking courtyard gardens with EV charging dock, Olympic-size pool, squash court, and library lounge.', 14800000.00, 'APARTMENT', 'BUY', 'Bengaluru', 'Whitefield', 'ITPL Main Road, Whitefield, Bengaluru 560066', 3, 3, 1850.00, 2, 'UNFURNISHED', 'APPROVED', FALSE, 8),
(15, 'Civil Lines Heritage House', 'Graceful colonial-era restored bungalow featuring high teakwood ceilings, verandah, vintage chandeliers, and private lawn.', 38000000.00, 'HOUSE', 'BUY', 'Nagpur', 'Civil Lines', 'Temple Road, Civil Lines, Nagpur 440001', 4, 4, 4500.00, 3, 'SEMI_FURNISHED', 'APPROVED', TRUE, 8),
(16, 'Banjara Hills Panoramic Flat', 'Sun-drenched 4 BHK luxury apartment with floor-to-ceiling glass, Italian modular kitchen, and smart touch automation.', 31500000.00, 'APARTMENT', 'BUY', 'Hyderabad', 'Banjara Hills', 'Road No 12, Banjara Hills, Hyderabad 500034', 4, 4, 3100.00, 2, 'FURNISHED', 'APPROVED', FALSE, 6),
(17, 'Aerocity Prime Commercial Plaza', 'Prime retail and corporate anchor space in modern business hub near International Airport with 24/7 security & high footfall.', 45000000.00, 'COMMERCIAL', 'BUY', 'Delhi', 'Aerocity', 'Hospitality District, Aerocity, New Delhi 110037', 0, 3, 2800.00, 3, 'UNFURNISHED', 'APPROVED', FALSE, 7),
(18, 'Kothrud Hillview Apartment', 'Peaceful 2 BHK with serene mountain breeze, modular kitchen, piped gas, solar water heating, and children play park.', 42000.00, 'APARTMENT', 'RENT', 'Pune', 'Kothrud', 'Paud Road, Kothrud, Pune 411038', 2, 2, 1100.00, 1, 'SEMI_FURNISHED', 'APPROVED', FALSE, 2),
(19, 'Sunny Palms Beachfront Studio', 'Boutique studio apartment minutes from Juhu Beach with sea-breeze balcony, dedicated workstation, and designer bathroom.', 60000.00, 'APARTMENT', 'RENT', 'Mumbai', 'Juhu', 'Juhu Tara Road, Juhu, Mumbai 400049', 1, 1, 650.00, 1, 'FURNISHED', 'APPROVED', FALSE, 4),
(20, 'Koramangala Designer Villa', 'Triplex boutique villa with private home elevator, rooftop BBQ deck, heated jacuzzi, and 3-car garage.', 49000000.00, 'VILLA', 'BUY', 'Bengaluru', 'Koramangala', '3rd Block, Koramangala, Bengaluru 560034', 4, 5, 4200.00, 3, 'FURNISHED', 'PENDING', FALSE, 5);

-- Seed Property Images
INSERT IGNORE INTO property_images (property_id, image_url, is_primary) VALUES
(1, 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80', TRUE),
(1, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80', FALSE),
(1, 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80', FALSE),
(2, 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80', TRUE),
(2, 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80', FALSE),
(3, 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80', TRUE),
(3, 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80', FALSE),
(4, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80', TRUE),
(5, 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80', TRUE),
(6, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80', TRUE),
(7, 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80', TRUE),
(8, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80', TRUE),
(9, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80', TRUE),
(10, 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80', TRUE),
(11, 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80', TRUE),
(12, 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80', TRUE),
(13, 'https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&w=1200&q=80', TRUE),
(14, 'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&w=1200&q=80', TRUE),
(15, 'https://images.unsplash.com/photo-1576941089067-2de3c901e126?auto=format&fit=crop&w=1200&q=80', TRUE),
(16, 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80', TRUE),
(17, 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80', TRUE),
(18, 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80', TRUE),
(19, 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80', TRUE),
(20, 'https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?auto=format&fit=crop&w=1200&q=80', TRUE);

-- Seed Inquiries
INSERT IGNORE INTO inquiries (id, user_id, property_id, agent_id, name, email, phone, message, status) VALUES
(1, 3, 1, 2, 'Rohan Verma', 'user@estora.com', '+91 97123 77889', 'Hello Aarav, I am interested in viewing the Bandra West sea-facing apartment this weekend. Please let me know your availability.', 'NEW'),
(2, 3, 3, 5, 'Rohan Verma', 'user@estora.com', '+91 97123 77889', 'Hi Vikram, please share the floor plan and association maintenance costs for the Indiranagar villa.', 'CONTACTED'),
(3, 10, 2, 4, 'Meera Reddy', 'meera.r@estora.com', '+91 98765 44321', 'Is this Worli duplex penthouse negotiable on price? Looking for immediate closing.', 'NEW'),
(4, 10, 7, 7, 'Meera Reddy', 'meera.r@estora.com', '+91 98765 44321', 'We would like to schedule a private tour for Golf Links Luxury floor next Tuesday morning.', 'CLOSED');

-- Seed Favorites
INSERT IGNORE INTO favorites (id, user_id, property_id) VALUES
(1, 3, 1),
(2, 3, 3),
(3, 3, 5),
(4, 10, 2),
(5, 10, 7);
