-- =============================================
-- UIS - Migracion a esquema normalizado (SQLite)
-- =============================================
-- Objetivo:
-- 1) Conservar datos existentes
-- 2) Normalizar relaciones con FOREIGN KEY explicitas
-- 3) Crear tabla grupos y referenciarla desde usuarios/horarios/calificaciones/asistencias
--
-- Recomendacion:
-- - Ejecutar primero en una copia de la BD
-- - Respaldar fisicamente uis.db antes de correr esto

PRAGMA foreign_keys = OFF;
BEGIN TRANSACTION;

-- -------------------------------------------------
-- 0) Respaldos logicos (tablas espejo)
-- -------------------------------------------------
DROP TABLE IF EXISTS usuarios_bak;
CREATE TABLE usuarios_bak AS SELECT * FROM usuarios;

DROP TABLE IF EXISTS carreras_bak;
CREATE TABLE carreras_bak AS SELECT * FROM carreras;

DROP TABLE IF EXISTS aulas_bak;
CREATE TABLE aulas_bak AS SELECT * FROM aulas;

DROP TABLE IF EXISTS avisos_bak;
CREATE TABLE avisos_bak AS SELECT * FROM avisos;

DROP TABLE IF EXISTS horarios_bak;
CREATE TABLE horarios_bak AS SELECT * FROM horarios;

DROP TABLE IF EXISTS calificaciones_maestro_bak;
CREATE TABLE calificaciones_maestro_bak AS SELECT * FROM calificaciones_maestro;

DROP TABLE IF EXISTS asistencias_maestro_bak;
CREATE TABLE asistencias_maestro_bak AS SELECT * FROM asistencias_maestro;

DROP TABLE IF EXISTS practicas_bak;
CREATE TABLE practicas_bak AS SELECT * FROM practicas;

DROP TABLE IF EXISTS postulaciones_practicas_bak;
CREATE TABLE postulaciones_practicas_bak AS SELECT * FROM postulaciones_practicas;

-- -------------------------------------------------
-- 1) Catalogos: absorber valores legacy para evitar perdida
-- -------------------------------------------------
INSERT OR IGNORE INTO carreras (codigo, nombre)
SELECT TRIM(carrera), TRIM(carrera)
FROM usuarios
WHERE carrera IS NOT NULL AND TRIM(carrera) <> '';

INSERT OR IGNORE INTO aulas (codigo, nombre)
SELECT TRIM(aula), TRIM(aula)
FROM usuarios
WHERE aula IS NOT NULL AND TRIM(aula) <> '';

INSERT OR IGNORE INTO aulas (codigo, nombre)
SELECT TRIM(aula), TRIM(aula)
FROM horarios
WHERE aula IS NOT NULL AND TRIM(aula) <> '';

