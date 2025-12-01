// script.js - Lógica central: validación, WhatsApp, carrusel, parallax y IA
document.addEventListener('DOMContentLoaded', () => {
  // ========================================
  // HELPERS
  // ========================================
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // ========================================
  // ANIMACIONES AL HACER SCROLL
  // ========================================
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add('in');
    });
  }, { threshold: 0.12 });

  $$('[data-animate]').forEach(el => observer.observe(el));

  // ========================================
  // FORMULARIO Y VALIDACIÓN
  // ========================================
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
    const digits = value.replace(/\D/g, '');
    return digits.length >= 7 && digits.length <= 15;
  };

  const validateEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let ok = true;
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
    formMessage.style.color = '';
    window.open(waUrl, '_blank', 'noopener');

    // Limpiar formulario
    nombre.value = '';
    email.value = '';
    whatsappCliente.value = '';
    descripcion.value = '';
    producto.value = '';
    destino.value = '';
  });

  [nombre, email, whatsappCliente, descripcion, producto, destino].forEach(input => {
    input && input.addEventListener('input', () => setError(input, ''));
  });

  // ========================================
  // CARRUSEL
  // ========================================
  const carousel = $('#productCarousel');
  const prevButton = $('.carousel-button.prev');
  const nextButton = $('.carousel-button.next');

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

  // Soporte táctil (drag)
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
    const walk = (startX - x);
    carousel.scrollLeft = scrollLeft + walk;
  });

  carousel.setAttribute('tabindex', '0');
  carousel.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') carousel.scrollBy({ left: getItemWidth(), behavior: 'smooth' });
    if (e.key === 'ArrowLeft') carousel.scrollBy({ left: -getItemWidth(), behavior: 'smooth' });
  });

  // ========================================
  // ASISTENTE DE IA (LOCAL)
  // ========================================
  class DesignAssistant {
    constructor() {
      this.designIdeas = {
        'playera': [
          'Diseños de moda con gradientes y tipografía moderna',
          'Estampados de animales o naturaleza con colores vibrantes',
          'Frases motivadoras con fuentes elegantes y efectos 3D',
          'Diseños geométricos abstractos con paletas trending',
          'Personajes de anime o videojuegos con estilo único',
          'Fotos familiares con efectos artísticos'
        ],
        'taza': [
          'Memes divertidos personalizados con nombres',
          'Fotos de mascotas con marcos decorativos',
          'Citas inspiradoras del café con tipografía elegante',
          'Diseños de temporada (navidad, halloween)',
          'Patrones geométricos alrededor de la taza',
          'Diseños profesionales con logos empresariales'
        ],
        'gorra': [
          'Logos deportivos con efectos de relieve',
          'Marcas urbanas con tipografía graffiti',
          'Iniciales estilizadas con efectos 3D',
          'Patrones camuflaje modernos con toques de color',
          'Diseños minimalistas con detalles laterales',
          'Temas de hobbies (pesca, música, deportes)'
        ],
        'cojín': [
          'Fotos familiares con efectos acuarela',
          'Diseños de mandalas con colores relajantes',
          'Frases hogareñas con tipografía cálida',
          'Patrones étnicos o bohemios',
          'Diseños infantiles con personajes animados',
          'Abstractos modernos para decoración'
        ]
      };
      
      this.qualityTips = [
        '💡 Usa imágenes de alta resolución (mínimo 300 DPI)',
        '🎨 Los fondos blancos funcionan mejor para sublimación',
        '📏 Considera el tamaño final del diseño en el producto',
        '🌈 Los colores RGB pueden verse diferentes al imprimir',
        '⚡ Los textos convertidos a curvas evitan problemas'
      ];
    }

    async getDesignSuggestions(productType) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const ideas = this.designIdeas[productType.toLowerCase()] || [
        'Diseños personalizados con colores vibrantes',
        'Combinaciones creativas que reflejen tu estilo',
        'Elementos gráficos que resalten el producto'
      ];
      
      const shuffled = [...ideas].sort(() => 0.5 - Math.random());
      const selectedIdeas = shuffled.slice(0, 3);
      const randomTip = this.qualityTips[Math.floor(Math.random() * this.qualityTips.length)];
      
      return { ideas: selectedIdeas, tip: randomTip };
    }
  }

  // Inicializar asistente
  const assistant = new DesignAssistant();
  const assistantBtn = $('#aiAssistantBtn');

  if (assistantBtn && producto) {
    // Mostrar/ocultar botón según producto
    function toggleAssistantButton() {
      const selectedProduct = producto.value;
      const hasValidProduct = selectedProduct && selectedProduct !== 'Otro';
      assistantBtn.style.display = hasValidProduct ? 'block' : 'none';
      
      const existingSuggestions = $('#ai-design-suggestions');
      if (existingSuggestions) existingSuggestions.remove();
    }
    
    producto.addEventListener('change', toggleAssistantButton);
    toggleAssistantButton();
    
    assistantBtn.addEventListener('click', async function() {
      const selectedProduct = producto.value;
      
      if (!selectedProduct || selectedProduct === 'Otro') {
        alert('Por favor, primero selecciona un tipo de producto específico');
        return;
      }
      
      const originalText = assistantBtn.textContent;
      assistantBtn.innerHTML = '🤖 Generando ideas<span class="loading-dots"></span>';
      assistantBtn.disabled = true;
      
      try {
        const suggestions = await assistant.getDesignSuggestions(selectedProduct);
        showDesignSuggestions(selectedProduct, suggestions);
      } catch (error) {
        console.error('Error en asistente:', error);
        alert('Error al generar ideas. Intenta nuevamente.');
      } finally {
        assistantBtn.textContent = originalText;
        assistantBtn.disabled = false;
      }
    });
    
    function showDesignSuggestions(productType, suggestions) {
      const existingSuggestions = $('#ai-design-suggestions');
      if (existingSuggestions) existingSuggestions.remove();
      
      const suggestionsDiv = document.createElement('div');
      suggestionsDiv.id = 'ai-design-suggestions';
      suggestionsDiv.className = 'ai-suggestions';
      
      suggestionsDiv.innerHTML = `
        <strong>💡 Ideas de diseño para ${productType}:</strong>
        <ul>
          ${suggestions.ideas.map(idea => `<li>${idea}</li>`).join('')}
        </ul>
        <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(0,0,0,0.1);">
          <strong>Consejo de calidad:</strong><br>
          ${suggestions.tip}
        </div>
        <button type="button" class="idea-button" style="margin-top: 10px;" onclick="this.parentElement.remove()">
          ✕ Cerrar sugerencias
        </button>
      `;
      
      assistantBtn.parentNode.insertBefore(suggestionsDiv, assistantBtn.nextSibling);
      
      setTimeout(() => {
        suggestionsDiv.style.opacity = '0';
        suggestionsDiv.style.transform = 'translateY(-10px)';
        suggestionsDiv.offsetHeight;
        suggestionsDiv.style.transition = 'all 0.4s ease';
        suggestionsDiv.style.opacity = '1';
        suggestionsDiv.style.transform = 'translateY(0)';
      }, 10);
    }
  }

  // ========================================
  // EFECTOS PARALLAX
  // ========================================
  
  // Fondo parallax animado
  const parallaxBg = document.createElement('div');
  parallaxBg.className = 'parallax-bg';
  document.body.insertBefore(parallaxBg, document.body.firstChild);
  
  // Hero parallax
  const heroImage = $('.hero-image img');
  const heroCopy = $('.hero-copy');
  
  // Tarjetas MVV parallax
  const mvvItems = $$('.mvv-item');
  const observerMVV = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        entry.target.style.animation = `slideInParallax 0.8s ease ${index * 0.15}s forwards`;
      }
    });
  }, { threshold: 0.2 });
  
  mvvItems.forEach(item => observerMVV.observe(item));
  
  // Logo flotante
  const logo = $('.logo');
  
  // Scroll parallax (optimizado con throttle)
  function throttle(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  const handleScroll = throttle(() => {
    const scrolled = window.pageYOffset;
    
    // Fondo parallax
    parallaxBg.style.transform = `translateY(${scrolled * 0.3}px)`;
    
    // Hero parallax
    if (heroImage && heroCopy) {
      heroImage.style.transform = `translateY(${scrolled * 0.5}px)`;
      heroCopy.style.transform = `translateY(${scrolled * 0.2}px)`;
    }
    
    // Logo flotante
    if (logo) {
      logo.style.transform = `translateY(${Math.sin(scrolled * 0.01) * 5}px) rotate(${scrolled * 0.02}deg)`;
    }
  }, 16);
  
  window.addEventListener('scroll', handleScroll);
  
  // Mouse parallax en hero (solo desktop)
  const hero = $('.hero');
  if (hero && window.innerWidth > 768) {
    hero.addEventListener('mousemove', (e) => {
      if (!heroImage) return;
      const { clientX, clientY } = e;
      const { offsetWidth, offsetHeight } = hero;
      const xPos = (clientX / offsetWidth - 0.5) * 20;
      const yPos = (clientY / offsetHeight - 0.5) * 20;
      heroImage.style.transform = `translate(${xPos}px, ${yPos}px)`;
      heroImage.style.transition = 'transform 0.3s ease-out';
    });
    
    hero.addEventListener('mouseleave', () => {
      if (heroImage) heroImage.style.transform = 'translate(0, 0)';
    });
  }

  // ========================================
  // FIN DOMContentLoaded
  // ========================================
});
