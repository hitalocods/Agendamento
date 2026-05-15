const professionals = [
  {
    id: 'cibele',
    name: 'Cibele de Sousa',
    image: 'img/Cibele Sousa.jpeg',
    services: ['Maquiagem', 'Penteado', 'Design de sobrancelhas', 'Lash lifting'],
    position: '50% 38%',
    phone: '5586994908213',
  },
  {
    id: 'daniely',
    name: 'Daniely Saraiva',
    image: 'img/Daniely Saraiva.jpeg',
    services: ['Maquiagem', 'Penteado'],
    position: '50% 28%',
    phone: '5586994056994',
  },
  {
    id: 'sara',
    name: 'Sara Raquel',
    image: 'img/Sara Raquel.jpeg',
    services: ['Maquiagem', 'Penteado'],
    position: '50% 35%',
    cardPosition: '48% 42%',
    phone: '5586995969231',
  },
];

function rgbToHex([r, g, b]) {
  return `#${[r, g, b].map((value) => value.toString(16).padStart(2, '0')).join('')}`;
}

function luminance([r, g, b]) {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

function saturation([r, g, b]) {
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  return max === 0 ? 0 : (max - min) / max;
}

function extractPalette(images) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { willReadFrequently: true });
  const swatches = [];

  return Promise.all(
    images.map(
      (src) =>
        new Promise((resolve) => {
          const image = new Image();
          image.crossOrigin = 'anonymous';
          image.onload = () => {
            canvas.width = 48;
            canvas.height = 48;
            context.clearRect(0, 0, 48, 48);
            context.drawImage(image, 0, 0, 48, 48);
            const data = context.getImageData(0, 0, 48, 48).data;

            for (let i = 0; i < data.length; i += 32) {
              const color = [data[i], data[i + 1], data[i + 2]];
              const light = luminance(color);
              if (light > 0.08 && light < 0.96) swatches.push(color);
            }
            resolve();
          };
          image.onerror = resolve;
          image.src = src;
        }),
    ),
  ).then(() => {
    const warm = swatches
      .filter(([r, g, b]) => r >= b && r >= g * 0.82)
      .sort((a, b) => saturation(b) - saturation(a));
    const lights = swatches.sort((a, b) => luminance(b) - luminance(a));
    const darks = [...swatches].sort((a, b) => luminance(a) - luminance(b));

    return {
      '--cream': rgbToHex(lights[Math.floor(lights.length * 0.06)] || [237, 228, 207]),
      '--sand': rgbToHex(lights[Math.floor(lights.length * 0.32)] || [205, 180, 153]),
      '--taupe': rgbToHex(lights[Math.floor(lights.length * 0.62)] || [154, 134, 112]),
      '--ink': rgbToHex(darks[Math.floor(darks.length * 0.08)] || [32, 27, 23]),
      '--gold': rgbToHex(warm[2] || [181, 127, 45]),
    };
  });
}

function initPalette() {
  extractPalette(['img/logo.jpg', 'img/paleta.jpg']).then((palette) => {
    Object.entries(palette).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
  });
}

// DOM Elements
const appShell = document.getElementById('app-shell');
const cardsStage = document.getElementById('cards-stage');
const focusStage = document.getElementById('focus-stage');
const backButton = document.getElementById('back-button');
const focusImage = document.getElementById('focus-image');
const focusName = document.getElementById('focus-name');
const focusServices = document.getElementById('focus-services');
const scheduleButton = document.getElementById('schedule-button');
const bookingForm = document.getElementById('booking-form');
const bookingService = document.getElementById('booking-service');
const bookingName = document.getElementById('booking-name');
const bookingPhone = document.getElementById('booking-phone');
const submitBooking = document.getElementById('submit-booking');
const nameError = document.getElementById('name-error');
const phoneError = document.getElementById('phone-error');

let selectedProfessional = null;

// Render Cards
function renderCards() {
  cardsStage.innerHTML = '';
  professionals.forEach((prof, index) => {
    const card = document.createElement('button');
    card.className = 'professional-card';
    card.style.animationDelay = `${0.14 + index * 0.1}s`;
    card.dataset.professional = prof.id;
    card.setAttribute('aria-label', `Abrir ${prof.name}`);
    const cardPosition = prof.cardPosition || prof.position;
    const cardImagePosition = prof.id === 'cibele' ? '' : ` style="object-position: ${cardPosition}"`;
    
    card.innerHTML = `
      <div class="card-media">
        <img src="${prof.image}" alt="${prof.name}"${cardImagePosition} />
        <span class="card-light"></span>
      </div>
      <div class="card-name">${prof.name}</div>
    `;

    card.addEventListener('click', () => openFocus(prof));
    cardsStage.appendChild(card);
  });
}