-- -------------------------------------------------
-- 2) Crear tabla grupos y poblarla desde todas las fuentes
-- -------------------------------------------------
CREATE TABLE IF NOT EXISTS grupos (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  aula_codigo TEXT,
  tutor_maestro_id INTEGER,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (aula_codigo) REFERENCES aulas(codigo)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
  FOREIGN KEY (tutor_maestro_id) REFERENCES usuarios(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
);

DROP TABLE IF EXISTS tmp_grupos_all;
CREATE TEMP TABLE tmp_grupos_all (
  id TEXT PRIMARY KEY
);

INSERT OR IGNORE INTO tmp_grupos_all (id)
SELECT DISTINCT TRIM(grupo)
FROM usuarios
WHERE grupo IS NOT NULL AND TRIM(grupo) <> '';

INSERT OR IGNORE INTO tmp_grupos_all (id)
SELECT DISTINCT TRIM(grupo)
FROM horarios
WHERE grupo IS NOT NULL AND TRIM(grupo) <> '';

INSERT OR IGNORE INTO tmp_grupos_all (id)
SELECT DISTINCT TRIM(grupo_id)
FROM calificaciones_maestro
WHERE grupo_id IS NOT NULL AND TRIM(grupo_id) <> '';

INSERT OR IGNORE INTO tmp_grupos_all (id)
SELECT DISTINCT TRIM(grupo_id)
FROM asistencias_maestro
WHERE grupo_id IS NOT NULL AND TRIM(grupo_id) <> '';

INSERT OR IGNORE INTO grupos (id, nombre)
SELECT id, id
FROM tmp_grupos_all;

-- Intentar inferir aula del grupo desde horarios
UPDATE grupos
SET aula_codigo = (
  SELECT TRIM(h.aula)
  FROM horarios h
  WHERE TRIM(h.grupo) = grupos.id
    AND h.aula IS NOT NULL
    AND TRIM(h.aula) <> ''
  ORDER BY h.id ASC
  LIMIT 1
)
WHERE aula_codigo IS NULL;

DROP TABLE IF EXISTS tmp_grupos_all;

-- -------------------------------------------------
-- 3) Re-crear usuarios con FK explicitas
-- -------------------------------------------------
CREATE TABLE usuarios_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT,
  correo TEXT NOT NULL UNIQUE,
  matricula TEXT,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin', 'maestro', 'alumno')),
  carrera_codigo TEXT,
  aula_codigo TEXT,
  grupo_id TEXT,
  cuatrimestre TEXT,
  tutor TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (carrera_codigo) REFERENCES carreras(codigo)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
  FOREIGN KEY (aula_codigo) REFERENCES aulas(codigo)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
  FOREIGN KEY (grupo_id) REFERENCES grupos(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
);

INSERT INTO usuarios_new (
  id, nombre, correo, matricula, password, role,
  carrera_codigo, aula_codigo, grupo_id,
  cuatrimestre, tutor, created_at
)
SELECT
  id,
  nombre,
  correo,
  matricula,
  password,
  role,
  CASE WHEN carrera IS NULL OR TRIM(carrera) = '' THEN NULL ELSE TRIM(carrera) END,
  CASE WHEN aula IS NULL OR TRIM(aula) = '' THEN NULL ELSE TRIM(aula) END,
  CASE WHEN grupo IS NULL OR TRIM(grupo) = '' THEN NULL ELSE TRIM(grupo) END,
  cuatrimestre,
  tutor,
  created_at
FROM usuarios;

DROP TABLE usuarios;
ALTER TABLE usuarios_new RENAME TO usuarios;

CREATE INDEX IF NOT EXISTS idx_usuarios_role ON usuarios(role);
CREATE INDEX IF NOT EXISTS idx_usuarios_grupo_id ON usuarios(grupo_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_carrera_codigo ON usuarios(carrera_codigo);
CREATE INDEX IF NOT EXISTS idx_usuarios_aula_codigo ON usuarios(aula_codigo);

-- -------------------------------------------------
-- 4) Garantizar usuarios referenciados por IDs legacy
-- -------------------------------------------------
-- Maestros faltantes
INSERT INTO usuarios (id, nombre, correo, matricula, password, role, created_at)
SELECT m.ref_id,
       'Maestro migrado ' || m.ref_id,
       'migrado_maestro_' || m.ref_id || '@local.invalid',
       'MIG-M-' || m.ref_id,
       '1234',
       'maestro',
       CURRENT_TIMESTAMP
FROM (
  SELECT DISTINCT maestro_id AS ref_id FROM horarios WHERE maestro_id IS NOT NULL
  UNION
  SELECT DISTINCT maestro_id AS ref_id FROM calificaciones_maestro WHERE maestro_id IS NOT NULL
  UNION
  SELECT DISTINCT maestro_id AS ref_id FROM asistencias_maestro WHERE maestro_id IS NOT NULL
) m
WHERE NOT EXISTS (SELECT 1 FROM usuarios u WHERE u.id = m.ref_id);

-- Alumnos faltantes
INSERT INTO usuarios (id, nombre, correo, matricula, password, role, created_at)
SELECT a.ref_id,
       'Alumno migrado ' || a.ref_id,
       'migrado_alumno_' || a.ref_id || '@local.invalid',
       'MIG-A-' || a.ref_id,
       '1234',
       'alumno',
       CURRENT_TIMESTAMP
