// Estado de demostración del prototipo (sin backend).
// Reglas de transición alineadas con la matriz de permisos del informe (sección 5.2) y con
// EstadoService (PU-01): cada acción sale de un estado exacto, la ejecuta un rol permitido y,
// para terreno y dibujante, solo sobre sitios propios. Los datos viven en localStorage del navegador.

const CLAVE = 'egc-demo-v1';

export const ESTADOS = [
  'Recibido', 'Visita programada', 'Visitado', 'Informe cargado',
  'En dibujo', 'Plano listo', 'Entregado', 'Facturado'
];

// Identidad de los usuarios de demostración que tienen alcance "propios"
export const ACTORES = { terreno: 'Equipo A', dibujante: 'Dibujante 2' };

// desde / hacia son índices de ESTADOS
export const ACCIONES = [
  { id: 'programar', etiqueta: 'Programar visita', desde: 0, hacia: 1, roles: ['jefe'] },
  { id: 'visita', etiqueta: 'Registrar visita', desde: 1, hacia: 2, roles: ['jefe', 'terreno'] },
  { id: 'informe', etiqueta: 'Enlazar informe', desde: 2, hacia: 3, roles: ['jefe', 'terreno'] },
  { id: 'dibujante', etiqueta: 'Asignar dibujante', desde: 3, hacia: 4, roles: ['jefe'], requiereRevision: true },
  { id: 'plano', etiqueta: 'Enlazar plano', desde: 4, hacia: 5, roles: ['jefe', 'dibujante'] },
  { id: 'entregar', etiqueta: 'Marcar Entregado', desde: 5, hacia: 6, roles: ['jefe'] },
  { id: 'facturar', etiqueta: 'Marcar Facturado', desde: 6, hacia: 7, roles: ['jefe'] }
];

// Contadores del panel para sitios que no se listan en la tabla de la maqueta
const KPI_BASE = [3, 2, 1, 2, 4, 1, 5, 6];

// Sitios históricos que no aparecen en la tabla pero sí cuentan para el aviso de duplicado
const SITIOS_FUERA_DE_VISTA = {
  '0399': { nombre: 'Los Pinos', estado: 5 },
  '0365': { nombre: 'El Mirador', estado: 6 }
};

const FECHAS_SEMILLA = ['10-11', '12-11', '19-11', '20-11', '22-11', '23-11', '24-11', '24-11'];

const textoHistorial = (estado, s) => [
  'Jefe registró la asignación',
  'Jefe programó la visita',
  `${s.equipo} registró la visita`,
  `${s.equipo} enlazó informe`,
  `Jefe asignó a ${s.dibujante ?? ACTORES.dibujante}`,
  `${s.dibujante ?? ACTORES.dibujante} enlazó plano`,
  'Jefe marcó Entregado',
  'Jefe marcó Facturado'
][estado];

const conHistorial = s => {
  s.historial = Array.from({ length: s.estado + 1 }, (_, i) => ({
    fecha: FECHAS_SEMILLA[i], texto: textoHistorial(i, s), estado: i
  }));
  return s;
};

