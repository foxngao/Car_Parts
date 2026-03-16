-- =============================================
-- Seed Data for Car Parts Database
-- =============================================

USE car_parts_db;

-- ========== ROLES ==========
INSERT IGNORE INTO roles (id, name) VALUES 
(1, 'admin'), 
(2, 'user');

-- ========== USERS ==========
INSERT IGNORE INTO users (id, username, password, email, full_name, phone, address, is_active) VALUES
(1, 'admin', '$2a$10$mFm2pLg9x7.PqYqXqYqXqOqXqYqXqYqXqYqXqYqXqYqXqYqXqY', 'admin@carparts.com', 'System Admin', NULL, NULL, TRUE);


-- ========== USER ROLES ==========
INSERT IGNORE INTO user_roles (user_id, role_id) VALUES 
(1, 1);

-- ========== NOTIFICATIONS ==========
INSERT IGNORE INTO notifications (user_id, type, title, message, data, is_read, created_at) VALUES
(2, 'order_created', N'Đơn hàng đã được tạo', N'Đơn hàng #1 đã được tạo thành công với tổng giá trị 1.500.000₫', '{"orderId":1}', TRUE, NOW() - INTERVAL 7 DAY),
(2, 'order_confirmed', N'Đơn hàng đã được xác nhận', N'Đơn hàng #1 đã được xác nhận thanh toán. Chúng tôi sẽ sớm giao hàng cho bạn.', '{"orderId":1}', TRUE, NOW() - INTERVAL 6 DAY),
(2, 'order_shipped', N'Đơn hàng đang được giao', N'Đơn hàng #1 đang được vận chuyển. Dự kiến giao trong 3-5 ngày.', '{"orderId":1}', TRUE, NOW() - INTERVAL 5 DAY),
(2, 'order_delivered', N'Đơn hàng đã giao thành công', N'Đơn hàng #1 đã được giao thành công. Cảm ơn bạn đã mua sắm!', '{"orderId":1}', TRUE, NOW() - INTERVAL 4 DAY),
(2, 'order_created', N'Đơn hàng mới', N'Đơn hàng #2 đã được tạo thành công với tổng giá trị 850.000₫', '{"orderId":2}', FALSE, NOW() - INTERVAL 2 DAY),
(2, 'order_confirmed', N'Đơn hàng đã xác nhận', N'Đơn hàng #2 đã được xác nhận thanh toán', '{"orderId":2}', FALSE, NOW() - INTERVAL 1 DAY),
(2, 'promotion', N'Khuyến mãi đặc biệt', N'Giảm giá 20% cho tất cả phụ tùng động cơ', '{}', FALSE, NOW() - INTERVAL 12 HOUR);

-- ========== BRANDS ==========
INSERT IGNORE INTO brands (name, country) VALUES
('Toyota', 'Japan'),
('Honda', 'Japan'),
('Ford', 'USA'),
('Hyundai', 'South Korea'),
('Mercedes-Benz', 'Germany'),
('BMW', 'Germany'),
('Mazda', 'Japan'),
('Kia', 'South Korea');

-- ========== CAR MODELS ==========
INSERT IGNORE INTO car_models (brand_id, name) VALUES
-- Toyota (brand_id = 1)
(1, 'Camry'),
(1, 'Corolla'),
(1, 'Vios'),
-- Honda (brand_id = 2)
(2, 'Civic'),
(2, 'CR-V'),
(2, 'City'),
-- Ford (brand_id = 3)
(3, 'Ranger'),
(3, 'Everest'),
-- Hyundai (brand_id = 4)
(4, 'Accent'),
(4, 'Tucson'),
-- Mercedes (brand_id = 5)
(5, 'C-Class'),
-- BMW (brand_id = 6)
(6, '3 Series'),
-- Mazda (brand_id = 7)
(7, 'Mazda3'),
(7, 'CX-5'),
-- Kia (brand_id = 8)
(8, 'Seltos'),
(8, 'K3');

