import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('uis.db');

export async function initAttendanceDb() {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS asistencias_maestro (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      maestro_id INTEGER NOT NULL,
      grupo_id TEXT NOT NULL,
      alumno_id INTEGER NOT NULL,
      fecha TEXT NOT NULL,
      estado TEXT NOT NULL CHECK(estado IN ('presente', 'retardo', 'ausente')),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (maestro_id) REFERENCES usuarios(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
      FOREIGN KEY (alumno_id) REFERENCES usuarios(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
      FOREIGN KEY (grupo_id) REFERENCES grupos(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
      UNIQUE (maestro_id, grupo_id, alumno_id, fecha)
    );
  `);

  const groups = await db.getAllAsync(
    `SELECT DISTINCT TRIM(grupo_id) AS grupo
     FROM asistencias_maestro
     WHERE grupo_id IS NOT NULL AND TRIM(grupo_id) <> ''
     ORDER BY grupo ASC;`
  );

  for (const item of groups || []) {
    if (!item?.grupo) {
      continue;
    }

    await db.runAsync(
      `INSERT INTO grupos (id, nombre)
       VALUES (?, ?)
       ON CONFLICT(id) DO UPDATE SET nombre = excluded.nombre;`,
      [item.grupo, item.grupo]
    );
  }
}

export async function getAttendanceByGroupAndDate(maestroId, grupoId, fecha) {
  const rows = await db.getAllAsync(
    `SELECT alumno_id, estado
     FROM asistencias_maestro
     WHERE maestro_id = ? AND grupo_id = ? AND fecha = ?;`,
    [maestroId, grupoId, fecha]
  );

  return rows.reduce((acc, row) => {
    acc[row.alumno_id] = row.estado;
    return acc;
  }, {});
}

export async function saveAttendanceByGroupAndDate(maestroId, grupoId, fecha, attendanceByStudent) {
  await db.withTransactionAsync(async () => {
    for (const [alumnoId, estado] of Object.entries(attendanceByStudent)) {
      if (!estado) {
        await db.runAsync(
          'DELETE FROM asistencias_maestro WHERE maestro_id = ? AND grupo_id = ? AND alumno_id = ? AND fecha = ?;',
          [maestroId, grupoId, Number(alumnoId), fecha]
        );
        continue;
      }

      await db.runAsync(
        `INSERT INTO asistencias_maestro (maestro_id, grupo_id, alumno_id, fecha, estado)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(maestro_id, grupo_id, alumno_id, fecha)
         DO UPDATE SET
           estado = excluded.estado,
           updated_at = CURRENT_TIMESTAMP;`,
        [maestroId, grupoId, Number(alumnoId), fecha, estado]
      );
    }
  });
}

export async function getAttendanceForAlumno(alumnoId, limit = 50) {
  return db.getAllAsync(
    `SELECT am.grupo_id, am.fecha, am.estado, u.nombre AS maestro_nombre
     FROM asistencias_maestro am
     LEFT JOIN usuarios u ON u.id = am.maestro_id
     WHERE am.alumno_id = ?
     ORDER BY am.fecha DESC
     LIMIT ?;`,
    [alumnoId, limit]
  );
}