const crearSemilla = () => {
  const sitios = [
    { id: '0412', nombre: 'Cerro Alegre', cliente: 'Entel', tipo: 'Proyección', comuna: 'Valparaíso · Valparaíso',
      plazo: '28-11-2026', estado: 1, equipo: 'Equipo A', responsable: 'Equipo A', dibujante: null, revision: null, atraso: false },
    { id: '0388', nombre: 'Lomas Norte', cliente: 'WOM', tipo: 'Levantamiento estructural', comuna: 'Quilicura · Metropolitana',
      plazo: '25-11-2026', estado: 3, equipo: 'Equipo A', responsable: 'Revisor', dibujante: null, revision: null, atraso: true },
    { id: '0431', nombre: 'Valle Sur', cliente: 'Entel', tipo: 'Levantamiento fotográfico', comuna: 'Maipú · Metropolitana',
      plazo: '30-11-2026', estado: 4, equipo: 'Equipo B', responsable: 'Dibujante 2', dibujante: 'Dibujante 2',
      revision: { resultado: 'aprobado', fecha: '21-11' }, atraso: false },
    { id: '0377', nombre: 'Pampa Alta', cliente: 'WOM', tipo: 'Proyección', comuna: 'Calama · Antofagasta',
      plazo: '24-11-2026', estado: 2, equipo: 'Contratista 1', responsable: 'Contratista 1', dibujante: null, revision: null, atraso: true },
    { id: '0420', nombre: 'Santa Rosa', cliente: 'Entel', tipo: 'Levantamiento estructural', comuna: 'La Granja · Metropolitana',
      plazo: '02-12-2026', estado: 0, equipo: 'Equipo A', responsable: 'Jefe de área', dibujante: null, revision: null, atraso: false }
  ].map(conHistorial);

  // El historial de 0431 se conserva tal como lo muestra el informe (incluye la aprobación del revisor)
  const valle = sitios.find(s => s.id === '0431');
  valle.historial.splice(4, 0, { fecha: '21-11', texto: 'Revisor aprobó el informe', estado: null });
  return { sitios };
};

let memoria = null; // respaldo si el navegador bloquea localStorage

const leer = () => {
  try {
    const bruto = localStorage.getItem(CLAVE);
    return bruto ? JSON.parse(bruto) : null;
  } catch { return null; }
};

const datos = () => leer() ?? memoria ?? (memoria = crearSemilla());

const guardar = d => {
  memoria = d;
  try { localStorage.setItem(CLAVE, JSON.stringify(d)); } catch { /* sin almacenamiento: queda en memoria */ }
};

export const reiniciarDemo = () => {
  memoria = null;
  try { localStorage.removeItem(CLAVE); } catch { /* sin almacenamiento */ }
};