-- ========== MODEL YEARS ==========
INSERT IGNORE INTO model_years (model_id, year) VALUES
-- Camry (model_id = 1)
(1, 2022), (1, 2023), (1, 2024),
-- Corolla (model_id = 2)
(2, 2022), (2, 2023),
-- Vios (model_id = 3)
(3, 2023), (3, 2024),
-- Civic (model_id = 4)
(4, 2022), (4, 2023), (4, 2024),
-- CR-V (model_id = 5)
(5, 2023), (5, 2024),
-- City (model_id = 6)
(6, 2023),
-- Ranger (model_id = 7)
(7, 2023), (7, 2024),
-- Everest (model_id = 8)
(8, 2023),
-- Accent (model_id = 9)
(9, 2023), (9, 2024),
-- Tucson (model_id = 10)
(10, 2023),
-- C-Class (model_id = 11)
(11, 2023),
-- 3 Series (model_id = 12)
(12, 2023),
-- Mazda3 (model_id = 13)
(13, 2023), (13, 2024),
-- CX-5 (model_id = 14)
(14, 2023),
-- Seltos (model_id = 15)
(15, 2023), (15, 2024),
-- K3 (model_id = 16)
(16, 2023);

-- ========== CATEGORIES ==========
INSERT IGNORE INTO categories (name) VALUES
(N'Động cơ'),
(N'Hệ thống phanh'),
(N'Hệ thống điện'),
(N'Thân vỏ xe'),
(N'Hệ thống treo'),
(N'Hệ thống lái'),
(N'Phụ kiện nội thất'),
(N'Phụ kiện ngoại thất');

-- ========== PARTS ==========
INSERT IGNORE INTO parts (category_id, name, description, price, stock_quantity, image_url) VALUES
-- Động cơ
(1, N'Lọc dầu động cơ Toyota', N'Lọc dầu chính hãng cho các dòng xe Toyota', 150000, 100, NULL),
(1, N'Bugi NGK Iridium', N'Bugi đánh lửa cao cấp NGK Iridium, phù hợp nhiều dòng xe', 85000, 200, NULL),
(1, N'Dây curoa tổng Honda', N'Dây curoa tổng cho động cơ Honda 1.5L', 320000, 50, NULL),
-- Hệ thống phanh
(2, N'Má phanh trước Brembo', N'Má phanh hiệu suất cao Brembo cho sedan', 450000, 80, NULL),
(2, N'Đĩa phanh sau Toyota Camry', N'Đĩa phanh sau chính hãng cho Toyota Camry', 680000, 30, NULL),
(2, N'Dầu phanh DOT4 Bosch', N'Dầu phanh Bosch DOT4 1 lít', 120000, 150, NULL),
-- Hệ thống điện
(3, N'Ắc quy Varta 12V 60Ah', N'Ắc quy khởi động Varta chính hãng', 1500000, 40, NULL),
(3, N'Bóng đèn pha LED H7', N'Bóng đèn LED H7 siêu sáng 6000K', 350000, 120, NULL),
(3, N'Còi xe Hella Twin Tone', N'Còi xe Hella âm thanh kép chính hãng', 280000, 60, NULL),
-- Thân vỏ xe
(4, N'Gương chiếu hậu trái Honda Civic', N'Gương chiếu hậu điện chỉnh cho Honda Civic', 850000, 25, NULL),
(4, N'Cản trước Ford Ranger', N'Cản trước nguyên bản Ford Ranger 2023', 2500000, 15, NULL),
-- Hệ thống treo
(5, N'Giảm xóc trước KYB', N'Giảm xóc trước KYB Excel-G cho sedan', 750000, 45, NULL),
(5, N'Cao su chân máy Toyota', N'Cao su chân máy chống rung cho Toyota', 220000, 70, NULL),
-- Hệ thống lái
(6, N'Rotuyn lái ngoài Toyota Vios', N'Rotuyn lái ngoài chính hãng cho Vios', 180000, 55, NULL),
(6, N'Dầu trợ lực lái ATF', N'Dầu trợ lực lái tổng hợp 1 lít', 95000, 130, NULL);

