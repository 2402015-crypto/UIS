import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('uis.db');

function normalizeValue(value) {
  if (value == null) return '';
  return String(value).trim();
}

function normalizeNullableValue(value) {
  const normalized = normalizeValue(value);
  return normalized.length > 0 ? normalized : null;
}

async function upsertGroupRecord(grupo, carreraCodigo = null, aulaCodigo = null, tutor = null) {
  const normalizedGrupo = normalizeValue(grupo);

  if (!normalizedGrupo) {
    return;
  }

  await db.runAsync(
    `INSERT INTO grupos (id, nombre, carrera_codigo, aula_codigo, tutor)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       nombre = excluded.nombre,
       carrera_codigo = COALESCE(excluded.carrera_codigo, grupos.carrera_codigo),
       aula_codigo = COALESCE(excluded.aula_codigo, grupos.aula_codigo),
       tutor = COALESCE(excluded.tutor, grupos.tutor);`,
    [normalizedGrupo, normalizedGrupo, normalizeNullableValue(carreraCodigo), normalizeNullableValue(aulaCodigo), normalizeNullableValue(tutor)]
  );
}

async function ensureGroupsTable() {
  const groups = await db.getAllAsync(
    `SELECT DISTINCT COALESCE(NULLIF(TRIM(grupo_id), ''), NULLIF(TRIM(grupo), '')) AS grupo
     FROM usuarios
     WHERE role = 'alumno'
       AND COALESCE(NULLIF(TRIM(grupo_id), ''), NULLIF(TRIM(grupo), '')) IS NOT NULL;`
  );

  for (const item of groups || []) {
    const grupo = normalizeValue(item.grupo);
    if (!grupo) {
      continue;
    }

    const row = await db.getFirstAsync(
      `SELECT
         COALESCE(NULLIF(TRIM(carrera_codigo), ''), NULLIF(TRIM(carrera), '')) AS carrera_codigo,
         COALESCE(NULLIF(TRIM(aula_codigo), ''), NULLIF(TRIM(aula), '')) AS aula_codigo,
         COALESCE(NULLIF(TRIM(tutor), ''), NULLIF(TRIM(nombre), '')) AS tutor
       FROM usuarios
       WHERE role = 'alumno' AND COALESCE(NULLIF(TRIM(grupo_id), ''), NULLIF(TRIM(grupo), '')) = ?
       ORDER BY id ASC
       LIMIT 1;`,
      [grupo]
    );

    await upsertGroupRecord(grupo, row?.carrera_codigo, row?.aula_codigo, row?.tutor);
  }
}

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

    CREATE TABLE IF NOT EXISTS grupos (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      carrera_codigo TEXT,
      aula_codigo TEXT,
      tutor TEXT,
      tutor_maestro_id INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (carrera_codigo) REFERENCES carreras(codigo)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
      FOREIGN KEY (aula_codigo) REFERENCES aulas(codigo)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
      FOREIGN KEY (tutor_maestro_id) REFERENCES usuarios(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT,
      correo TEXT NOT NULL UNIQUE,
      matricula TEXT,
      grupo TEXT,
      grupo_id TEXT,
      cuatrimestre TEXT,
      carrera TEXT,
      carrera_codigo TEXT,
      tutor TEXT,
      aula TEXT,
      aula_codigo TEXT,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'maestro', 'alumno')),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (grupo_id) REFERENCES grupos(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
      FOREIGN KEY (carrera_codigo) REFERENCES carreras(codigo)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
      FOREIGN KEY (aula_codigo) REFERENCES aulas(codigo)
        ON UPDATE CASCADE
        ON DELETE SET NULL
    );
  `);

  await ensureUsuariosColumns();
  await ensureGroupsTable();
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
    ['grupo_id', 'TEXT'],
    ['cuatrimestre', 'TEXT'],
    ['carrera', 'TEXT'],
    ['carrera_codigo', 'TEXT'],
    ['tutor', 'TEXT'],
    ['aula', 'TEXT'],
    ['aula_codigo', 'TEXT'],
  ];

  for (const [columnName, columnType] of requiredColumns) {
    if (!existingColumns.has(columnName)) {
      await db.execAsync(`ALTER TABLE usuarios ADD COLUMN ${columnName} ${columnType};`);
    }
  }

  await db.runAsync(
    `UPDATE usuarios
     SET grupo_id = COALESCE(NULLIF(TRIM(grupo_id), ''), NULLIF(TRIM(grupo), '')),
         carrera_codigo = COALESCE(NULLIF(TRIM(carrera_codigo), ''), NULLIF(TRIM(carrera), '')),
         aula_codigo = COALESCE(NULLIF(TRIM(aula_codigo), ''), NULLIF(TRIM(aula), ''))
     WHERE 1 = 1;`
  );
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
       COALESCE(NULLIF(TRIM(u.grupo_id), ''), NULLIF(TRIM(u.grupo), '')) AS grupo,
       COALESCE(NULLIF(TRIM(u.grupo_id), ''), NULLIF(TRIM(u.grupo), '')) AS grupo_id,
       u.cuatrimestre,
       COALESCE(NULLIF(TRIM(u.carrera_codigo), ''), NULLIF(TRIM(u.carrera), '')) AS carrera,
       COALESCE(NULLIF(TRIM(u.carrera_codigo), ''), NULLIF(TRIM(u.carrera), '')) AS carrera_codigo,
       u.tutor,
       COALESCE(NULLIF(TRIM(u.aula_codigo), ''), NULLIF(TRIM(u.aula), '')) AS aula,
       COALESCE(NULLIF(TRIM(u.aula_codigo), ''), NULLIF(TRIM(u.aula), '')) AS aula_codigo,
       c.nombre AS carreraNombre,
       u.role
     FROM usuarios u
     LEFT JOIN carreras c ON c.codigo = COALESCE(NULLIF(TRIM(u.carrera_codigo), ''), NULLIF(TRIM(u.carrera), ''))
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
  const normalizedGrupo = normalizeNullableValue(grupo);
  const normalizedCarrera = normalizeNullableValue(carrera);
  const normalizedAula = normalizeNullableValue(aula);

  await upsertGroupRecord(normalizedGrupo, normalizedCarrera, normalizedAula, tutor);

  return db.runAsync(
    `INSERT INTO usuarios (
      nombre, correo, matricula, grupo, grupo_id, cuatrimestre, carrera, carrera_codigo, tutor, aula, aula_codigo, password, role
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      nombre,
      normalizedCorreo,
      matricula,
      normalizedGrupo,
      normalizedGrupo,
      cuatrimestre,
      normalizedCarrera,
      normalizedCarrera,
      tutor || '',
      normalizedAula,
      normalizedAula,
      password,
      role,
    ]
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
  const normalizedGrupo = normalizeNullableValue(grupo);
  const normalizedCarrera = normalizeNullableValue(carrera);
  const normalizedAula = normalizeNullableValue(aula);

  await upsertGroupRecord(normalizedGrupo, normalizedCarrera, normalizedAula, tutor);

  if (password && password.trim().length > 0) {
    return db.runAsync(
      `UPDATE usuarios
       SET nombre = ?, correo = ?, matricula = ?, grupo = ?, grupo_id = ?, cuatrimestre = ?, carrera = ?, carrera_codigo = ?, tutor = ?, aula = ?, aula_codigo = ?, password = ?
       WHERE id = ?;`,
      [
        nombre || '',
        normalizedCorreo,
        matricula || '',
        normalizedGrupo,
        normalizedGrupo,
        cuatrimestre || '',
        normalizedCarrera,
        normalizedCarrera,
        tutor || '',
        normalizedAula,
        normalizedAula,
        password,
        id,
      ]
    );
  }

  return db.runAsync(
    `UPDATE usuarios
     SET nombre = ?, correo = ?, matricula = ?, grupo = ?, grupo_id = ?, cuatrimestre = ?, carrera = ?, carrera_codigo = ?, tutor = ?, aula = ?, aula_codigo = ?
     WHERE id = ?;`,
    [
      nombre || '',
      normalizedCorreo,
      matricula || '',
      normalizedGrupo,
      normalizedGrupo,
      cuatrimestre || '',
      normalizedCarrera,
      normalizedCarrera,
      tutor || '',
      normalizedAula,
      normalizedAula,
      id,
    ]
  );
}