const hoy = () => {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export const listarSitios = () => datos().sitios;
export const obtenerSitio = id => listarSitios().find(s => s.id === id) ?? null;

export const buscarExistente = id => {
  const s = obtenerSitio(id);
  if (s) return { nombre: s.nombre, estado: ESTADOS[s.estado] };
  const fuera = SITIOS_FUERA_DE_VISTA[id];
  return fuera ? { nombre: fuera.nombre, estado: ESTADOS[fuera.estado] } : null;
};

export const registrarSitio = ({ id, nombre }) => {
  const d = datos();
  const sitio = {
    id, nombre, cliente: 'Entel', tipo: 'Levantamiento estructural', comuna: 'Puente Alto · Metropolitana',
    plazo: '05-12-2026', estado: 0, equipo: 'Equipo A', responsable: 'Jefe de área', dibujante: null,
    revision: null, atraso: false,
    historial: [{ fecha: hoy(), texto: 'Jefe registró la asignación', estado: 0 }]
  };
  d.sitios.push(sitio);
  guardar(d);
  return sitio;
};

export const accionSiguiente = sitio => ACCIONES.find(a => a.desde === sitio.estado) ?? null;

// Un sitio es "propio" para terreno si es de su equipo, y para dibujante si está asignado a él
export const esPropio = (rol, sitio) => {
  if (rol === 'terreno') return sitio.equipo === ACTORES.terreno;
  if (rol === 'dibujante') return sitio.dibujante === ACTORES.dibujante;
  return true; // jefe y revisor ven todos los sitios
};

// Devuelve null si la acción es válida; si no, el motivo (el equivalente al 403/409 del backend)
export const motivoBloqueo = (rol, sitio, accion) => {
  if (!accion.roles.includes(rol)) return 'Tu rol no puede ejecutar esta acción.';
  if (accion.desde !== sitio.estado) return `La acción requiere el estado «${ESTADOS[accion.desde]}».`;
  if (!esPropio(rol, sitio)) {
    return rol === 'terreno'
      ? `El sitio pertenece a ${sitio.equipo}, no a tu equipo.`
      : 'El sitio no está asignado a ti.';
  }
  if (accion.requiereRevision && sitio.revision?.resultado !== 'aprobado') {
    return 'Falta la aprobación del revisor.';
  }
  return null;
};

const quienEjecuta = (rol, sitio) => ({
  jefe: 'Jefe', terreno: sitio.equipo, dibujante: ACTORES.dibujante
}[rol]);

const verboHistorial = (accion, rol, sitio) => ({
  programar: 'Jefe programó la visita',
  visita: `${quienEjecuta(rol, sitio)} registró la visita`,
  informe: `${quienEjecuta(rol, sitio)} enlazó informe`,
  dibujante: `Jefe asignó a ${ACTORES.dibujante}`,
  plano: `${quienEjecuta(rol, sitio)} enlazó plano`,
  entregar: 'Jefe marcó Entregado',
  facturar: 'Jefe marcó Facturado'
}[accion.id]);

const responsableTras = (estado, sitio) => [
  'Jefe de área', sitio.equipo, sitio.equipo,
  sitio.revision?.resultado === 'aprobado' ? 'Jefe de área' : 'Revisor',
  sitio.dibujante ?? ACTORES.dibujante, 'Jefe de área', 'Jefe de área', 'Jefe de área'
][estado];

export const aplicarAccion = (id, accionId, rol) => {
  const d = datos();
  const sitio = d.sitios.find(s => s.id === id);
  const accion = ACCIONES.find(a => a.id === accionId);
  if (!sitio || !accion) return { ok: false, error: 'Sitio o acción inexistente.' };

  const error = motivoBloqueo(rol, sitio, accion);
  if (error) return { ok: false, error };

  if (accion.id === 'dibujante') sitio.dibujante = ACTORES.dibujante;
  sitio.estado = accion.hacia;
  sitio.responsable = responsableTras(accion.hacia, sitio);
  if (accion.hacia >= 6) sitio.atraso = false;
  // Un informe nuevo (p. ej. tras una observación) vuelve a requerir revisión
  if (accion.id === 'informe') { delete sitio.observacion; sitio.revision = null; }
  sitio.historial.push({ fecha: hoy(), texto: verboHistorial(accion, rol, sitio), estado: accion.hacia });
  guardar(d);
  return { ok: true, sitio, desde: ESTADOS[accion.desde], hacia: ESTADOS[accion.hacia] };
};

// Revisión: aprobar no cambia de estado (habilita asignar dibujante); observar devuelve a «Visitado»
export const revisarInforme = (id, resultado, comentario = '') => {
  const d = datos();
  const sitio = d.sitios.find(s => s.id === id);
  if (!sitio) return { ok: false, error: 'Sitio inexistente.' };
  if (sitio.estado !== 3) {
    return { ok: false, error: `Solo se revisa un informe en «${ESTADOS[3]}»; el sitio está en «${ESTADOS[sitio.estado]}».` };
  }
  if (sitio.revision?.resultado === 'aprobado') {
    return { ok: false, error: `El informe ya fue aprobado el ${sitio.revision.fecha}.` };
  }

  if (resultado === 'aprobar') {
    sitio.revision = { resultado: 'aprobado', fecha: hoy() };
    sitio.responsable = 'Jefe de área';
    sitio.historial.push({ fecha: hoy(), texto: 'Revisor aprobó el informe', estado: null });
    guardar(d);
    return { ok: true, sitio, desde: ESTADOS[3], hacia: ESTADOS[3] };
  }

  sitio.revision = { resultado: 'observado', fecha: hoy() };
  sitio.observacion = comentario;
  sitio.estado = 2;
  sitio.responsable = sitio.equipo;
  sitio.historial.push({ fecha: hoy(), texto: 'Revisor observó el informe', estado: 2 });
  guardar(d);
  return { ok: true, sitio, desde: ESTADOS[3], hacia: ESTADOS[2] };
};

// Contadores del panel: base fija de la maqueta + diferencias de los sitios listados
export const contarPorEstado = () => {
  const ahora = Array(8).fill(0);
  listarSitios().forEach(s => { ahora[s.estado]++; });
  const inicial = Array(8).fill(0);
  crearSemilla().sitios.forEach(s => { inicial[s.estado]++; });
  return KPI_BASE.map((base, i) => base - inicial[i] + ahora[i]);
};