-- ========== PART COMPATIBILITY ==========
INSERT IGNORE INTO part_compatibility (part_id, model_year_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7),
(2, 1), (2, 2), (2, 4), (2, 5), (2, 8), (2, 9), (2, 10),
(3, 8), (3, 9), (3, 10), (3, 11), (3, 12), (3, 13),
(4, 1), (4, 2), (4, 3), (4, 8), (4, 9), (4, 10),
(5, 1), (5, 2), (5, 3),
(6, 1), (6, 2), (6, 8), (6, 9), (6, 14), (6, 15),
(7, 1), (7, 2), (7, 8), (7, 9), (7, 14), (7, 15), (7, 17), (7, 18),
(8, 1), (8, 2), (8, 4), (8, 5), (8, 8), (8, 9),
(10, 8), (10, 9), (10, 10),
(11, 14), (11, 15),
(12, 1), (12, 2), (12, 4), (12, 5), (12, 8), (12, 9),
(13, 1), (13, 2), (13, 3), (13, 6), (13, 7),
(14, 6), (14, 7);

-- ========== VIN WMI MAPPINGS ==========
INSERT IGNORE INTO vin_wmi_mappings (wmi_code, brand_id, country) VALUES
-- Toyota (brand_id = 1)
('JT1', 1, 'Japan'), ('JT2', 1, 'Japan'), ('JT3', 1, 'Japan'), ('JT4', 1, 'Japan'), ('JT5', 1, 'Japan'),
('JT6', 1, 'Japan'), ('JT7', 1, 'Japan'), ('JT8', 1, 'Japan'), ('JTD', 1, 'Japan'), ('JTE', 1, 'Japan'),
('JTK', 1, 'Japan'), ('JTN', 1, 'Japan'), ('JTL', 1, 'Japan'), ('JTM', 1, 'Japan'),
('1NX', 1, 'USA'), ('2T1', 1, 'Canada'), ('4T1', 1, 'USA'), ('5TD', 1, 'USA'),
('MR0', 1, 'Vietnam'), ('RL4', 1, 'Vietnam'),
-- Honda (brand_id = 2)
('JHM', 2, 'Japan'), ('JHL', 2, 'Japan'), ('JHG', 2, 'Japan'),
('1HG', 2, 'USA'), ('2HG', 2, 'Canada'), ('5FN', 2, 'USA'),
('SHH', 2, 'UK'), ('RLH', 2, 'Vietnam'),
-- Ford (brand_id = 3)
('1FA', 3, 'USA'), ('1FB', 3, 'USA'), ('1FC', 3, 'USA'), ('1FD', 3, 'USA'), ('1FM', 3, 'USA'),
('1FT', 3, 'USA'), ('2FA', 3, 'Canada'), ('3FA', 3, 'Mexico'),
-- Hyundai (brand_id = 4)
('KMH', 4, 'South Korea'), ('KMJ', 4, 'South Korea'), ('5NP', 4, 'USA'),
('MAL', 4, 'India'), ('TMA', 4, 'Czech Republic'),
-- Mercedes-Benz (brand_id = 5)
('WDB', 5, 'Germany'), ('WDC', 5, 'Germany'), ('WDD', 5, 'Germany'),
('4JG', 5, 'USA'), ('55S', 5, 'USA'),
-- BMW (brand_id = 6)
('WBA', 6, 'Germany'), ('WBS', 6, 'Germany'), ('WBY', 6, 'Germany'),
('5UX', 6, 'USA'), ('5YM', 6, 'USA'),
-- Mazda (brand_id = 7)
('JM1', 7, 'Japan'), ('JM3', 7, 'Japan'), ('JM6', 7, 'Japan'), ('JM7', 7, 'Japan'),
-- Kia (brand_id = 8)
('KNA', 8, 'South Korea'), ('KND', 8, 'South Korea'), ('5XX', 8, 'USA');

