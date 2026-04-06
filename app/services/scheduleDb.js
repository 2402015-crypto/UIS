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

const DEFAULT_SCHEDULE = [
  { grupo: 'TI42', dia_semana: 1, nombre: 'Programación Web', hora_inicio: '07:00', hora_fin: '09:00', aula: 'Aula 1', profesor: 'Docente de TI', maestro_id: null },
  { grupo: 'TI42', dia_semana: 3, nombre: 'Bases de Datos', hora_inicio: '08:00', hora_fin: '10:00', aula: 'Aula 2', profesor: 'Docente de TI', maestro_id: null },
  { grupo: 'TI42', dia_semana: 5, nombre: 'Redes', hora_inicio: '10:00', hora_fin: '12:00', aula: 'Aula 3', profesor: 'Docente de TI', maestro_id: null },
  { grupo: 'TI41', dia_semana: 2, nombre: 'Programación Web', hora_inicio: '09:00', hora_fin: '11:00', aula: 'Aula 4', profesor: 'Docente de TI', maestro_id: null },
  { grupo: 'TI41', dia_semana: 4, nombre: 'Desarrollo Móvil', hora_inicio: '07:00', hora_fin: '09:00', aula: 'Aula 5', profesor: 'Docente de TI', maestro_id: null },
  { grupo: 'TI43', dia_semana: 1, nombre: 'Base de Datos Avanzadas', hora_inicio: '11:00', hora_fin: '13:00', aula: 'Aula 6', profesor: 'Docente de TI', maestro_id: null },
  { grupo: 'TI43', dia_semana: 3, nombre: 'Arquitectura de Software', hora_inicio: '07:00', hora_fin: '09:00', aula: 'Aula 7', profesor: 'Docente de TI', maestro_id: null },
];

export const DAY_OPTIONS = [
  { value: 1, label: 'Lun' },
  { value: 2, label: 'Mar' },
  { value: 3, label: 'Mié' },
  { value: 4, label: 'Jue' },
  { value: 5, label: 'Vie' },
  { value: 6, label: 'Sáb' },
  { value: 0, label: 'Dom' },
];

function formatDateHuman(date) {
  return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

function getDayName(date) {
  return new Intl.DateTimeFormat('es-MX', { weekday: 'long' }).format(date);
}

function getDayLabel(dayValue) {
  const option = DAY_OPTIONS.find((item) => item.value === Number(dayValue));
  return option?.label || String(dayValue);
}

async function ensureHorariosColumns() {
  const columns = await db.getAllAsync('PRAGMA table_info(horarios);');
  const columnNames = new Set((columns || []).map((col) => col.name));

  if (!columnNames.has('grupo_id')) {
    await db.execAsync('ALTER TABLE horarios ADD COLUMN grupo_id TEXT;');
  }

  if (!columnNames.has('maestro_id')) {
    await db.execAsync('ALTER TABLE horarios ADD COLUMN maestro_id INTEGER;');
  }

  if (!columnNames.has('aula_codigo')) {
    await db.execAsync('ALTER TABLE horarios ADD COLUMN aula_codigo TEXT;');
  }

  await db.runAsync(
    `UPDATE horarios
     SET grupo_id = COALESCE(NULLIF(TRIM(grupo_id), ''), NULLIF(TRIM(grupo), '')),
         aula_codigo = COALESCE(NULLIF(TRIM(aula_codigo), ''), NULLIF(TRIM(aula), ''))
     WHERE 1 = 1;`
  );
}

async function ensureGroupsFromHorarios() {
  const rows = await db.getAllAsync(
    `SELECT
       COALESCE(NULLIF(TRIM(grupo_id), ''), NULLIF(TRIM(grupo), '')) AS grupo,
       COALESCE(NULLIF(TRIM(aula_codigo), ''), NULLIF(TRIM(aula), '')) AS aula
     FROM horarios
     WHERE COALESCE(NULLIF(TRIM(grupo_id), ''), NULLIF(TRIM(grupo), '')) IS NOT NULL
     GROUP BY COALESCE(NULLIF(TRIM(grupo_id), ''), NULLIF(TRIM(grupo), ''))
     ORDER BY grupo ASC;`
  );

  for (const row of rows || []) {
    if (!row?.grupo) {
      continue;
    }

    await db.runAsync(
      `INSERT INTO grupos (id, nombre, aula_codigo)
       VALUES (?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         nombre = excluded.nombre,
         aula_codigo = COALESCE(excluded.aula_codigo, grupos.aula_codigo);`,
      [row.grupo, row.grupo, row.aula || null]
    );
  }
}

async function getMaestroNombre(maestroId) {
  if (!maestroId) {
    return 'Sin docente';
  }

  const row = await db.getFirstAsync(
    `SELECT nombre
     FROM usuarios
     WHERE id = ? AND role = 'maestro'
     LIMIT 1;`,
    [maestroId]
  );

  return row?.nombre || 'Sin docente';
}

export async function initScheduleDb() {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS horarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      grupo TEXT NOT NULL,
      grupo_id TEXT,
      dia_semana INTEGER NOT NULL CHECK(dia_semana BETWEEN 0 AND 6),
      nombre TEXT NOT NULL,
      hora_inicio TEXT NOT NULL,
      hora_fin TEXT NOT NULL,
      aula TEXT,
      aula_codigo TEXT,
      profesor TEXT,
      maestro_id INTEGER,
      FOREIGN KEY (grupo_id) REFERENCES grupos(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
      FOREIGN KEY (aula_codigo) REFERENCES aulas(codigo)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
      FOREIGN KEY (maestro_id) REFERENCES usuarios(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
      UNIQUE(grupo_id, dia_semana, nombre, hora_inicio, hora_fin)
    );
  `);

  await ensureHorariosColumns();
  await ensureGroupsFromHorarios();

  for (const item of DEFAULT_SCHEDULE) {
    await db.runAsync(
      `INSERT OR IGNORE INTO horarios (
        grupo, grupo_id, dia_semana, nombre, hora_inicio, hora_fin, aula, aula_codigo, profesor, maestro_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        normalizeValue(item.grupo),
        normalizeValue(item.grupo),
        item.dia_semana,
        item.nombre,
        item.hora_inicio,
        item.hora_fin,
        item.aula,
        item.aula,
        item.profesor,
        item.maestro_id,
      ]
    );
  }
}

