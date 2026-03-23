USE car_parts_db;

-- Xóa dữ liệu cũ nếu có (tránh duplicate)
DELETE FROM parts WHERE is_combo = TRUE;

-- Insert Combo 1: Combo Bảo dưỡng định kỳ
INSERT INTO parts (category_id, name, description, price, stock_quantity, is_combo, image_url) 
VALUES (1, N'Combo Bảo dưỡng định kỳ', N'Gồm Lọc dầu động cơ Toyota + 4 Bugi NGK Iridium. Ưu đãi mùa bảo dưỡng!', 450000, 50, TRUE, 'https://images.unsplash.com/photo-1632823469850-1d71013f9f4d?w=500');

SET @combo1_id = LAST_INSERT_ID();

INSERT INTO combo_items (combo_id, part_id, quantity) VALUES (@combo1_id, 1, 1);
INSERT INTO combo_items (combo_id, part_id, quantity) VALUES (@combo1_id, 2, 4);

-- Insert Combo 2: Combo Hệ thống phanh an toàn
INSERT INTO parts (category_id, name, description, price, stock_quantity, is_combo, image_url) 
VALUES (2, N'Combo Hệ thống phanh an toàn', N'Bao gồm Má phanh trước Brembo + 2 hộp Dầu phanh Bosch. Đảm bảo phanh nhạy, an toàn tuyệt đối', 650000, 30, TRUE, 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=500');

SET @combo2_id = LAST_INSERT_ID();

INSERT INTO combo_items (combo_id, part_id, quantity) VALUES (@combo2_id, 4, 1);
INSERT INTO combo_items (combo_id, part_id, quantity) VALUES (@combo2_id, 6, 2);
