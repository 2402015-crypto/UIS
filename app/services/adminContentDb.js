import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('uis.db');

function safeJsonParse(text, fallback) {
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

export async function initAdminContentDb() {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS practicas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      empresa TEXT NOT NULL,
      descripcion TEXT NOT NULL,
      requisitos TEXT NOT NULL,
      duracion TEXT,
      horario TEXT,
      modalidad TEXT,
      vacantes INTEGER DEFAULT 1,
      estado TEXT NOT NULL CHECK(estado IN ('activa', 'cerrada')) DEFAULT 'activa',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS avisos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      descripcion TEXT NOT NULL,
      autor TEXT NOT NULL,
      categoria TEXT NOT NULL CHECK(categoria IN ('academico','administrativo','evento','urgente')),
      fecha TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS postulaciones_practicas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      practica_id INTEGER NOT NULL,
      usuario_id INTEGER NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(practica_id, usuario_id),
      FOREIGN KEY(practica_id) REFERENCES practicas(id),
      FOREIGN KEY(usuario_id) REFERENCES usuarios(id)
    );
  `);
}

export async function getPracticasForAdmin() {
  const rows = await db.getAllAsync(
    `SELECT
       p.id,
       p.titulo,
       p.empresa,
       p.descripcion,
       p.requisitos,
       p.duracion,
       p.horario,
       p.modalidad,
       p.vacantes,
       p.estado,
       (SELECT COUNT(*) FROM postulaciones_practicas pp WHERE pp.practica_id = p.id) AS aplicantes
     FROM practicas p
     ORDER BY p.id DESC;`
  );

  return rows.map((row) => ({
    ...row,
    requisitos: safeJsonParse(row.requisitos, []),
  }));
}

export async function createPractica({
  titulo,
  empresa,
  descripcion,
  requisitos,
  duracion,
  horario,
  modalidad,
  vacantes,
  estado,
}) {
  await db.runAsync(
    `INSERT INTO practicas (
      titulo, empresa, descripcion, requisitos, duracion, horario, modalidad, vacantes, estado
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      titulo,
      empresa,
      descripcion,
      JSON.stringify(requisitos || []),
      duracion || '',
      horario || '',
      modalidad || '',
      Number(vacantes || 1),
      estado || 'activa',
    ]
  );
}

export async function updatePractica(id, {
  titulo,
  empresa,
  descripcion,
  requisitos,
  duracion,
  horario,
  modalidad,
  vacantes,
  estado,
}) {
  await db.runAsync(
    `UPDATE practicas
     SET titulo = ?,
         empresa = ?,
         descripcion = ?,
         requisitos = ?,
         duracion = ?,
         horario = ?,
         modalidad = ?,
         vacantes = ?,
         estado = ?,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?;`,
    [
      titulo,
      empresa,
      descripcion,
      JSON.stringify(requisitos || []),
      duracion || '',
      horario || '',
      modalidad || '',
      Number(vacantes || 1),
      estado || 'activa',
      id,
    ]
  );
}

export async function deletePractica(id) {
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM postulaciones_practicas WHERE practica_id = ?;', [id]);
    await db.runAsync('DELETE FROM practicas WHERE id = ?;', [id]);
  });
}

export async function getPracticasForAlumno(usuarioId) {
  const rows = await db.getAllAsync(
    `SELECT
       p.id,
       p.titulo,
       p.empresa,
       p.descripcion,
       p.requisitos,
       p.duracion,
       p.horario,
       p.modalidad,
       p.vacantes,
       p.estado,
       (SELECT COUNT(*) FROM postulaciones_practicas pp WHERE pp.practica_id = p.id) AS aplicantes,
       CASE WHEN pp.id IS NULL THEN 0 ELSE 1 END AS aplicado
     FROM practicas p
     LEFT JOIN postulaciones_practicas pp
       ON pp.practica_id = p.id AND pp.usuario_id = ?
     WHERE p.estado = 'activa'
     ORDER BY p.id DESC;`,
    [usuarioId]
  );

  return rows.map((row) => ({
    ...row,
    aplicado: Boolean(row.aplicado),
    requisitos: safeJsonParse(row.requisitos, []),
  }));
}

export async function postularApractica(usuarioId, practicaId) {
  await db.runAsync(
    `INSERT OR IGNORE INTO postulaciones_practicas (practica_id, usuario_id)
     VALUES (?, ?);`,
    [practicaId, usuarioId]
  );
}

export async function getPracticasCount() {
  const row = await db.getFirstAsync('SELECT COUNT(*) AS total FROM practicas WHERE estado = ?;', ['activa']);
  return row?.total ?? 0;
}

export async function getAvisos() {
  return db.getAllAsync(
    `SELECT id, titulo, descripcion, autor, categoria, fecha
     FROM avisos
     ORDER BY id DESC;`
  );
}

export async function createAviso({ titulo, descripcion, autor, categoria, fecha }) {
  await db.runAsync(
    `INSERT INTO avisos (titulo, descripcion, autor, categoria, fecha)
     VALUES (?, ?, ?, ?, ?);`,
    [titulo, descripcion, autor, categoria, fecha]
  );
}

export async function updateAviso(id, { titulo, descripcion, autor, categoria, fecha }) {
  await db.runAsync(
    `UPDATE avisos
     SET titulo = ?,
         descripcion = ?,
         autor = ?,
         categoria = ?,
         fecha = ?,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?;`,
    [titulo, descripcion, autor, categoria, fecha, id]
  );
}

export async function deleteAviso(id) {
  return db.runAsync('DELETE FROM avisos WHERE id = ?;', [id]);
}

export async function getAvisosCount() {
  const row = await db.getFirstAsync('SELECT COUNT(*) AS total FROM avisos;');
  return row?.total ?? 0;
}

export async function getRecentAvisos(limit = 4) {
  return db.getAllAsync(
    `SELECT id, titulo, categoria
     FROM avisos
     ORDER BY id DESC
     LIMIT ?;`,
    [limit]
  );
}
