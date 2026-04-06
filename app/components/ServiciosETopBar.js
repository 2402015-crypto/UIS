import AlumnoTopBar from './AlumnoTopBar';
import ServiciosEMenuDrawer from './ServiciosEMenuDrawer';

export default function ServiciosETopBar() {
  return <AlumnoTopBar enableMenuDrawer MenuDrawerComponent={ServiciosEMenuDrawer} />;
}
