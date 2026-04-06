import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('uis.db');

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

  if (!columnNames.has('maestro_id')) {
    await db.execAsync('ALTER TABLE horarios ADD COLUMN maestro_id INTEGER;');
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
      dia_semana INTEGER NOT NULL CHECK(dia_semana BETWEEN 0 AND 6),
      nombre TEXT NOT NULL,
      hora_inicio TEXT NOT NULL,
      hora_fin TEXT NOT NULL,
      aula TEXT,
      profesor TEXT,
      UNIQUE(grupo, dia_semana, nombre, hora_inicio, hora_fin)
    );
  `);

  await ensureHorariosColumns();

  for (const item of DEFAULT_SCHEDULE) {
    await db.runAsync(
      `INSERT OR IGNORE INTO horarios (
        grupo, dia_semana, nombre, hora_inicio, hora_fin, aula, profesor, maestro_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        item.grupo,
        item.dia_semana,
        item.nombre,
        item.hora_inicio,
        item.hora_fin,
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
    `SELECT h.id, h.grupo, h.dia_semana, h.nombre, h.hora_inicio, h.hora_fin, h.aula, h.profesor, h.maestro_id,
            u.nombre AS maestro_nombre
     FROM horarios h
     LEFT JOIN usuarios u ON u.id = h.maestro_id AND u.role = 'maestro'
     WHERE h.grupo = ?
     ORDER BY h.dia_semana ASC, h.hora_inicio ASC;`,
    [grupo]
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

  await db.withTransactionAsync(async () => {
    for (const dia of diasSemana || []) {
      await db.runAsync(
        `INSERT INTO horarios (
          grupo, dia_semana, nombre, hora_inicio, hora_fin, aula, profesor, maestro_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          grupo,
          Number(dia),
          nombre,
          horaInicio,
          horaFin,
          aula || '',
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
         hora_inicio = ?,
         hora_fin = ?,
         profesor = ?,
         maestro_id = ?,
         dia_semana = ?
     WHERE id = ?;`,
    [
      nombre,
      aula || '',
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
        `SELECT h.nombre, h.hora_inicio, h.hora_fin, h.aula, h.profesor, u.nombre AS maestro_nombre
         FROM horarios h
         LEFT JOIN usuarios u ON u.id = h.maestro_id AND u.role = 'maestro'
         WHERE h.grupo = ? AND h.dia_semana = ?
         ORDER BY h.hora_inicio ASC;`,
        [grupo, dayOfWeek]
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
