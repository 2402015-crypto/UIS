import { createContext, useEffect, useState } from 'react';
import {
  ensureDefaultAdmin,
  findUserByCredentials,
  getCarrerasCatalog,
  initAuthDb,
  registerAuthUser,
  userExistsByCorreo,
} from '../../services/authDb';
import { initAdminContentDb } from '../../services/adminContentDb';
import { initAttendanceDb } from '../../services/attendanceDb';
import { initGradesDb } from '../../services/gradesDb';
import { initScheduleDb } from '../../services/scheduleDb';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [carreras, setCarreras] = useState([]);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        await initAuthDb();
        await initAdminContentDb();
        await initAttendanceDb();
        await initGradesDb();
        await initScheduleDb();
        await ensureDefaultAdmin();
        const carrerasData = await getCarrerasCatalog();
        setCarreras(carrerasData || []);
      } finally {
        setAuthReady(true);
      }
    };

    bootstrapAuth();
  }, []);

  const login = async (correo, password) => {
    if (!authReady) {
      return { ok: false, error: 'Base de datos no lista, intenta de nuevo' };
    }

    const foundUser = await findUserByCredentials(correo, password);

    if (!foundUser) {
      return { ok: false, error: 'Credenciales incorrectas' };
    }

    setUser({
      id: foundUser.id,
      nombre: foundUser.nombre,
      correo: foundUser.correo,
      matricula: foundUser.matricula,
      grupo: foundUser.grupo,
        grupoId: foundUser.grupo_id || foundUser.grupo,
      cuatrimestre: foundUser.cuatrimestre,
      carrera: foundUser.carrera,
        carreraCodigo: foundUser.carrera_codigo || foundUser.carrera,
      carreraNombre: foundUser.carreraNombre,
        aula: foundUser.aula,
        aulaCodigo: foundUser.aula_codigo || foundUser.aula,
      role: foundUser.role,
    });
    return { ok: true };
  };

  const registerUser = async ({
    nombre,
    correo,
    matricula,
    grupo,
    cuatrimestre,
    carrera,
    password,
    role = 'alumno',
  }) => {
    if (!authReady) {
      return { ok: false, error: 'Base de datos no lista, intenta de nuevo' };
    }

    const exists = await userExistsByCorreo(correo);

    if (exists) {
      return { ok: false, error: 'Ese correo ya está registrado' };
    }

    await registerAuthUser({
      nombre,
      correo,
      matricula,
      grupo,
      cuatrimestre,
      carrera,
      password,
      role,
    });

    return { ok: true };
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout, registerUser, authReady, carreras }}>
      {children}
    </AuthContext.Provider>
  );
};