const db = require('./src/config/db');

async function check() {
  const [rows] = await db.query('SELECT spec_name FROM part_specifications WHERE spec_name LIKE "%nh%" LIMIT 1');
  const str = rows[0].spec_name;
  console.log('String:', str);
  console.log('Length:', str.length);
  
  const codes = [];
  for (let i = 0; i < str.length; i++) {
    codes.push(str.charCodeAt(i));
  }
  console.log('Char codes:', codes);
  process.exit(0);
}
check();