FROM (
  SELECT DISTINCT alumno_id AS ref_id FROM calificaciones_maestro WHERE alumno_id IS NOT NULL
  UNION
  SELECT DISTINCT alumno_id AS ref_id FROM asistencias_maestro WHERE alumno_id IS NOT NULL
  UNION
  SELECT DISTINCT usuario_id AS ref_id FROM postulaciones_practicas WHERE usuario_id IS NOT NULL
) a
WHERE NOT EXISTS (SELECT 1 FROM usuarios u WHERE u.id = a.ref_id);

-- -------------------------------------------------
-- 5) Re-crear avisos con autor_id + respaldo de autor legacy
-- -------------------------------------------------
CREATE TABLE avisos_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  autor_id INTEGER,
  autor_legacy TEXT,
  categoria TEXT NOT NULL CHECK(categoria IN ('academico','administrativo','evento','urgente')),
  fecha TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (autor_id) REFERENCES usuarios(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
);

INSERT INTO avisos_new (
  id, titulo, descripcion, autor_id, autor_legacy, categoria, fecha, created_at, updated_at
)
SELECT
  a.id,
  a.titulo,
  a.descripcion,
  (
    SELECT u.id
    FROM usuarios u
    WHERE LOWER(TRIM(u.nombre)) = LOWER(TRIM(a.autor))
    ORDER BY u.id ASC
    LIMIT 1
  ) AS autor_id,
  a.autor,
  a.categoria,
  a.fecha,
  a.created_at,
  a.updated_at
FROM avisos a;

DROP TABLE avisos;
ALTER TABLE avisos_new RENAME TO avisos;

CREATE INDEX IF NOT EXISTS idx_avisos_autor_id ON avisos(autor_id);
CREATE INDEX IF NOT EXISTS idx_avisos_categoria ON avisos(categoria);

