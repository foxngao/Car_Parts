ALTER TABLE parts ADD COLUMN is_combo BOOLEAN DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS favorite_parts (
  user_id INT NOT NULL,
  part_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, part_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (part_id) REFERENCES parts(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS combo_items (
  combo_id INT NOT NULL,
  part_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  PRIMARY KEY (combo_id, part_id),
  FOREIGN KEY (combo_id) REFERENCES parts(id) ON DELETE CASCADE,
  FOREIGN KEY (part_id) REFERENCES parts(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
