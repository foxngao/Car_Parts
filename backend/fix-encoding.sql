SET NAMES utf8mb4;

TRUNCATE TABLE part_specifications;
TRUNCATE TABLE part_reviews;

-- ========== PART SPECIFICATIONS ==========
INSERT INTO part_specifications (part_id, spec_name, spec_value, spec_unit) VALUES
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
INSERT INTO part_reviews (part_id, user_id, rating, comment) VALUES
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
(14, 1, 4, N'Rotuyn chính hãng, lắp vừa chuẩn.');
