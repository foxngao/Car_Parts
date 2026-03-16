const db = require('./src/config/db');

async function runFix() {
  try {
    await db.query('TRUNCATE TABLE part_specifications');
    await db.query('TRUNCATE TABLE part_reviews');

    console.log('Tables truncated. Inserting specs...');

    const specs = [
      [1, 'Trọng lượng', '250', 'g'],
      [1, 'Kích thước', '80x80x100', 'mm'],
      [1, 'Chất liệu', 'Thép không gỉ + giấy lọc', null],
      [1, 'Thương hiệu', 'Toyota Genuine', null],
      [1, 'Bảo hành', '6', 'tháng'],
      [1, 'Xuất xứ', 'Nhật Bản', null],
      [2, 'Trọng lượng', '45', 'g'],
      [2, 'Kích thước', '14x19x26.5', 'mm'],
      [2, 'Chất liệu', 'Iridium', null],
      [2, 'Thương hiệu', 'NGK', null],
      [2, 'Bảo hành', '12', 'tháng'],
      [2, 'Xuất xứ', 'Nhật Bản', null],
      [2, 'Khe hở bugi', '0.8', 'mm'],
      [3, 'Trọng lượng', '320', 'g'],
      [3, 'Chiều dài', '1050', 'mm'],
      [3, 'Chất liệu', 'Cao su EPDM', null],
      [3, 'Thương hiệu', 'Honda Genuine', null],
      [3, 'Bảo hành', '12', 'tháng'],
      [3, 'Xuất xứ', 'Thái Lan', null],
      [4, 'Trọng lượng', '800', 'g'],
      [4, 'Kích thước', '155x62x17', 'mm'],
      [4, 'Chất liệu', 'Ceramic composite', null],
      [4, 'Thương hiệu', 'Brembo', null],
      [4, 'Bảo hành', '24', 'tháng'],
      [4, 'Xuất xứ', 'Ý', null],
      [4, 'Nhiệt độ hoạt động', '0-600', '°C'],
      [5, 'Trọng lượng', '4500', 'g'],
      [5, 'Đường kính', '281', 'mm'],
      [5, 'Độ dày', '12', 'mm'],
      [5, 'Chất liệu', 'Gang đúc', null],
      [5, 'Thương hiệu', 'Toyota Genuine', null],
      [5, 'Bảo hành', '12', 'tháng'],
      [5, 'Xuất xứ', 'Nhật Bản', null],
      [6, 'Trọng lượng', '1050', 'g'],
      [6, 'Dung tích', '1', 'lít'],
      [6, 'Chất liệu', 'Dầu tổng hợp DOT4', null],
      [6, 'Thương hiệu', 'Bosch', null],
      [6, 'Bảo hành', '24', 'tháng'],
      [6, 'Xuất xứ', 'Đức', null],
      [6, 'Điểm sôi khô', '230', '°C'],
      [7, 'Trọng lượng', '15000', 'g'],
      [7, 'Kích thước', '242x175x190', 'mm'],
      [7, 'Điện áp', '12', 'V'],
      [7, 'Dung lượng', '60', 'Ah'],
      [7, 'Thương hiệu', 'Varta', null],
      [7, 'Bảo hành', '18', 'tháng'],
      [7, 'Xuất xứ', 'Đức', null],
      [8, 'Trọng lượng', '120', 'g'],
      [8, 'Công suất', '55', 'W'],
      [8, 'Nhiệt độ màu', '6000', 'K'],
      [8, 'Thương hiệu', 'Philips', null],
      [8, 'Bảo hành', '12', 'tháng'],
      [8, 'Xuất xứ', 'Hà Lan', null],
      [8, 'Tuổi thọ', '50000', 'giờ'],
      [9, 'Trọng lượng', '450', 'g'],
      [9, 'Điện áp', '12', 'V'],
      [9, 'Cường độ âm', '118', 'dB'],
      [9, 'Thương hiệu', 'Hella', null],
      [9, 'Bảo hành', '12', 'tháng'],
      [9, 'Xuất xứ', 'Đức', null],
      [10, 'Trọng lượng', '680', 'g'],
      [10, 'Chất liệu', 'ABS + kính chống chói', null],
      [10, 'Thương hiệu', 'Honda Genuine', null],
      [10, 'Bảo hành', '6', 'tháng'],
      [10, 'Xuất xứ', 'Thái Lan', null],
      [10, 'Tính năng', 'Chỉnh điện, gập tự động', null],
      [11, 'Trọng lượng', '8500', 'g'],
      [11, 'Chất liệu', 'Thép sơn tĩnh điện', null],
      [11, 'Thương hiệu', 'Ford Genuine', null],
      [11, 'Bảo hành', '12', 'tháng'],
      [11, 'Xuất xứ', 'Thái Lan', null],
      [12, 'Trọng lượng', '3200', 'g'],
      [12, 'Chiều dài', '520', 'mm'],
      [12, 'Chất liệu', 'Thép hợp kim + dầu thủy lực', null],
      [12, 'Thương hiệu', 'KYB', null],
      [12, 'Bảo hành', '24', 'tháng'],
      [12, 'Xuất xứ', 'Nhật Bản', null],
      [12, 'Loại', 'Excel-G Gas', null],
      [13, 'Trọng lượng', '550', 'g'],
      [13, 'Chất liệu', 'Cao su thiên nhiên', null],
      [13, 'Thương hiệu', 'Toyota Genuine', null],
      [13, 'Bảo hành', '6', 'tháng'],
      [13, 'Xuất xứ', 'Nhật Bản', null],
      [14, 'Trọng lượng', '380', 'g'],
      [14, 'Chất liệu', 'Thép rèn', null],
      [14, 'Thương hiệu', 'Toyota Genuine', null],
      [14, 'Bảo hành', '12', 'tháng'],
      [14, 'Xuất xứ', 'Nhật Bản', null]
    ];

    for (const spec of specs) {
      await db.query(
        'INSERT INTO part_specifications (part_id, spec_name, spec_value, spec_unit) VALUES (?, ?, ?, ?)',
        spec
      );
    }

    console.log('Specs inserted. Inserting reviews...');

    const reviews = [
      [1, 1, 5, 'Lọc dầu chính hãng, chất lượng tốt, lắp vừa khít.'],
      [2, 1, 5, 'Bugi NGK Iridium rất tốt, xe chạy êm hơn hẳn.'],
      [3, 1, 4, 'Dây curoa chất lượng ổn, nhưng giá hơi cao.'],
      [4, 1, 5, 'Má phanh Brembo cực kỳ hiệu quả, phanh rất nhạy.'],
      [5, 1, 4, 'Đĩa phanh chính hãng, lắp đặt dễ dàng.'],
      [6, 1, 4, 'Dầu phanh Bosch DOT4 chất lượng tốt.'],
      [7, 1, 5, 'Ắc quy Varta rất bền, khởi động mạnh.'],
      [8, 1, 4, 'Đèn LED sáng đẹp, dễ lắp đặt.'],
      [9, 1, 5, 'Còi Hella âm thanh to và rõ, rất tốt.'],
      [10, 1, 3, 'Gương chất lượng ổn nhưng kính hơi mỏng.'],
      [12, 1, 5, 'Giảm xóc KYB cực kỳ êm ái, đáng tiền.'],
      [13, 1, 4, 'Cao su chân máy chống rung tốt.'],
      [14, 1, 4, 'Rotuyn chính hãng, lắp vừa chuẩn.']
    ];

    for (const review of reviews) {
      await db.query(
        'INSERT INTO part_reviews (part_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
        review
      );
    }

    console.log('✅ All data inserted successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

runFix();
