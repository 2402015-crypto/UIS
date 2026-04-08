# Diagrama Relacional (Version Texto)

Este documento resume el modelo entidad-relacion usado por la app.

## Entidades Principales

1. `usuarios`
2. `grupos`
3. `carreras`
4. `aulas`
5. `horarios`
6. `calificaciones_maestro`
7. `asistencias_maestro`
8. `avisos`
9. `practicas`
10. `postulaciones_practicas`

## Relaciones Clave

1. `usuarios.grupo_id -> grupos.id`
2. `usuarios.carrera_codigo -> carreras.codigo`
3. `usuarios.aula_codigo -> aulas.codigo`
4. `grupos.carrera_codigo -> carreras.codigo`
5. `grupos.aula_codigo -> aulas.codigo`
6. `grupos.tutor_maestro_id -> usuarios.id`
7. `horarios.grupo_id -> grupos.id`
8. `horarios.maestro_id -> usuarios.id`
9. `horarios.aula_codigo -> aulas.codigo`
10. `calificaciones_maestro.maestro_id -> usuarios.id`
11. `calificaciones_maestro.alumno_id -> usuarios.id`
12. `calificaciones_maestro.grupo_id -> grupos.id`
13. `asistencias_maestro.maestro_id -> usuarios.id`
14. `asistencias_maestro.alumno_id -> usuarios.id`
15. `asistencias_maestro.grupo_id -> grupos.id`
16. `avisos.autor_id -> usuarios.id`
17. `postulaciones_practicas.practica_id -> practicas.id`
18. `postulaciones_practicas.usuario_id -> usuarios.id`


## Cardinalidades 

1. `carreras 1:N grupos`
2. `aulas 1:N grupos`
3. `grupos 1:N usuarios (alumnos)`
4. `grupos 1:N horarios`
5. `usuarios (maestro) 1:N horarios`
6. `usuarios (maestro) 1:N calificaciones_maestro`
7. `usuarios (alumno) 1:N calificaciones_maestro`
8. `usuarios (maestro) 1:N asistencias_maestro`
9. `usuarios (alumno) 1:N asistencias_maestro`
10. `practicas 1:N postulaciones_practicas`