-- ========== PART SPECIFICATIONS ==========
INSERT IGNORE INTO part_specifications (part_id, spec_name, spec_value, spec_unit) VALUES
-- Lọc dầu động cơ Toyota (part_id = 1)
(1, N'Trọng lượng', '250', 'g'),
(1, N'Kích thước', '80x80x100', 'mm'),
(1, N'Chất liệu', N'Thép không gỉ + giấy lọc', NULL),
(1, N'Thương hiệu', 'Toyota Genuine', NULL),
(1, N'Bảo hành', '6', N'tháng'),
(1, N'Xuất xứ', N'Nhật Bản', NULL),
-- Bugi NGK Iridium (part_id = 2)
(2, N'Trọng lượng', '45', 'g'),
(2, N'Kích thước', '14x19x26.5', 'mm'),
(2, N'Chất liệu', 'Iridium', NULL),
(2, N'Thương hiệu', 'NGK', NULL),
(2, N'Bảo hành', '12', N'tháng'),
(2, N'Xuất xứ', N'Nhật Bản', NULL),
(2, N'Khe hở bugi', '0.8', 'mm'),
-- Dây curoa tổng Honda (part_id = 3)
(3, N'Trọng lượng', '320', 'g'),
(3, N'Chiều dài', '1050', 'mm'),
(3, N'Chất liệu', N'Cao su EPDM', NULL),
(3, N'Thương hiệu', 'Honda Genuine', NULL),
(3, N'Bảo hành', '12', N'tháng'),
(3, N'Xuất xứ', N'Thái Lan', NULL),
-- Má phanh trước Brembo (part_id = 4)
(4, N'Trọng lượng', '800', 'g'),
(4, N'Kích thước', '155x62x17', 'mm'),
(4, N'Chất liệu', N'Ceramic composite', NULL),
(4, N'Thương hiệu', 'Brembo', NULL),
(4, N'Bảo hành', '24', N'tháng'),
(4, N'Xuất xứ', N'Ý', NULL),
(4, N'Nhiệt độ hoạt động', '0-600', '°C'),
-- Đĩa phanh sau Toyota Camry (part_id = 5)
(5, N'Trọng lượng', '4500', 'g'),
(5, N'Đường kính', '281', 'mm'),
(5, N'Độ dày', '12', 'mm'),
(5, N'Chất liệu', N'Gang đúc', NULL),
(5, N'Thương hiệu', 'Toyota Genuine', NULL),
(5, N'Bảo hành', '12', N'tháng'),
(5, N'Xuất xứ', N'Nhật Bản', NULL),
-- Dầu phanh DOT4 Bosch (part_id = 6)
(6, N'Trọng lượng', '1050', 'g'),
(6, N'Dung tích', '1', N'lít'),
(6, N'Chất liệu', N'Dầu tổng hợp DOT4', NULL),
(6, N'Thương hiệu', 'Bosch', NULL),
(6, N'Bảo hành', '24', N'tháng'),
(6, N'Xuất xứ', N'Đức', NULL),
(6, N'Điểm sôi khô', '230', '°C'),
-- Ắc quy Varta (part_id = 7)
(7, N'Trọng lượng', '15000', 'g'),
(7, N'Kích thước', '242x175x190', 'mm'),
(7, N'Điện áp', '12', 'V'),
(7, N'Dung lượng', '60', 'Ah'),
(7, N'Thương hiệu', 'Varta', NULL),
(7, N'Bảo hành', '18', N'tháng'),
(7, N'Xuất xứ', N'Đức', NULL),
-- Bóng đèn pha LED H7 (part_id = 8)
(8, N'Trọng lượng', '120', 'g'),
(8, N'Công suất', '55', 'W'),
(8, N'Nhiệt độ màu', '6000', 'K'),
(8, N'Thương hiệu', 'Philips', NULL),
(8, N'Bảo hành', '12', N'tháng'),
(8, N'Xuất xứ', N'Hà Lan', NULL),
(8, N'Tuổi thọ', '50000', N'giờ'),
-- Còi xe Hella (part_id = 9)
(9, N'Trọng lượng', '450', 'g'),
(9, N'Điện áp', '12', 'V'),
(9, N'Cường độ âm', '118', 'dB'),
(9, N'Thương hiệu', 'Hella', NULL),
(9, N'Bảo hành', '12', N'tháng'),
(9, N'Xuất xứ', N'Đức', NULL),
-- Gương chiếu hậu Honda Civic (part_id = 10)
(10, N'Trọng lượng', '680', 'g'),
(10, N'Chất liệu', N'ABS + kính chống chói', NULL),
(10, N'Thương hiệu', 'Honda Genuine', NULL),
(10, N'Bảo hành', '6', N'tháng'),
(10, N'Xuất xứ', N'Thái Lan', NULL),
(10, N'Tính năng', N'Chỉnh điện, gập tự động', NULL),
-- Cản trước Ford Ranger (part_id = 11)
(11, N'Trọng lượng', '8500', 'g'),
(11, N'Chất liệu', N'Thép sơn tĩnh điện', NULL),
(11, N'Thương hiệu', 'Ford Genuine', NULL),
(11, N'Bảo hành', '12', N'tháng'),
(11, N'Xuất xứ', N'Thái Lan', NULL),
-- Giảm xóc trước KYB (part_id = 12)
(12, N'Trọng lượng', '3200', 'g'),
(12, N'Chiều dài', '520', 'mm'),
(12, N'Chất liệu', N'Thép hợp kim + dầu thủy lực', NULL),
(12, N'Thương hiệu', 'KYB', NULL),
(12, N'Bảo hành', '24', N'tháng'),
(12, N'Xuất xứ', N'Nhật Bản', NULL),
(12, N'Loại', 'Excel-G Gas', NULL),
-- Cao su chân máy Toyota (part_id = 13)
(13, N'Trọng lượng', '550', 'g'),
(13, N'Chất liệu', N'Cao su thiên nhiên', NULL),
(13, N'Thương hiệu', 'Toyota Genuine', NULL),
(13, N'Bảo hành', '6', N'tháng'),
(13, N'Xuất xứ', N'Nhật Bản', NULL),
-- Rotuyn lái ngoài Toyota Vios (part_id = 14)
(14, N'Trọng lượng', '380', 'g'),
(14, N'Chất liệu', N'Thép rèn', NULL),
(14, N'Thương hiệu', 'Toyota Genuine', NULL),
(14, N'Bảo hành', '12', N'tháng'),
(14, N'Xuất xứ', N'Nhật Bản', NULL);

