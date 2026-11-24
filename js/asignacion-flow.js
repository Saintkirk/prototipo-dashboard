// Validación de duplicado de código Subtel en "Nueva asignación" (datos ficticios del prototipo)
const SITIOS_EXISTENTES = {
  '0412': { nombre: 'Cerro Alegre', estado: 'Visita programada' },
  '0388': { nombre: 'Lomas Norte', estado: 'Informe cargado' },
  '0431': { nombre: 'Valle Sur', estado: 'En dibujo' },
  '0377': { nombre: 'Pampa Alta', estado: 'Visitado' },
  '0420': { nombre: 'Santa Rosa', estado: 'Recibido' },
  '0399': { nombre: 'Los Pinos', estado: 'Plano listo' },
  '0365': { nombre: 'El Mirador', estado: 'Entregado' }
};

// Normaliza: sin espacios y en mayúsculas ("  04 12 " no cambia el resultado de comparar "0412")
const normalizar = valor => valor.replace(/\s+/g, '').toUpperCase();

export function initAsignacionFlow() {
  const form = document.getElementById('form-asignacion');
  const codigo = document.getElementById('codigo');
  const nombre = document.getElementById('nombre');
  const aviso = document.getElementById('aviso-duplicado');
  const guardar = document.getElementById('guardar');
  if (!form || !codigo || !aviso) return;

  const mostrar = (mensaje, tipo = 'aviso') => {
    aviso.className = 'warn';
    aviso.style.borderColor = tipo === 'error' ? 'var(--alerta)' : '';
    aviso.textContent = mensaje;
    aviso.hidden = false;
  };
  const ocultar = () => { aviso.hidden = true; aviso.textContent = ''; };

  const buscarDuplicado = () => SITIOS_EXISTENTES[normalizar(codigo.value)] ?? null;

  const validar = () => {
    const existente = buscarDuplicado();
    codigo.setAttribute('aria-invalid', String(Boolean(existente)));
    if (existente) {
      mostrar(`Ya existe un sitio con el código ${normalizar(codigo.value)} (${existente.nombre}, estado: ${existente.estado}). ¿Es la misma asignación? Revisa antes de guardar.`);
      guardar.setAttribute('aria-disabled', 'true');
      guardar.style.opacity = '.55';
      return false;
    }
    ocultar();
    guardar.removeAttribute('aria-disabled');
    guardar.style.opacity = '';
    return true;
  };

  codigo.addEventListener('input', validar);
  codigo.addEventListener('blur', validar);

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!normalizar(codigo.value) || !nombre.value.trim()) {
      mostrar('Completa el código Subtel y el nombre del sitio para guardar.', 'error');
      (normalizar(codigo.value) ? nombre : codigo).focus();
      return;
    }
    if (!validar()) { codigo.focus(); return; }
    location.href = 'panel.html';
  });

  validar();
}