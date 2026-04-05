import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('uis.db');

export async function initAuthDb() {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS carreras (
      codigo TEXT PRIMARY KEY,
      nombre TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT,
      correo TEXT NOT NULL UNIQUE,
      matricula TEXT,
      grupo TEXT,
      cuatrimestre TEXT,
      carrera TEXT,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'maestro', 'alumno')),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await ensureUsuariosColumns();
  await ensureCarrerasSeed();
}

async function ensureUsuariosColumns() {
  const columns = await db.getAllAsync('PRAGMA table_info(usuarios);');
  const existingColumns = new Set(columns.map((column) => column.name));

  const requiredColumns = [
    ['nombre', 'TEXT'],
    ['matricula', 'TEXT'],
    ['grupo', 'TEXT'],
    ['cuatrimestre', 'TEXT'],
    ['carrera', 'TEXT'],
  ];

  for (const [columnName, columnType] of requiredColumns) {
    if (!existingColumns.has(columnName)) {
      await db.execAsync(`ALTER TABLE usuarios ADD COLUMN ${columnName} ${columnType};`);
    }
  }
}

export async function ensureDefaultAdmin() {
  const admin = await db.getFirstAsync(
    'SELECT id FROM usuarios WHERE correo = ? LIMIT 1;',
    ['admin@ius.mx']
  );

  if (!admin) {
    await db.runAsync(
      'INSERT INTO usuarios (correo, password, role) VALUES (?, ?, ?);',
      ['admin@ius.mx', '1234', 'admin']
    );
  }
}

async function ensureCarrerasSeed() {
  const defaults = [
    ['software', 'Ingenieria en Software'],
    ['gastronomia', 'Gastronomia'],
    ['contaduria', 'Contaduria'],
  ];

  for (const [codigo, nombre] of defaults) {
    await db.runAsync(
      'INSERT OR IGNORE INTO carreras (codigo, nombre) VALUES (?, ?);',
      [codigo, nombre]
    );
  }
}

export async function getCarrerasCatalog() {
  return db.getAllAsync('SELECT codigo, nombre FROM carreras ORDER BY nombre ASC;');
}

export async function findUserByCredentials(correo, password) {
  const normalizedCorreo = correo.trim().toLowerCase();
  return db.getFirstAsync(
    `SELECT
       u.id,
       u.nombre,
       u.correo,
       u.matricula,
       u.grupo,
       u.cuatrimestre,
       u.carrera,
       c.nombre AS carreraNombre,
       u.role
     FROM usuarios u
     LEFT JOIN carreras c ON c.codigo = u.carrera
     WHERE lower(correo) = ? AND password = ?
     LIMIT 1;`,
    [normalizedCorreo, password]
  );
}

export async function userExistsByCorreo(correo) {
  const normalizedCorreo = correo.trim().toLowerCase();
  const user = await db.getFirstAsync(
    'SELECT id FROM usuarios WHERE lower(correo) = ? LIMIT 1;',
    [normalizedCorreo]
  );

  return Boolean(user);
}

export async function registerAuthUser({
  nombre,
  correo,
  matricula,
  grupo,
  cuatrimestre,
  carrera,
  password,
  role = 'alumno',
}) {
  const normalizedCorreo = correo.trim().toLowerCase();
  return db.runAsync(
    `INSERT INTO usuarios (
      nombre, correo, matricula, grupo, cuatrimestre, carrera, password, role
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
    [nombre, normalizedCorreo, matricula, grupo, cuatrimestre, carrera, password, role]
  );
}