// Focus View Logic
function openFocus(prof) {
  selectedProfessional = prof;
  appShell.setAttribute('data-focused', 'true');
  
  focusImage.src = prof.image;
  focusImage.alt = prof.name;
  focusImage.style.objectPosition = prof.position;
  focusName.textContent = prof.name;

  focusServices.innerHTML = '';
  prof.services.forEach((service, index) => {
    const span = document.createElement('span');
    span.textContent = service;
    span.style.animationDelay = `${0.16 + index * 0.07}s`;
    focusServices.appendChild(span);
  });

  cardsStage.classList.add('hidden');
  focusStage.classList.remove('hidden');

  resetBookingForm();
}

function closeFocus() {
  selectedProfessional = null;
  appShell.setAttribute('data-focused', 'false');
  focusStage.classList.add('hidden');
  cardsStage.classList.remove('hidden');
}

// Booking Form Logic
function resetBookingForm() {
  scheduleButton.classList.remove('hidden');
  bookingForm.classList.add('hidden');
  bookingName.value = '';
  bookingPhone.value = '';
  nameError.style.display = 'none';
  phoneError.style.display = 'none';
  bookingName.setAttribute('aria-invalid', 'false');
  bookingPhone.setAttribute('aria-invalid', 'false');
  submitBooking.textContent = 'Confirmar';
  submitBooking.disabled = false;
  submitBooking.classList.remove('loading');

  if (selectedProfessional) {
    bookingService.innerHTML = '';
    selectedProfessional.services.forEach(service => {
      const option = document.createElement('option');
      option.value = service;
      option.textContent = service;
      bookingService.appendChild(option);
    });
  }
}

scheduleButton.addEventListener('click', () => {
  scheduleButton.classList.add('hidden');
  bookingForm.classList.remove('hidden');
});

// Phone Mask
function formatPhone(value) {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
}

bookingPhone.addEventListener('input', (e) => {
  e.target.value = formatPhone(e.target.value);
});

// Form Validation & Submission
function validateForm() {
  let isValid = true;
  const name = bookingName.value.trim();
  const phone = bookingPhone.value.trim();

  if (!name) {
    nameError.textContent = 'Nome é obrigatório';
    nameError.style.display = 'block';
    bookingName.setAttribute('aria-invalid', 'true');
    isValid = false;
  } else {
    nameError.style.display = 'none';
    bookingName.setAttribute('aria-invalid', 'false');
  }

  if (!phone) {
    phoneError.textContent = 'Telefone é obrigatório';
    phoneError.style.display = 'block';
    bookingPhone.setAttribute('aria-invalid', 'true');
    isValid = false;
  } else if (phone.replace(/\D/g, '').length < 11) {
    phoneError.textContent = 'Telefone incompleto';
    phoneError.style.display = 'block';
    bookingPhone.setAttribute('aria-invalid', 'true');
    isValid = false;
  } else {
    phoneError.style.display = 'none';
    bookingPhone.setAttribute('aria-invalid', 'false');
  }

  return isValid;
}

bookingForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!validateForm() || submitBooking.disabled) return;

  submitBooking.disabled = true;
  submitBooking.classList.add('loading');
  submitBooking.textContent = 'Enviando...';

  const message = [
    `Nome: ${bookingName.value.trim()}`,
    `Telefone: ${bookingPhone.value.trim()}`,
    `Profissional: ${selectedProfessional.name}`,
    `Serviço: ${bookingService.value}`,
  ].join('\n');

  const target = selectedProfessional.phone || '';
  const url = target
    ? `https://wa.me/${target}?text=${encodeURIComponent(message)}`
    : `https://wa.me/?text=${encodeURIComponent(message)}`;

  setTimeout(() => {
    submitBooking.textContent = 'Enviado!';
    submitBooking.classList.remove('loading');
    window.open(url, '_blank', 'noopener,noreferrer');
  }, 500);
});

backButton.addEventListener('click', closeFocus);

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !focusStage.classList.contains('hidden')) {
    closeFocus();
  }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initPalette();
  renderCards();
});