-- -------------------------------------------------
-- 6) Re-crear horarios con FK a grupos/aulas/usuarios
-- -------------------------------------------------
CREATE TABLE horarios_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  grupo_id TEXT NOT NULL,
  dia_semana INTEGER NOT NULL CHECK(dia_semana BETWEEN 0 AND 6),
  nombre TEXT NOT NULL,
  hora_inicio TEXT NOT NULL,
  hora_fin TEXT NOT NULL,
  aula_codigo TEXT,
  profesor_legacy TEXT,
  maestro_id INTEGER,
  UNIQUE(grupo_id, dia_semana, nombre, hora_inicio, hora_fin),
  FOREIGN KEY (grupo_id) REFERENCES grupos(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  FOREIGN KEY (aula_codigo) REFERENCES aulas(codigo)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
  FOREIGN KEY (maestro_id) REFERENCES usuarios(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
);

INSERT INTO horarios_new (
  id, grupo_id, dia_semana, nombre, hora_inicio, hora_fin, aula_codigo, profesor_legacy, maestro_id
)
SELECT
  h.id,
  TRIM(h.grupo),
  h.dia_semana,
  h.nombre,
  h.hora_inicio,
  h.hora_fin,
  CASE WHEN h.aula IS NULL OR TRIM(h.aula) = '' THEN NULL ELSE TRIM(h.aula) END,
  h.profesor,
  h.maestro_id
FROM horarios h;

DROP TABLE horarios;
ALTER TABLE horarios_new RENAME TO horarios;

CREATE INDEX IF NOT EXISTS idx_horarios_grupo_id ON horarios(grupo_id);
CREATE INDEX IF NOT EXISTS idx_horarios_maestro_id ON horarios(maestro_id);

-- -------------------------------------------------
-- 7) Re-crear calificaciones_maestro con FK explicitas
-- -------------------------------------------------
CREATE TABLE calificaciones_maestro_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  maestro_id INTEGER NOT NULL,
  grupo_id TEXT NOT NULL,
  alumno_id INTEGER NOT NULL,
  unidad1 REAL,
  unidad2 REAL,
  unidad3 REAL,
  promedio REAL,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(maestro_id, grupo_id, alumno_id),
  FOREIGN KEY (maestro_id) REFERENCES usuarios(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  FOREIGN KEY (alumno_id) REFERENCES usuarios(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  FOREIGN KEY (grupo_id) REFERENCES grupos(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
);

INSERT INTO calificaciones_maestro_new (
  id, maestro_id, grupo_id, alumno_id, unidad1, unidad2, unidad3, promedio, updated_at
)
SELECT
  id,
  maestro_id,
  TRIM(grupo_id),
  alumno_id,
  unidad1,
  unidad2,
  unidad3,
  promedio,
  updated_at
FROM calificaciones_maestro;

DROP TABLE calificaciones_maestro;
ALTER TABLE calificaciones_maestro_new RENAME TO calificaciones_maestro;

CREATE INDEX IF NOT EXISTS idx_calif_grupo_id ON calificaciones_maestro(grupo_id);
CREATE INDEX IF NOT EXISTS idx_calif_alumno_id ON calificaciones_maestro(alumno_id);

-- -------------------------------------------------
-- 8) Re-crear asistencias_maestro con FK explicitas
-- -------------------------------------------------
CREATE TABLE asistencias_maestro_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  maestro_id INTEGER NOT NULL,
  grupo_id TEXT NOT NULL,
  alumno_id INTEGER NOT NULL,
  fecha TEXT NOT NULL,
  estado TEXT NOT NULL CHECK(estado IN ('presente', 'retardo', 'ausente')),
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(maestro_id, grupo_id, alumno_id, fecha),
  FOREIGN KEY (maestro_id) REFERENCES usuarios(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  FOREIGN KEY (alumno_id) REFERENCES usuarios(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  FOREIGN KEY (grupo_id) REFERENCES grupos(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
);

INSERT INTO asistencias_maestro_new (
  id, maestro_id, grupo_id, alumno_id, fecha, estado, created_at, updated_at
)
SELECT
  id,
  maestro_id,
  TRIM(grupo_id),
  alumno_id,
  fecha,
  estado,
  created_at,
  updated_at
FROM asistencias_maestro;

DROP TABLE asistencias_maestro;
ALTER TABLE asistencias_maestro_new RENAME TO asistencias_maestro;

CREATE INDEX IF NOT EXISTS idx_asist_grupo_id ON asistencias_maestro(grupo_id);
CREATE INDEX IF NOT EXISTS idx_asist_alumno_id ON asistencias_maestro(alumno_id);
CREATE INDEX IF NOT EXISTS idx_asist_fecha ON asistencias_maestro(fecha);

-- -------------------------------------------------
-- 9) Postulaciones: reforzar FK (re-creacion opcional)
-- -------------------------------------------------
CREATE TABLE postulaciones_practicas_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  practica_id INTEGER NOT NULL,
  usuario_id INTEGER NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(practica_id, usuario_id),
  FOREIGN KEY(practica_id) REFERENCES practicas(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  FOREIGN KEY(usuario_id) REFERENCES usuarios(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
);

INSERT INTO postulaciones_practicas_new (id, practica_id, usuario_id, created_at)
SELECT id, practica_id, usuario_id, created_at
FROM postulaciones_practicas;

DROP TABLE postulaciones_practicas;
ALTER TABLE postulaciones_practicas_new RENAME TO postulaciones_practicas;

CREATE INDEX IF NOT EXISTS idx_post_practica_id ON postulaciones_practicas(practica_id);
CREATE INDEX IF NOT EXISTS idx_post_usuario_id ON postulaciones_practicas(usuario_id);

COMMIT;
PRAGMA foreign_keys = ON;

-- Verificaciones sugeridas despues de ejecutar:
-- PRAGMA foreign_key_check;
-- SELECT COUNT(*) FROM usuarios;
-- SELECT COUNT(*) FROM avisos;
-- SELECT COUNT(*) FROM horarios;
-- SELECT COUNT(*) FROM calificaciones_maestro;
-- SELECT COUNT(*) FROM asistencias_maestro;
-- SELECT COUNT(*) FROM practicas;
-- SELECT COUNT(*) FROM postulaciones_practicas;
