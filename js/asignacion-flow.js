// "Nueva asignación": valida duplicados de código Subtel y registra el sitio en estado «Recibido» (datos ficticios)
import { buscarExistente, registrarSitio } from './store.js';
import { urlPara } from './roles.js';

// Normaliza: sin espacios y en mayúsculas ("  04 12 " no cambia el resultado de comparar "0412")
const normalizar = valor => valor.replace(/\s+/g, '').toUpperCase();

export function initAsignacionFlow(rol = 'jefe') {
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

  const buscarDuplicado = () => buscarExistente(normalizar(codigo.value));

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
    const sitio = registrarSitio({ id: normalizar(codigo.value), nombre: nombre.value.trim() });
    location.href = urlPara('panel.html', rol, { nuevo: sitio.id });
  });

  validar();
}