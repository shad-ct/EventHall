-- EventHall Database Schema
-- Database name: eventhall

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS eventhall;
USE eventhall;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  photo_url VARCHAR(500),
  role ENUM('STANDARD_USER', 'EVENT_ADMIN', 'ULTIMATE_ADMIN', 'GUEST') DEFAULT 'STANDARD_USER',
  is_student BOOLEAN,
  college_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Event Categories table
CREATE TABLE IF NOT EXISTS event_categories (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User Interests table (many-to-many)
CREATE TABLE IF NOT EXISTS user_interests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  category_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES event_categories(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_category (user_id, category_id),
  INDEX idx_user_id (user_id),
  INDEX idx_category_id (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id VARCHAR(255) NOT NULL,
  title VARCHAR(500) NOT NULL,
  description LONGTEXT NOT NULL,
  date VARCHAR(20) NOT NULL,
  time VARCHAR(20) NOT NULL,
  location VARCHAR(500) NOT NULL,
  district VARCHAR(255) NOT NULL,
  google_maps_link VARCHAR(500),
  entry_fee VARCHAR(255),
  is_free BOOLEAN DEFAULT FALSE,
  prize_details TEXT,
  contact_email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(20) NOT NULL,
  external_registration_link VARCHAR(500),
  how_to_register_link VARCHAR(500),
  instagram_url VARCHAR(500),
  facebook_url VARCHAR(500),
  youtube_url VARCHAR(500),
  banner_url VARCHAR(500),
  status ENUM('DRAFT', 'PENDING_APPROVAL', 'PUBLISHED', 'REJECTED', 'ARCHIVED') DEFAULT 'DRAFT',
  is_featured BOOLEAN DEFAULT FALSE,
  featured_at TIMESTAMP NULL,
  featured_by VARCHAR(255),
  rejection_reason TEXT,
  created_by_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  reviewed_by VARCHAR(255),
  reviewed_at TIMESTAMP NULL,
  archived_at TIMESTAMP NULL,
  archived_by VARCHAR(255),
  published_at TIMESTAMP NULL,
  published_by VARCHAR(255),
  unpublished_at TIMESTAMP NULL,
  unpublished_by VARCHAR(255),
  PRIMARY KEY (id),
  FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (featured_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (archived_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_created_by (created_by_id),
  INDEX idx_is_featured (is_featured),
  INDEX idx_date (date),
  INDEX idx_district (district)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Event Categories association (for primary category)
CREATE TABLE IF NOT EXISTS event_primary_category (
  event_id VARCHAR(255) PRIMARY KEY,
  category_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES event_categories(id) ON DELETE RESTRICT,
  INDEX idx_category_id (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Event Additional Categories association (many-to-many)
CREATE TABLE IF NOT EXISTS event_additional_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id VARCHAR(255) NOT NULL,
  category_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES event_categories(id) ON DELETE RESTRICT,
  UNIQUE KEY unique_event_category (event_id, category_id),
  INDEX idx_event_id (event_id),
  INDEX idx_category_id (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Event Likes table
CREATE TABLE IF NOT EXISTS event_likes (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  event_id VARCHAR(255) NOT NULL,
  deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_event_like (user_id, event_id),
  INDEX idx_user_id (user_id),
  INDEX idx_event_id (event_id),
  INDEX idx_deleted (deleted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Event Registrations table
CREATE TABLE IF NOT EXISTS event_registrations (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  event_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_event_registration (user_id, event_id),
  INDEX idx_user_id (user_id),
  INDEX idx_event_id (event_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Admin Applications table
CREATE TABLE IF NOT EXISTS admin_applications (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  motivation_text TEXT NOT NULL,
  status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
  reviewed_by_user_id VARCHAR(255),
  reviewed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_user_id (user_id),
  INDEX idx_reviewed_by (reviewed_by_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default categories
INSERT INTO event_categories (id, name, slug, description) VALUES
('1', 'Hackathons', 'hackathons', 'Coding competitions and marathons'),
('2', 'Workshops', 'workshops', 'Technical and skill-building workshops'),
('3', 'Conferences', 'conferences', 'Tech talks and conferences'),
('4', 'Seminars', 'seminars', 'Expert seminars and lectures'),
('5', 'Sports', 'sports', 'Sports events and competitions'),
('6', 'Cultural', 'cultural', 'Cultural programs and performances'),
('7', 'Music & Arts', 'music-arts', 'Music concerts and art exhibitions'),
('8', 'Gaming', 'gaming', 'Gaming tournaments and esports')
ON DUPLICATE KEY UPDATE id = id;

-- Insert default users (password_hash = SHA256(password))
INSERT INTO users (id, username, password_hash, email, full_name, role)
VALUES
('user-1', 'user', 'e606e38b0d8c19b24cf0ee3808183162ea7cd63ff7912dbb22b5e803286b4446', 'user@example.com', 'User', 'STANDARD_USER'),
('admin-1', 'admin', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin@example.com', 'Admin', 'EVENT_ADMIN'),
('uadmin-1', 'uadmin', 'bc585d492a6396d310cc0a49060c6ef5101a91c371495d399edb766dff3d5d8a', 'uadmin@example.com', 'Ultimate Admin', 'ULTIMATE_ADMIN')
ON DUPLICATE KEY UPDATE username = username;
