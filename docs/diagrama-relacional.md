# Diagrama Relacional - UIS

Este documento incluye 2 versiones del modelo de datos:

1. Modelo actual (como esta implementado hoy en SQLite)
2. Modelo recomendado (normalizado con llaves foraneas explicitas)

## 1) Modelo actual

Notas:
- Este modelo mezcla relaciones explicitas y relaciones logicas.
- FK explicitas reales hoy: `postulaciones_practicas.practica_id -> practicas.id` y `postulaciones_practicas.usuario_id -> usuarios.id`.
- Relacion logica (sin FK declarada) en varias tablas: `maestro_id`, `alumno_id`, `carrera`, `aula`.

```mermaid
erDiagram
    USUARIOS {
      int id PK
      string nombre
      string correo UNIQUE
      string matricula
      string grupo
      string cuatrimestre
      string carrera
      string tutor
      string aula
      string password
      string role
      datetime created_at
    }

    CARRERAS {
      string codigo PK
      string nombre UNIQUE
    }

    AULAS {
      string codigo PK
      string nombre UNIQUE
    }

    PRACTICAS {
      int id PK
      string titulo
      string empresa
      string descripcion
      string requisitos
      string duracion
      string horario
      string modalidad
      int vacantes
      string estado
      datetime created_at
      datetime updated_at
    }

    POSTULACIONES_PRACTICAS {
      int id PK
      int practica_id FK
      int usuario_id FK
      datetime created_at
      UNIQUE practica_id_usuario_id
    }

    AVISOS {
      int id PK
      string titulo
      string descripcion
      string autor
      string categoria
      string fecha
      datetime created_at
      datetime updated_at
    }

    HORARIOS {
      int id PK
      string grupo
      int dia_semana
      string nombre
      string hora_inicio
      string hora_fin
      string aula
      string profesor
      int maestro_id
      UNIQUE grupo_dia_nombre_hora_ini_hora_fin
    }

    CALIFICACIONES_MAESTRO {
      int id PK
      int maestro_id
      string grupo_id
      int alumno_id
      float unidad1
      float unidad2
      float unidad3
      float promedio
      datetime updated_at
      UNIQUE maestro_grupo_alumno
    }

    ASISTENCIAS_MAESTRO {
      int id PK
      int maestro_id
      string grupo_id
      int alumno_id
      string fecha
      string estado
      datetime created_at
      datetime updated_at
      UNIQUE maestro_grupo_alumno_fecha
    }

    PRACTICAS ||--o{ POSTULACIONES_PRACTICAS : practica_id
    USUARIOS ||--o{ POSTULACIONES_PRACTICAS : usuario_id

    USUARIOS ||--o{ HORARIOS : maestro_id_logic
    USUARIOS ||--o{ CALIFICACIONES_MAESTRO : maestro_id_logic
    USUARIOS ||--o{ CALIFICACIONES_MAESTRO : alumno_id_logic
    USUARIOS ||--o{ ASISTENCIAS_MAESTRO : maestro_id_logic
    USUARIOS ||--o{ ASISTENCIAS_MAESTRO : alumno_id_logic

    CARRERAS ||--o{ USUARIOS : carrera_logic
    AULAS ||--o{ USUARIOS : aula_logic
```

## 2) Modelo recomendado (normalizado)

Objetivo:
- Mantener tablas actuales pero declarar FK reales para integridad.
- Separar `grupo_id` como entidad `grupos` para evitar texto libre.
- Referenciar `autor_id` en avisos en lugar de solo `autor` texto.

```mermaid
erDiagram
    CARRERAS {
      string codigo PK
      string nombre UNIQUE
    }

    AULAS {
      string codigo PK
      string nombre UNIQUE
    }

    GRUPOS {
      string id PK
      string nombre
      string aula_codigo FK
      int tutor_maestro_id FK
    }

    USUARIOS {
      int id PK
      string nombre
      string correo UNIQUE
      string matricula
      string password
      string role
      string carrera_codigo FK
      string aula_codigo FK
      string grupo_id FK
      string cuatrimestre
      datetime created_at
    }

    PRACTICAS {
      int id PK
      string titulo
      string empresa
      string descripcion
      string requisitos
      string duracion
      string horario
      string modalidad
      int vacantes
      string estado
      datetime created_at
      datetime updated_at
    }

    POSTULACIONES_PRACTICAS {
      int id PK
      int practica_id FK
      int usuario_id FK
      datetime created_at
      UNIQUE practica_id_usuario_id
    }

    AVISOS {
      int id PK
      string titulo
      string descripcion
      int autor_id FK
      string categoria
      string fecha
      datetime created_at
      datetime updated_at
    }

    HORARIOS {
      int id PK
      string grupo_id FK
      int dia_semana
      string nombre
      string hora_inicio
      string hora_fin
      string aula_codigo FK
      int maestro_id FK
      UNIQUE grupo_dia_nombre_hora_ini_hora_fin
    }

    CALIFICACIONES_MAESTRO {
      int id PK
      int maestro_id FK
      string grupo_id FK
      int alumno_id FK
      float unidad1
      float unidad2
      float unidad3
      float promedio
      datetime updated_at
      UNIQUE maestro_grupo_alumno
    }

    ASISTENCIAS_MAESTRO {
      int id PK
      int maestro_id FK
      string grupo_id FK
      int alumno_id FK
      string fecha
      string estado
      datetime created_at
      datetime updated_at
      UNIQUE maestro_grupo_alumno_fecha
    }

    CARRERAS ||--o{ USUARIOS : carrera_codigo
    AULAS ||--o{ USUARIOS : aula_codigo
    GRUPOS ||--o{ USUARIOS : grupo_id
    AULAS ||--o{ GRUPOS : aula_codigo
    USUARIOS ||--o{ GRUPOS : tutor_maestro_id

    USUARIOS ||--o{ AVISOS : autor_id

    GRUPOS ||--o{ HORARIOS : grupo_id
    AULAS ||--o{ HORARIOS : aula_codigo
    USUARIOS ||--o{ HORARIOS : maestro_id

    USUARIOS ||--o{ CALIFICACIONES_MAESTRO : maestro_id
    USUARIOS ||--o{ CALIFICACIONES_MAESTRO : alumno_id
    GRUPOS ||--o{ CALIFICACIONES_MAESTRO : grupo_id

    USUARIOS ||--o{ ASISTENCIAS_MAESTRO : maestro_id
    USUARIOS ||--o{ ASISTENCIAS_MAESTRO : alumno_id
    GRUPOS ||--o{ ASISTENCIAS_MAESTRO : grupo_id

    PRACTICAS ||--o{ POSTULACIONES_PRACTICAS : practica_id
    USUARIOS ||--o{ POSTULACIONES_PRACTICAS : usuario_id
```

## Fuente de verdad usada

Las estructuras del modelo actual se tomaron de:
- `app/services/authDb.js`
- `app/services/adminContentDb.js`
- `app/services/scheduleDb.js`
- `app/services/gradesDb.js`
- `app/services/attendanceDb.js`

## Script de migracion

Script SQL listo para aplicar la migracion propuesta:
- `docs/migration_to_normalized_schema.sql`
