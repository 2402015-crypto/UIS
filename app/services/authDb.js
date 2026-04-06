import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('uis.db');

export async function initAuthDb() {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS carreras (
      codigo TEXT PRIMARY KEY,
      nombre TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS aulas (
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
      tutor TEXT,
      aula TEXT,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'maestro', 'alumno')),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await ensureUsuariosColumns();
  await ensureCarrerasSeed();
  await ensureAulasSeed();
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
    ['tutor', 'TEXT'],
    ['aula', 'TEXT'],
  ];

  for (const [columnName, columnType] of requiredColumns) {
    if (!existingColumns.has(columnName)) {
      await db.execAsync(`ALTER TABLE usuarios ADD COLUMN ${columnName} ${columnType};`);
    }
  }
}

export async function ensureDefaultAdmin() {
  const defaultAdmins = [
    { nombre: 'Servicios Escolares', correo: 'servicios@uis.mx', password: '1234' },
    { nombre: 'Admin UIS', correo: 'admin@uis.mx', password: '1234' },
  ];

  for (const admin of defaultAdmins) {
    await db.runAsync(
      `INSERT OR IGNORE INTO usuarios (nombre, correo, password, role)
       VALUES (?, ?, ?, ?);`,
      [admin.nombre, admin.correo, admin.password, 'admin']
    );
  }
}

async function ensureCarrerasSeed() {
  const defaults = [
    ['software', 'Ingeniería en Software'],
    ['gastronomia', 'Gastronomía'],
    ['contaduria', 'Contaduría'],
  ];

  for (const [codigo, nombre] of defaults) {
    await db.runAsync(
      'INSERT OR IGNORE INTO carreras (codigo, nombre) VALUES (?, ?);',
      [codigo, nombre]
    );
  }
}

async function ensureAulasSeed() {
  const defaults = [
    ['A1', 'Aula 1'],
    ['A2', 'Aula 2'],
    ['A3', 'Aula 3'],
    ['A4', 'Aula 4'],
    ['A5', 'Aula 5'],
    ['A6', 'Aula 6'],
    ['A7', 'Aula 7'],
    ['A8', 'Aula 8'],
    ['A9', 'Aula 9'],
    ['A10', 'Aula 10'],
  ];

  for (const [codigo, nombre] of defaults) {
    await db.runAsync(
      'INSERT OR IGNORE INTO aulas (codigo, nombre) VALUES (?, ?);',
      [codigo, nombre]
    );
  }
}

export async function getCarrerasCatalog() {
  return db.getAllAsync('SELECT codigo, nombre FROM carreras ORDER BY nombre ASC;');
}

export async function getAulasCatalog() {
  return db.getAllAsync('SELECT codigo, nombre FROM aulas ORDER BY codigo ASC;');
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
      u.tutor,
      u.aula,
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
  tutor,
  aula,
  password,
  role = 'alumno',
}) {
  const normalizedCorreo = correo.trim().toLowerCase();
  return db.runAsync(
    `INSERT INTO usuarios (
      nombre, correo, matricula, grupo, cuatrimestre, carrera, tutor, aula, password, role
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [nombre, normalizedCorreo, matricula, grupo, cuatrimestre, carrera, tutor || '', aula || '', password, role]
  );
}

export async function createUserByAdmin({
  nombre,
  correo,
  matricula,
  grupo,
  cuatrimestre,
  carrera,
  tutor,
  aula,
  password,
  role,
}) {
  const normalizedCorreo = correo.trim().toLowerCase();
  return db.runAsync(
    `INSERT INTO usuarios (
      nombre, correo, matricula, grupo, cuatrimestre, carrera, tutor, aula, password, role
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      nombre || '',
      normalizedCorreo,
      matricula || '',
      grupo || '',
      cuatrimestre || '',
      carrera || '',
      tutor || '',
      aula || '',
      password || '1234',
      role,
    ]
  );
}

