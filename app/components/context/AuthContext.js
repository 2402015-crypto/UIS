import { createContext, useEffect, useState } from 'react';
import {
  ensureDefaultAdmin,
  findUserByCredentials,
  getCarrerasCatalog,
  initAuthDb,
  registerAuthUser,
  userExistsByCorreo,
} from '../../services/authDb';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [carreras, setCarreras] = useState([]);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        await initAuthDb();
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
      nombre: foundUser.nombre,
      correo: foundUser.correo,
      matricula: foundUser.matricula,
      grupo: foundUser.grupo,
      cuatrimestre: foundUser.cuatrimestre,
      carrera: foundUser.carrera,
      carreraNombre: foundUser.carreraNombre,
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
      return { ok: false, error: 'Ese correo ya esta registrado' };
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