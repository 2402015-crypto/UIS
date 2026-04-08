# Sistema Escolar UIS

Aplicacion movil construida con Expo + React Native para gestionar procesos escolares por roles:

- Alumno: consulta horarios, avisos, practicas y calificaciones.
- Maestro: gestiona asistencias, grupos y calificaciones.
- Servicios Escolares (admin): administra usuarios, grupos, horarios, practicas y avisos.

La persistencia se maneja con SQLite local (`uis.db`) inicializada desde servicios de la carpeta `app/services`.

## Stack Tecnologico

- Expo SDK 54
- React Native 0.81
- React Navigation
- React Native Paper
- expo-sqlite

## Ejecutar Localmente

Requisitos:

- Node.js 18+
- npm 9+

Comandos:

```bash
npm install
npm run start
```

Atajos disponibles:

- `npm run android`
- `npm run ios`
- `npm run web`
- `npm run lint`

## Build de Android

Configuracion actual en `eas.json`:

- `preview` genera APK
- `production` genera AAB

Comando para APK (preview):

```bash
npx eas build -p android --profile preview
```

## Estructura del Proyecto

```
app/
	components/
	screens/
		alumno/
		maestro/
		ServiciosE/
		login/
		registros/
		startup/
	services/
assets/
docs/
styles/
```

Entradas principales:

- `index.js`: registro del componente raiz.
- `App.js`: navegacion principal por autenticacion/rol.
- `app/components/context/AuthContext.js`: bootstrap de BD, login, registro y sesion.

## Flujo de Datos (Resumen)

1. `AuthProvider` inicializa tablas y catalogos.
2. Cada modulo (`authDb`, `scheduleDb`, `gradesDb`, etc.) crea/actualiza su esquema.
3. Las pantallas consumen funciones de `app/services` para leer/escribir en SQLite.

## Estado Actual Relevante

- Horarios sin seed por defecto.
- Los grupos se forman dinamicamente en base a altas reales de alumnos y/o horarios definidos por admin.
- Se mantiene compatibilidad con datos legacy mediante normalizacion en servicios.

## Documentacion

- `docs/migration_to_normalized_schema.sql`: script de migracion al esquema normalizado.

## Sugerencia para Revision

Para una revision funcional rapida:

1. Iniciar app y validar login por rol.
2. Crear alumno desde admin y confirmar alta de grupo.
3. Crear horarios desde admin y validar consulta en alumno.
4. Revisar asistencias/calificaciones en maestro.
