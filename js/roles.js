// Roles, menús y control de acceso por pantalla (simulación del RBAC de la sección 5.2 del informe).
// En el sistema real la validación vive en el backend (DRF, respuesta 403); aquí se representa
// en el cliente para que el prototipo muestre el mismo comportamiento.

const CLAVE_ROL = 'egc-demo-rol';

// links: [archivo, etiqueta, ícono, { deshabilitado }]
export const ROLES = {
  jefe: {
    etiqueta: 'Jefe de área', correo: 'jefe@empresa.cl', identidad: 'Jefe de área', inicio: 'panel.html',
    grupos: [{
      id: 'operacion', titulo: 'Operación', icono: 'grid',
      links: [
        ['panel.html', 'Panel', 'panel'],
        ['asignacion.html', 'Nueva asignación', 'add'],
        ['detalle.html', 'Sitios', 'sites'],
        [null, 'Calendario · V2', 'panel', { deshabilitado: true }]
      ]
    }]
  },
  revisor: {
    etiqueta: 'Revisor', correo: 'revisor@empresa.cl', identidad: 'Revisor', inicio: 'revisor.html',
    grupos: [{ id: 'control', titulo: 'Control', icono: 'control', links: [['revisor.html', 'Revisión', 'review']] }]
  },
  terreno: {
    etiqueta: 'Terreno', correo: 'terreno.a@empresa.cl', identidad: 'Equipo A', inicio: 'terreno.html',
    grupos: [{ id: 'terreno', titulo: 'Mi trabajo', icono: 'grid', links: [['terreno.html', 'Mis visitas', 'sites']] }]
  },
  dibujante: {
    etiqueta: 'Dibujante', correo: 'dibujante2@empresa.cl', identidad: 'Dibujante 2', inicio: 'dibujante.html',
    grupos: [{ id: 'dibujo', titulo: 'Mi trabajo', icono: 'grid', links: [['dibujante.html', 'Mis planos', 'plan']] }]
  }
};

// Pantallas con acceso restringido y los roles que pueden abrirlas (la primera es la sesión por defecto)
export const PANTALLAS = {
  'panel.html': ['jefe'],
  'asignacion.html': ['jefe'],
  'detalle.html': ['jefe', 'revisor', 'terreno', 'dibujante'],
  'revisor.html': ['revisor'],
  'terreno.html': ['terreno'],
  'dibujante.html': ['dibujante']
};

// Menú de las páginas públicas (índice e ingreso)
export const MENU_PUBLICO = [{
  id: 'prototipo', titulo: 'Prototipo', icono: 'grid',
  links: [['login.html', 'Inicio de sesión', 'panel'], ['index.html', 'Índice de vistas', 'sites']]
}];

const leerRol = () => { try { return localStorage.getItem(CLAVE_ROL); } catch { return null; } };
const guardarRol = rol => { try { localStorage.setItem(CLAVE_ROL, rol); } catch { /* sin almacenamiento */ } };
const borrarRol = () => { try { localStorage.removeItem(CLAVE_ROL); } catch { /* sin almacenamiento */ } };

export function resolverSesion(ruta) {
  const permitidos = PANTALLAS[ruta];
  if (!permitidos) {
    if (ruta === 'login.html') borrarRol(); // entrar al ingreso equivale a cerrar sesión
    return { publica: true, rol: null, permitido: true };
  }
  const pedido = new URLSearchParams(location.search).get('rol');
  const rol = [pedido, leerRol()].find(r => Object.hasOwn(ROLES, r ?? '')) ?? permitidos[0];
  guardarRol(rol);
  return { publica: false, rol, permitido: permitidos.includes(rol) };
}

// Enlaces internos: conservan el rol para que la sesión simulada sea explícita
export function urlPara(archivo, rol, params = {}) {
  const q = new URLSearchParams({ rol, ...params });
  return `${archivo}?${q}`;
}