export async function getSchedulesByGroup(grupo) {
  if (!grupo) {
    return [];
  }

  const rows = await db.getAllAsync(
    `SELECT h.id,
            COALESCE(NULLIF(TRIM(h.grupo_id), ''), NULLIF(TRIM(h.grupo), '')) AS grupo,
            COALESCE(NULLIF(TRIM(h.grupo_id), ''), NULLIF(TRIM(h.grupo), '')) AS grupo_id,
            h.dia_semana,
            h.nombre,
            h.hora_inicio,
            h.hora_fin,
            COALESCE(NULLIF(TRIM(h.aula_codigo), ''), NULLIF(TRIM(h.aula), '')) AS aula,
            COALESCE(NULLIF(TRIM(h.aula_codigo), ''), NULLIF(TRIM(h.aula), '')) AS aula_codigo,
            h.profesor,
            h.maestro_id,
            u.nombre AS maestro_nombre
     FROM horarios h
     LEFT JOIN usuarios u ON u.id = h.maestro_id AND u.role = 'maestro'
     WHERE COALESCE(NULLIF(TRIM(h.grupo_id), ''), NULLIF(TRIM(h.grupo), '')) = ?
     ORDER BY h.dia_semana ASC, h.hora_inicio ASC;`,
    [normalizeValue(grupo)]
  );

  return rows.map((row) => ({
    ...row,
    dia_label: getDayLabel(row.dia_semana),
    maestro_nombre: row.maestro_nombre || row.profesor || 'Sin docente',
  }));
}

export async function createSchedulesForGroup({
  grupo,
  nombre,
  aula,
  horaInicio,
  horaFin,
  maestroId,
  diasSemana,
}) {
  const maestroNombre = await getMaestroNombre(maestroId);
  const grupoNormalizado = normalizeValue(grupo);
  const aulaNormalizada = normalizeNullableValue(aula);

  await db.withTransactionAsync(async () => {
    for (const dia of diasSemana || []) {
      await db.runAsync(
        `INSERT INTO horarios (
          grupo, grupo_id, dia_semana, nombre, hora_inicio, hora_fin, aula, aula_codigo, profesor, maestro_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          grupoNormalizado,
          grupoNormalizado,
          Number(dia),
          nombre,
          horaInicio,
          horaFin,
          aulaNormalizada || '',
          aulaNormalizada,
          maestroNombre,
          maestroId || null,
        ]
      );
    }
  });
}

export async function updateScheduleEntry(id, {
  nombre,
  aula,
  horaInicio,
  horaFin,
  maestroId,
  diaSemana,
}) {
  const maestroNombre = await getMaestroNombre(maestroId);

  await db.runAsync(
    `UPDATE horarios
     SET nombre = ?,
         aula = ?,
         aula_codigo = ?,
         hora_inicio = ?,
         hora_fin = ?,
         profesor = ?,
         maestro_id = ?,
         dia_semana = ?,
         grupo_id = COALESCE(grupo_id, grupo)
     WHERE id = ?;`,
    [
      nombre,
      aula || '',
      normalizeNullableValue(aula),
      horaInicio,
      horaFin,
      maestroNombre,
      maestroId || null,
      Number(diaSemana),
      id,
    ]
  );
}

export async function deleteScheduleEntry(id) {
  await db.runAsync('DELETE FROM horarios WHERE id = ?;', [id]);
}

export async function getScheduleForDate(grupo, date = new Date()) {
  const dayOfWeek = date.getDay();
  const rows = grupo
    ? await db.getAllAsync(
        `SELECT h.nombre,
                h.hora_inicio,
                h.hora_fin,
                COALESCE(NULLIF(TRIM(h.aula_codigo), ''), NULLIF(TRIM(h.aula), '')) AS aula,
                h.profesor,
                u.nombre AS maestro_nombre
         FROM horarios h
         LEFT JOIN usuarios u ON u.id = h.maestro_id AND u.role = 'maestro'
         WHERE COALESCE(NULLIF(TRIM(h.grupo_id), ''), NULLIF(TRIM(h.grupo), '')) = ? AND h.dia_semana = ?
         ORDER BY h.hora_inicio ASC;`,
        [normalizeValue(grupo), dayOfWeek]
      )
    : [];

  const clases = rows.map((row) => ({
    nombre: row.nombre,
    hora: `${row.hora_inicio} - ${row.hora_fin}`,
    aula: row.aula || 'Sin aula',
    profesor: row.maestro_nombre || row.profesor || 'Sin docente',
  }));

  return {
    diaHoy: getDayName(date),
    fechaHoy: formatDateHuman(date),
    clases,
  };
}
