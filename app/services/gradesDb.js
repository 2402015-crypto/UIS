import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('uis.db');

export async function initGradesDb() {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS calificaciones_maestro (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      maestro_id INTEGER NOT NULL,
      grupo_id TEXT NOT NULL,
      alumno_id INTEGER NOT NULL,
      unidad1 REAL,
      unidad2 REAL,
      unidad3 REAL,
      promedio REAL,
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
      UNIQUE(maestro_id, grupo_id, alumno_id)
    );
  `);

  const groups = await db.getAllAsync(
    `SELECT DISTINCT TRIM(grupo_id) AS grupo
     FROM calificaciones_maestro
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

export async function getGradesByGroup(maestroId, grupoId) {
  const rows = await db.getAllAsync(
    `SELECT alumno_id, unidad1, unidad2, unidad3, promedio
     FROM calificaciones_maestro
     WHERE maestro_id = ? AND grupo_id = ?;`,
    [maestroId, grupoId]
  );

  return rows.reduce((acc, row) => {
    acc[row.alumno_id] = {
      u1: row.unidad1 != null ? String(row.unidad1) : '',
      u2: row.unidad2 != null ? String(row.unidad2) : '',
      u3: row.unidad3 != null ? String(row.unidad3) : '',
      promedio: row.promedio,
    };
    return acc;
  }, {});
}

export async function saveGradesByGroup(maestroId, grupoId, gradesByStudent) {
  await db.withTransactionAsync(async () => {
    for (const [alumnoId, grades] of Object.entries(gradesByStudent)) {
      const unidad1 = grades.u1 === '' ? null : Number(grades.u1);
      const unidad2 = grades.u2 === '' ? null : Number(grades.u2);
      const unidad3 = grades.u3 === '' ? null : Number(grades.u3);

      const valid = [unidad1, unidad2, unidad3].filter((v) => Number.isFinite(v));
      const promedio = valid.length > 0
        ? Number((valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(1))
        : null;

      await db.runAsync(
        `INSERT INTO calificaciones_maestro (maestro_id, grupo_id, alumno_id, unidad1, unidad2, unidad3, promedio)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(maestro_id, grupo_id, alumno_id)
         DO UPDATE SET
           unidad1 = excluded.unidad1,
           unidad2 = excluded.unidad2,
           unidad3 = excluded.unidad3,
           promedio = excluded.promedio,
           updated_at = CURRENT_TIMESTAMP;`,
        [maestroId, grupoId, Number(alumnoId), unidad1, unidad2, unidad3, promedio]
      );
    }
  });
}

export async function getGradesForAlumno(alumnoId) {
  return db.getAllAsync(
    `SELECT cm.grupo_id, cm.unidad1, cm.unidad2, cm.unidad3, cm.promedio,
            u.nombre AS maestro_nombre
     FROM calificaciones_maestro cm
     LEFT JOIN usuarios u ON u.id = cm.maestro_id
     WHERE cm.alumno_id = ?
     ORDER BY cm.updated_at DESC;`,
    [alumnoId]
  );
}
