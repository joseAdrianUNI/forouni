require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error('Falta DATABASE_URL en backend/.env');
    process.exit(1);
}

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
});

const fullName = process.env.ADMIN_FULL_NAME || 'Administrador';
const email = process.env.ADMIN_EMAIL || 'admin@uni.edu';
const studentId = process.env.ADMIN_STUDENT_ID || 'ADMIN-001';
const password = process.env.ADMIN_PASSWORD || 'Admin123!';

async function main() {
    const passwordHash = await bcrypt.hash(password, 10);

    const { rows } = await pool.query(
        `
      insert into users (full_name, email, student_id, password_hash, role)
      values ($1, $2, $3, $4, 'admin')
      on conflict (email) do update
      set full_name = excluded.full_name,
          student_id = excluded.student_id,
          password_hash = excluded.password_hash,
          role = 'admin'
      returning id, full_name, email, student_id, role, created_at;
    `,
        [fullName, email, studentId, passwordHash],
    );

    console.log('Usuario administrador listo:');
    console.log(rows[0]);
    console.log('Credenciales de acceso:');
    console.log({ email, studentId, password });
}

main()
    .catch((error) => {
        console.error('Error al crear el usuario admin:', error);
        process.exit(1);
    })
    .finally(() => {
        pool.end();
    });
