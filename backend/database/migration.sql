-- =============================================
-- Migration: Add VIN search and Search History tables
-- Run this on existing database
-- =============================================

USE car_parts_db;

-- Bảng ánh xạ VIN prefix → brand (WMI: 3 ký tự đầu)
CREATE TABLE IF NOT EXISTS vin_wmi_mappings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  wmi_code VARCHAR(3) NOT NULL UNIQUE,
  brand_id INT NOT NULL,
  country VARCHAR(100),
  FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Lịch sử tìm kiếm
CREATE TABLE IF NOT EXISTS search_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  search_type ENUM('keyword','vin','image','filter') DEFAULT 'keyword',
  query VARCHAR(500) NOT NULL,
  filters JSON DEFAULT NULL,
  results_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_created (user_id, created_at)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Seed VIN WMI data
INSERT IGNORE INTO vin_wmi_mappings (wmi_code, brand_id, country) VALUES
('JT1', 1, 'Japan'), ('JT2', 1, 'Japan'), ('JT3', 1, 'Japan'), ('JT4', 1, 'Japan'), ('JT5', 1, 'Japan'),
('JT6', 1, 'Japan'), ('JT7', 1, 'Japan'), ('JT8', 1, 'Japan'), ('JTD', 1, 'Japan'), ('JTE', 1, 'Japan'),
('JTK', 1, 'Japan'), ('JTN', 1, 'Japan'), ('JTL', 1, 'Japan'), ('JTM', 1, 'Japan'),
('1NX', 1, 'USA'), ('2T1', 1, 'Canada'), ('4T1', 1, 'USA'), ('5TD', 1, 'USA'),
('MR0', 1, 'Vietnam'), ('RL4', 1, 'Vietnam'),
('JHM', 2, 'Japan'), ('JHL', 2, 'Japan'), ('JHG', 2, 'Japan'),
('1HG', 2, 'USA'), ('2HG', 2, 'Canada'), ('5FN', 2, 'USA'),
('SHH', 2, 'UK'), ('RLH', 2, 'Vietnam'),
('1FA', 3, 'USA'), ('1FB', 3, 'USA'), ('1FC', 3, 'USA'), ('1FD', 3, 'USA'), ('1FM', 3, 'USA'),
('1FT', 3, 'USA'), ('2FA', 3, 'Canada'), ('3FA', 3, 'Mexico'),
('KMH', 4, 'South Korea'), ('KMJ', 4, 'South Korea'), ('5NP', 4, 'USA'),
('MAL', 4, 'India'), ('TMA', 4, 'Czech Republic'),
('WDB', 5, 'Germany'), ('WDC', 5, 'Germany'), ('WDD', 5, 'Germany'),
('4JG', 5, 'USA'), ('55S', 5, 'USA'),
('WBA', 6, 'Germany'), ('WBS', 6, 'Germany'), ('WBY', 6, 'Germany'),
('5UX', 6, 'USA'), ('5YM', 6, 'USA'),
('JM1', 7, 'Japan'), ('JM3', 7, 'Japan'), ('JM6', 7, 'Japan'), ('JM7', 7, 'Japan'),
('KNA', 8, 'South Korea'), ('KND', 8, 'South Korea'), ('5XX', 8, 'USA');
