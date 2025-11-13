// script.js - lógica central: validación, WhatsApp y carrusel
document.addEventListener('DOMContentLoaded', () => {
  // ---------- Helpers ----------
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // ---------- Animaciones al hacer scroll (simples) ----------
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('in');
    });
  }, { threshold: 0.12 });

  $$('[data-animate]').forEach(el => observer.observe(el));

  // ---------- Formulario y validación ----------
  const form = $('#pedidoForm');
  const nombre = $('#nombre');
  const email = $('#email');
  const whatsappCliente = $('#whatsappCliente');
  const descripcion = $('#descripcion');
  const destino = $('#destino');
  const producto = $('#producto');
  const formMessage = $('#formMessage');

  const setError = (input, msg) => {
    const container = input.closest('.form-row');
    const err = container.querySelector('.input-error');
    if (err) err.textContent = msg || '';
  };

  const validatePhone = (value) => {
    // Permite 7-15 dígitos (con código), solo números
    const digits = value.replace(/\D/g, '');
    return digits.length >= 7 && digits.length <= 15;
  };

  const validateEmail = (value) => {
    // validación básica
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let ok = true;
    // limpiar errores
    $$('.input-error', form).forEach(el => el.textContent = '');

    if (!nombre.value.trim()) { setError(nombre, 'Ingresa tu nombre'); ok = false; }
    if (!validateEmail(email.value.trim())) { setError(email, 'Correo inválido'); ok = false; }
    if (!validatePhone(whatsappCliente.value.trim())) { setError(whatsappCliente, 'Número de WhatsApp inválido'); ok = false; }
    if (!producto.value) { setError(producto, 'Elige un producto'); ok = false; }
    if (!descripcion.value.trim()) { setError(descripcion, 'Describe tu pedido'); ok = false; }
    if (!destino.value) { setError(destino, 'Selecciona un número de destino'); ok = false; }

    if (!ok) {
      formMessage.textContent = 'Corrige los campos en rojo para continuar.';
      formMessage.style.color = '#b00020';
      return;
    }

    // Construir mensaje
    const mensaje = `
¡Nuevo pedido desde Subliarte DC! 🎨✨

👤 Nombre: ${nombre.value.trim()}
📧 Correo: ${email.value.trim()}
📱 WhatsApp cliente: ${whatsappCliente.value.trim()}
🛍 Producto: ${producto.value}
📝 Pedido:
"${descripcion.value.trim()}"

Gracias por confiar en Subliarte DC 💖
    `;

    const waUrl = `https://wa.me/${destino.value}?text=${encodeURIComponent(mensaje)}`;

    formMessage.textContent = 'Redirigiendo a WhatsApp…';
    formMessage.style.color = ''; // color por defecto

    // Abrir en nueva pestaña
    window.open(waUrl, '_blank', 'noopener');

    // Opcional: limpiar algunos campos tras envío
    // nombre.value = ''; email.value = ''; descripcion.value = '';
  });

  // Mejora UX: validar inputs mientras escribe
  [nombre, email, whatsappCliente, descripcion, producto, destino].forEach(input => {
    input && input.addEventListener('input', () => setError(input, ''));
  });

  // ---------- Carrusel (botones + soporte táctil) ----------
  const carousel = $('#productCarousel');
  const prevButton = document.querySelector('.carousel-button.prev');
  const nextButton = document.querySelector('.carousel-button.next');

  // calcula ancho de un item visible (basado en el primer .carousel-item)
  function getItemWidth() {
    const item = carousel.querySelector('.carousel-item');
    if (!item) return carousel.clientWidth;
    return item.getBoundingClientRect().width;
  }

  nextButton && nextButton.addEventListener('click', () => {
    carousel.scrollBy({ left: getItemWidth(), behavior: 'smooth' });
  });
  prevButton && prevButton.addEventListener('click', () => {
    carousel.scrollBy({ left: -getItemWidth(), behavior: 'smooth' });
  });

  // soporte táctil (drag)
  let isDown = false, startX, scrollLeft;
  carousel.addEventListener('pointerdown', (e) => {
    isDown = true;
    carousel.setPointerCapture(e.pointerId);
    startX = e.clientX;
    scrollLeft = carousel.scrollLeft;
    carousel.classList.add('dragging');
  });
  document.addEventListener('pointerup', (e) => {
    if (!isDown) return;
    isDown = false;
    try { carousel.releasePointerCapture(e.pointerId); } catch(_) {}
    carousel.classList.remove('dragging');
  });
  document.addEventListener('pointermove', (e) => {
    if (!isDown) return;
    const x = e.clientX;
    const walk = (startX - x); // desplazamiento
    carousel.scrollLeft = scrollLeft + walk;
  });

  // Accessibility: navegar con teclas izquierda/derecha cuando el carousel esté enfocado
  carousel.setAttribute('tabindex', '0');
  carousel.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { carousel.scrollBy({ left: getItemWidth(), behavior: 'smooth' }); }
    if (e.key === 'ArrowLeft') { carousel.scrollBy({ left: -getItemWidth(), behavior: 'smooth' }); }
  });

  // ---------- Fin DOMContentLoaded ----------
});