export async function deleteUserByAdmin(id) {
  return db.runAsync('DELETE FROM usuarios WHERE id = ?;', [id]);
}

export async function getUsersByRole(role) {
  return db.getAllAsync(
    `SELECT
       id,
       nombre,
       correo,
       matricula,
       COALESCE(NULLIF(TRIM(grupo_id), ''), NULLIF(TRIM(grupo), '')) AS grupo,
       COALESCE(NULLIF(TRIM(grupo_id), ''), NULLIF(TRIM(grupo), '')) AS grupo_id,
       cuatrimestre,
       COALESCE(NULLIF(TRIM(carrera_codigo), ''), NULLIF(TRIM(carrera), '')) AS carrera,
       COALESCE(NULLIF(TRIM(carrera_codigo), ''), NULLIF(TRIM(carrera), '')) AS carrera_codigo,
       tutor,
       COALESCE(NULLIF(TRIM(aula_codigo), ''), NULLIF(TRIM(aula), '')) AS aula,
       COALESCE(NULLIF(TRIM(aula_codigo), ''), NULLIF(TRIM(aula), '')) AS aula_codigo,
       role
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
    `SELECT COUNT(*) AS total
     FROM grupos;`
  );

  return row?.total ?? 0;
}

export async function getGroupSummaries() {
  return db.getAllAsync(
    `SELECT
       g.id AS clave,
       COALESCE(g.carrera_codigo, 'Sin carrera') AS carrera,
       COALESCE(g.aula_codigo, 'Sin aula') AS aula,
       COALESCE(g.tutor, 'Sin tutor') AS tutor,
       COUNT(u.id) AS alumnos
     FROM grupos g
     LEFT JOIN usuarios u
       ON COALESCE(NULLIF(TRIM(u.grupo_id), ''), NULLIF(TRIM(u.grupo), '')) = g.id
      AND u.role = 'alumno'
     GROUP BY g.id, g.carrera_codigo, g.aula_codigo, g.tutor
     ORDER BY g.id ASC;`
  );
}

export async function getMaestroGroupsByDepartamento(codigoCarrera) {
  return db.getAllAsync(
    `SELECT
       g.id AS clave,
       COALESCE(g.aula_codigo, 'Sin aula') AS aula,
       COALESCE(g.tutor, 'Sin tutor') AS tutor,
       COUNT(u.id) AS alumnos
     FROM grupos g
     LEFT JOIN usuarios u
       ON COALESCE(NULLIF(TRIM(u.grupo_id), ''), NULLIF(TRIM(u.grupo), '')) = g.id
      AND u.role = 'alumno'
     WHERE g.carrera_codigo = ?
     GROUP BY g.id, g.aula_codigo, g.tutor
     ORDER BY g.id ASC;`,
    [codigoCarrera || '']
  );
}

export async function getAlumnosByGrupoYCarrera(grupo, codigoCarrera) {
  return db.getAllAsync(
    `SELECT
       id,
       nombre,
       correo,
       matricula,
       COALESCE(NULLIF(TRIM(grupo_id), ''), NULLIF(TRIM(grupo), '')) AS grupo,
       COALESCE(NULLIF(TRIM(grupo_id), ''), NULLIF(TRIM(grupo), '')) AS grupo_id,
       cuatrimestre,
       COALESCE(NULLIF(TRIM(carrera_codigo), ''), NULLIF(TRIM(carrera), '')) AS carrera,
       COALESCE(NULLIF(TRIM(carrera_codigo), ''), NULLIF(TRIM(carrera), '')) AS carrera_codigo,
       tutor,
       COALESCE(NULLIF(TRIM(aula_codigo), ''), NULLIF(TRIM(aula), '')) AS aula,
       COALESCE(NULLIF(TRIM(aula_codigo), ''), NULLIF(TRIM(aula), '')) AS aula_codigo
     FROM usuarios
     WHERE role = 'alumno'
       AND COALESCE(NULLIF(TRIM(grupo_id), ''), NULLIF(TRIM(grupo), '')) = ?
       AND COALESCE(NULLIF(TRIM(carrera_codigo), ''), NULLIF(TRIM(carrera), '')) = ?
     ORDER BY nombre ASC;`,
    [grupo, codigoCarrera || '']
  );
}

export async function getAlumnoPerfilById(alumnoId) {
  return db.getFirstAsync(
    `SELECT
       id,
       nombre,
       correo,
       matricula,
       COALESCE(NULLIF(TRIM(grupo_id), ''), NULLIF(TRIM(grupo), '')) AS grupo,
       COALESCE(NULLIF(TRIM(grupo_id), ''), NULLIF(TRIM(grupo), '')) AS grupo_id,
       cuatrimestre,
       COALESCE(NULLIF(TRIM(carrera_codigo), ''), NULLIF(TRIM(carrera), '')) AS carrera,
       COALESCE(NULLIF(TRIM(carrera_codigo), ''), NULLIF(TRIM(carrera), '')) AS carrera_codigo,
       tutor,
       COALESCE(NULLIF(TRIM(aula_codigo), ''), NULLIF(TRIM(aula), '')) AS aula,
       COALESCE(NULLIF(TRIM(aula_codigo), ''), NULLIF(TRIM(aula), '')) AS aula_codigo
     FROM usuarios
     WHERE id = ? AND role = 'alumno'
     LIMIT 1;`,
    [alumnoId]
  );
}