export async function updateUserByAdmin(id, {
  nombre,
  correo,
  matricula,
  grupo,
  cuatrimestre,
  carrera,
  tutor,
  aula,
  password,
}) {
  const normalizedCorreo = correo.trim().toLowerCase();

  if (password && password.trim().length > 0) {
    return db.runAsync(
      `UPDATE usuarios
       SET nombre = ?, correo = ?, matricula = ?, grupo = ?, cuatrimestre = ?, carrera = ?, tutor = ?, aula = ?, password = ?
       WHERE id = ?;`,
      [
        nombre || '',
        normalizedCorreo,
        matricula || '',
        grupo || '',
        cuatrimestre || '',
        carrera || '',
        tutor || '',
        aula || '',
        password,
        id,
      ]
    );
  }

  return db.runAsync(
    `UPDATE usuarios
     SET nombre = ?, correo = ?, matricula = ?, grupo = ?, cuatrimestre = ?, carrera = ?, tutor = ?, aula = ?
     WHERE id = ?;`,
    [
      nombre || '',
      normalizedCorreo,
      matricula || '',
      grupo || '',
      cuatrimestre || '',
      carrera || '',
      tutor || '',
      aula || '',
      id,
    ]
  );
}

export async function deleteUserByAdmin(id) {
  return db.runAsync('DELETE FROM usuarios WHERE id = ?;', [id]);
}

export async function getUsersByRole(role) {
  return db.getAllAsync(
    `SELECT id, nombre, correo, matricula, grupo, cuatrimestre, carrera, tutor, aula, role
     FROM usuarios
     WHERE role = ?
     ORDER BY id DESC;`,
    [role]
  );
}

export async function getDashboardCounts() {
  const alumnos = await db.getFirstAsync("SELECT COUNT(*) AS total FROM usuarios WHERE role = 'alumno';");
  const maestros = await db.getFirstAsync("SELECT COUNT(*) AS total FROM usuarios WHERE role = 'maestro';");

  return {
    alumnos: alumnos?.total ?? 0,
    maestros: maestros?.total ?? 0,
  };
}

export async function getGroupsCount() {
  const row = await db.getFirstAsync(
    `SELECT COUNT(DISTINCT grupo) AS total
     FROM usuarios
     WHERE role = 'alumno' AND grupo IS NOT NULL AND trim(grupo) <> '';`
  );

  return row?.total ?? 0;
}

export async function getGroupSummaries() {
  return db.getAllAsync(
    `SELECT
       grupo AS clave,
       COALESCE(carrera, 'Sin carrera') AS carrera,
       COALESCE(aula, 'Sin aula') AS aula,
       COALESCE(tutor, 'Sin tutor') AS tutor,
       COUNT(*) AS alumnos
     FROM usuarios
     WHERE role = 'alumno' AND grupo IS NOT NULL AND trim(grupo) <> ''
     GROUP BY grupo, carrera, aula, tutor
     ORDER BY grupo ASC;`
  );
}

export async function getMaestroGroupsByDepartamento(codigoCarrera) {
  return db.getAllAsync(
    `SELECT
       grupo AS clave,
       COALESCE(aula, 'Sin aula') AS aula,
       COALESCE(tutor, 'Sin tutor') AS tutor,
       COUNT(*) AS alumnos
     FROM usuarios
     WHERE role = 'alumno'
       AND carrera = ?
       AND grupo IS NOT NULL
       AND trim(grupo) <> ''
     GROUP BY grupo, aula, tutor
     ORDER BY grupo ASC;`,
    [codigoCarrera || '']
  );
}

export async function getAlumnosByGrupoYCarrera(grupo, codigoCarrera) {
  return db.getAllAsync(
    `SELECT id, nombre, correo, matricula, grupo, cuatrimestre, carrera, tutor, aula
     FROM usuarios
     WHERE role = 'alumno' AND grupo = ? AND carrera = ?
     ORDER BY nombre ASC;`,
    [grupo, codigoCarrera || '']
  );
}

export async function getAlumnoPerfilById(alumnoId) {
  return db.getFirstAsync(
    `SELECT id, nombre, correo, matricula, grupo, cuatrimestre, carrera, tutor, aula
     FROM usuarios
     WHERE id = ? AND role = 'alumno'
     LIMIT 1;`,
    [alumnoId]
  );
}