-- ========== PART REVIEWS (sample reviews from admin user) ==========
INSERT IGNORE INTO part_reviews (part_id, user_id, rating, comment) VALUES
(1, 1, 5, N'Lọc dầu chính hãng, chất lượng tốt, lắp vừa khít.'),
(2, 1, 5, N'Bugi NGK Iridium rất tốt, xe chạy êm hơn hẳn.'),
(3, 1, 4, N'Dây curoa chất lượng ổn, nhưng giá hơi cao.'),
(4, 1, 5, N'Má phanh Brembo cực kỳ hiệu quả, phanh rất nhạy.'),
(5, 1, 4, N'Đĩa phanh chính hãng, lắp đặt dễ dàng.'),
(6, 1, 4, N'Dầu phanh Bosch DOT4 chất lượng tốt.'),
(7, 1, 5, N'Ắc quy Varta rất bền, khởi động mạnh.'),
(8, 1, 4, N'Đèn LED sáng đẹp, dễ lắp đặt.'),
(9, 1, 5, N'Còi Hella âm thanh to và rõ, rất tốt.'),
(10, 1, 3, N'Gương chất lượng ổn nhưng kính hơi mỏng.'),
(12, 1, 5, N'Giảm xóc KYB cực kỳ êm ái, đáng tiền.'),
(13, 1, 4, N'Cao su chân máy chống rung tốt.'),


