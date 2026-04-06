import AlumnoTopBar from './AlumnoTopBar';
import MaestroMenuDrawer from './MaestroMenuDrawer';

export default function MaestroTopBar() {
  return <AlumnoTopBar enableMenuDrawer MenuDrawerComponent={MaestroMenuDrawer} />;
}
