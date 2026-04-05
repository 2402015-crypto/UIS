const HORARIOS_POR_DIA = {
  lunes: [
    { nombre: 'Programacion Web', hora: '07:00 - 09:00', aula: 'D210', profesor: 'Maria Garcia Lopez' },
    { nombre: 'Base de Datos', hora: '09:00 - 11:00', aula: 'D210', profesor: 'Carlos Hernandez' },
  ],
  martes: [
    { nombre: 'Desarrollo Movil', hora: '07:00 - 09:00', aula: 'D210', profesor: 'Ana Perez' },
    { nombre: 'Redes', hora: '09:00 - 11:00', aula: 'D208', profesor: 'Luis Torres' },
  ],
  miercoles: [
    { nombre: 'Programacion Web', hora: '08:00 - 10:00', aula: 'D210', profesor: 'Maria Garcia Lopez' },
    { nombre: 'Base de Datos', hora: '10:00 - 12:00', aula: 'D210', profesor: 'Carlos Hernandez' },
  ],
  jueves: [
    { nombre: 'Desarrollo Movil', hora: '07:00 - 09:00', aula: 'D210', profesor: 'Ana Perez' },
    { nombre: 'Ingles', hora: '09:00 - 11:00', aula: 'D105', profesor: 'Sofia Martinez' },
  ],
  viernes: [
    { nombre: 'Integradora', hora: '08:00 - 10:00', aula: 'D110', profesor: 'Jorge Ramirez' },
  ],
  sabado: [
    { nombre: 'Programacion Web', hora: '07:00 - 09:00', aula: 'D210', profesor: 'Maria Garcia Lopez' },
    { nombre: 'Base de Datos', hora: '09:00 - 11:00', aula: 'D210', profesor: 'Carlos Hernandez' },
  ],
  domingo: [],
};

export function normalizeDayName(dayName) {
  return dayName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export function getScheduleForDate(date) {
  const diaHoy = new Intl.DateTimeFormat('es-MX', { weekday: 'long' }).format(date);
  const fechaHoy = new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'long',
  }).format(date);
  const diaKey = normalizeDayName(diaHoy);
  const clases = HORARIOS_POR_DIA[diaKey] || [];

  return {
    diaHoy,
    fechaHoy,
    diaKey,
    clases,
  };
}

export { HORARIOS_POR_DIA };
