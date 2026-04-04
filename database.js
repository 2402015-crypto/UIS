// database.js
const sqlite3 = require('sqlite3').verbose();

// Conexión a la base de datos (se crea si no existe)
const db = new sqlite3.Database('./sistema_uis.db', (err) => {
  if (err) {
    console.error('Error al conectar con la base de datos:', err.message);
  } else {
    console.log('Conectado a la base de datos SQLite.');
  }
});

// Script para crear las tablas
db.serialize(() => {
  db.exec(`
    -- =========================
-- Tabla de Usuarios (base)
-- =========================
CREATE TABLE IF NOT EXISTS usuarios (
  idUsuario INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT,
  correo TEXT UNIQUE,
  contraseña TEXT,
  rol TEXT CHECK(rol IN ('admin','maestro','alumno'))
);

-- =========================
-- Tabla de Alumnos
-- =========================
CREATE TABLE IF NOT EXISTS alumnos (
  idAlumno INTEGER PRIMARY KEY AUTOINCREMENT,
  matricula TEXT UNIQUE,
  idUsuario INTEGER,
  FOREIGN KEY(idUsuario) REFERENCES usuarios(idUsuario)
);

-- =========================
-- Tabla de Maestros
-- =========================
CREATE TABLE IF NOT EXISTS maestros (
  idMaestro INTEGER PRIMARY KEY AUTOINCREMENT,
  departamento TEXT,
  idUsuario INTEGER,
  FOREIGN KEY(idUsuario) REFERENCES usuarios(idUsuario)
);

-- =========================
-- Tabla de Grupos
-- =========================
CREATE TABLE IF NOT EXISTS grupos (
  idGrupo INTEGER PRIMARY KEY AUTOINCREMENT,
  nombreGrupo TEXT,
  aula TEXT,
  idMaestro INTEGER,
  FOREIGN KEY(idMaestro) REFERENCES maestros(idMaestro)
);

-- =========================
-- Tabla de Materias
-- =========================
CREATE TABLE IF NOT EXISTS materias (
  idMateria INTEGER PRIMARY KEY AUTOINCREMENT,
  nombreMateria TEXT,
  diaSemana TEXT,
  horaInicio TEXT,
  horaFin TEXT,
  idGrupo INTEGER,
  FOREIGN KEY(idGrupo) REFERENCES grupos(idGrupo)
);

-- =========================
-- Tabla de Inscripciones (Alumno ↔ Grupo)
-- =========================
CREATE TABLE IF NOT EXISTS inscripciones (
  idInscripcion INTEGER PRIMARY KEY AUTOINCREMENT,
  idAlumno INTEGER,
  idGrupo INTEGER,
  FOREIGN KEY(idAlumno) REFERENCES alumnos(idAlumno),
  FOREIGN KEY(idGrupo) REFERENCES grupos(idGrupo)
);

-- =========================
-- Tabla de Calificaciones
-- =========================
CREATE TABLE IF NOT EXISTS calificaciones (
  idCalificacion INTEGER PRIMARY KEY AUTOINCREMENT,
  idAlumno INTEGER,
  idMateria INTEGER,
  unidad1 INTEGER,
  unidad2 INTEGER,
  unidad3 INTEGER,
  unidad4 INTEGER,
  final REAL,
  FOREIGN KEY(idAlumno) REFERENCES alumnos(idAlumno),
  FOREIGN KEY(idMateria) REFERENCES materias(idMateria)
);

-- =========================
-- Tabla de Asistencias
-- =========================
CREATE TABLE IF NOT EXISTS asistencias (
  idAsistencia INTEGER PRIMARY KEY AUTOINCREMENT,
  idAlumno INTEGER,
  idMateria INTEGER,
  fecha TEXT,
  estado TEXT CHECK(estado IN ('presente','retardo','ausente')),
  FOREIGN KEY(idAlumno) REFERENCES alumnos(idAlumno),
  FOREIGN KEY(idMateria) REFERENCES materias(idMateria)
);

-- =========================
-- Tabla de Avisos
-- =========================
CREATE TABLE IF NOT EXISTS avisos (
  idAviso INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo TEXT,
  contenido TEXT,
  categoria TEXT CHECK(categoria IN ('académico','administrativo','evento','urgente')),
  autor TEXT,
  fecha TEXT,
  idMaestro INTEGER,
  FOREIGN KEY(idMaestro) REFERENCES maestros(idMaestro)
);

-- =========================
-- Tabla de Prácticas Profesionales
-- =========================
CREATE TABLE IF NOT EXISTS practicas (
  idPractica INTEGER PRIMARY KEY AUTOINCREMENT,
  empresa TEXT,
  puesto TEXT,
  descripcion TEXT,
  requisitos TEXT,
  duracion TEXT,
  horario TEXT,
  fechaLimite TEXT,
  estado TEXT CHECK(estado IN ('activa','cerrada'))
);

-- =========================
-- Tabla de Postulaciones (Alumno ↔ Práctica)
-- =========================
CREATE TABLE IF NOT EXISTS postulaciones (
  idPostulacion INTEGER PRIMARY KEY AUTOINCREMENT,
  idAlumno INTEGER,
  idPractica INTEGER,
  fechaPostulacion TEXT,
  estado TEXT CHECK(estado IN ('postulado','aceptado','rechazado')),
  FOREIGN KEY(idAlumno) REFERENCES alumnos(idAlumno),
  FOREIGN KEY(idPractica) REFERENCES practicas(idPractica)
);
  `);
});

module.exports = db;