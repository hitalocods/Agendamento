import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import './styles.css';

import logoImage from '../img/logo.jpg';
import paletteImage from '../img/paleta.jpg';
import cibeleImage from '../img/Cibele Sousa.jpeg';
import danielyImage from '../img/Daniely Saraiva.jpeg';
import saraImage from '../img/Sara Raquel.jpeg';

const professionals = [
  {
    id: 'cibele',
    name: 'Cibele de Sousa',
    image: cibeleImage,
    services: ['Maquiagem', 'Penteado', 'Design de sobrancelhas', 'Lash lifting'],
    position: '50% 38%',
    phone: '5586994908213',
  },
  {
    id: 'daniely',
    name: 'Daniely Saraiva',
    image: danielyImage,
    services: ['Maquiagem', 'Penteado'],
    position: '50% 28%',
    phone: '5586994056994',
  },
  {
    id: 'sara',
    name: 'Sara Raquel',
    image: saraImage,
    services: ['Maquiagem', 'Penteado'],
    position: '50% 35%',
    phone: '5586995969231',
  },
];

const spring = { type: 'spring', stiffness: 92, damping: 18, mass: 0.9 };

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

function useImagePalette() {
  useEffect(() => {
    let active = true;
    extractPalette([logoImage, paletteImage]).then((palette) => {
      if (!active) return;
      Object.entries(palette).forEach(([key, value]) => {
        document.documentElement.style.setProperty(key, value);
      });
    });
    return () => {
      active = false;
    };
  }, []);
}

function Header() {
  return (
    <motion.header
      className="studio-header"
      initial={{ opacity: 0, y: -16, filter: 'blur(14px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 1.3, ease: [0.19, 1, 0.22, 1] }}
    >
      <motion.img
        src={logoImage}
        alt="Logo c.s_studiobeauty"
        className="logo"
        animate={{ y: [0, -4, 0], opacity: [0.94, 1, 0.94] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.h1
        initial={{ opacity: 0, letterSpacing: '0.18em' }}
        animate={{ opacity: 1, letterSpacing: '0.08em' }}
        transition={{ duration: 1.15, delay: 0.3, ease: [0.19, 1, 0.22, 1] }}
      >
        c.s_studiobeauty
      </motion.h1>
    </motion.header>
  );
}

function ProfessionalCard({ professional, onSelect, selected }) {
  return (
    <motion.button
      layoutId={`card-${professional.id}`}
      className="professional-card"
      onClick={() => onSelect(professional)}
      whileHover={{
        y: -10,
        rotateX: 3,
        rotateY: -2,
        scale: 1.018,
      }}
      whileTap={{ scale: 0.985 }}
      transition={spring}
      aria-label={`Abrir ${professional.name}`}
      data-selected={selected}
    >
      <motion.div layoutId={`media-${professional.id}`} className="card-media">
        <img
          src={professional.image}
          alt={professional.name}
          style={{ objectPosition: professional.position }}
        />
        <span className="card-light" />
      </motion.div>
      <motion.div layoutId={`name-${professional.id}`} className="card-name">
        {professional.name}
      </motion.div>
    </motion.button>
  );
}

function CardsView({ onSelect }) {
  return (
    <motion.section
      className="cards-stage"
      initial={{ opacity: 0, y: 34, filter: 'blur(12px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: 22, filter: 'blur(12px)' }}
      transition={{ duration: 0.9, ease: [0.19, 1, 0.22, 1] }}
    >
      {professionals.map((professional, index) => (
        <motion.div
          key={professional.id}
          initial={{ opacity: 0, y: 38 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.86, delay: 0.14 + index * 0.1, ease: [0.19, 1, 0.22, 1] }}
        >
          <ProfessionalCard professional={professional} onSelect={onSelect} />
        </motion.div>
      ))}
    </motion.section>
  );
}

function BookingForm({ professional }) {
  const [service, setService] = useState(professional.services[0]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setService(professional.services[0]);
    setName('');
    setPhone('');
    setErrors({});
    setSubmitted(false);
    setIsSubmitting(false);
  }, [professional]);

  function formatPhone(value) {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  }

  function handlePhoneChange(event) {
    const formatted = formatPhone(event.target.value);
    setPhone(formatted);
  }

  function validateForm() {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!phone.trim()) newErrors.phone = 'Telefone é obrigatório';
    else if (phone.replace(/\D/g, '').length < 11) newErrors.phone = 'Telefone incompleto';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function submitBooking(event) {
    event.preventDefault();
    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);
    const message = [
      `Nome: ${name.trim()}`,
      `Telefone: ${phone.trim()}`,
      `Profissional: ${professional.name}`,
      `Serviço: ${service}`,
    ].join('\n');

    const target = professional.phone || '';
    const url = target
      ? `https://wa.me/${target}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;

    setSubmitted(true);
    setTimeout(() => {
      window.open(url, '_blank', 'noopener,noreferrer');
      setIsSubmitting(false);
    }, 500);
  }

  return (
    <motion.form
      className="booking-form"
      onSubmit={submitBooking}
      initial={{ opacity: 0, y: 22, filter: 'blur(10px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.7, delay: 0.18, ease: [0.19, 1, 0.22, 1] }}
    >
      <select value={service} onChange={(event) => setService(event.target.value)} aria-label="Serviço">
        {professional.services.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      <div className="input-group">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Nome"
          autoComplete="name"
          required
          aria-invalid={errors.name ? 'true' : 'false'}
          aria-describedby={errors.name ? 'name-error' : undefined}
        />
        {errors.name && <span id="name-error" className="error-message">{errors.name}</span>}
      </div>
      <div className="input-group">
        <input
          value={phone}
          onChange={handlePhoneChange}
          placeholder="Telefone"
          autoComplete="tel"
          inputMode="tel"
          required
          maxLength={15}
          aria-invalid={errors.phone ? 'true' : 'false'}
          aria-describedby={errors.phone ? 'phone-error' : undefined}
        />
        {errors.phone && <span id="phone-error" className="error-message">{errors.phone}</span>}
      </div>
      <motion.button 
        whileHover={{ y: -2 }} 
        whileTap={{ scale: 0.98 }} 
        type="submit"
        disabled={isSubmitting}
        className={isSubmitting ? 'loading' : ''}
      >
        {isSubmitting ? 'Enviando...' : submitted ? 'Enviado!' : 'Confirmar'}
      </motion.button>
    </motion.form>
  );
}

function FocusView({ professional, onBack }) {
  const [bookingOpen, setBookingOpen] = useState(false);

  const services = useMemo(() => professional.services, [professional]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onBack();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBack]);

  return (
    <motion.section
      className="focus-stage"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
    >
      <motion.div
        className="focus-glow"
        initial={{ opacity: 0, scale: 0.82 }}
        animate={{ opacity: 0.9, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 1.1, ease: [0.19, 1, 0.22, 1] }}
      />
      <motion.button
        className="back-button"
        onClick={onBack}
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ x: -3 }}
        whileTap={{ scale: 0.98 }}
      >
        Voltar
      </motion.button>

      <motion.article layoutId={`card-${professional.id}`} className="focus-card" transition={spring}>
        <motion.div layoutId={`media-${professional.id}`} className="focus-media">
          <img
            src={professional.image}
            alt={professional.name}
            style={{ objectPosition: professional.position }}
          />
          <motion.span
            className="cinema-sheen"
            animate={{ x: ['-120%', '120%'] }}
            transition={{ duration: 4.6, repeat: Infinity, repeatDelay: 1.2, ease: 'easeInOut' }}
          />
        </motion.div>

        <div className="focus-content">
          <motion.h2 layoutId={`name-${professional.id}`}>{professional.name}</motion.h2>
          <motion.div
            className="services"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.16 } },
            }}
          >
            {services.map((service) => (
              <motion.span
                key={service}
                variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
              >
                {service}
              </motion.span>
            ))}
          </motion.div>

          <AnimatePresence mode="wait">
            {!bookingOpen ? (
              <motion.button
                key="schedule"
                className="schedule-button"
                onClick={() => setBookingOpen(true)}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                whileHover={{ y: -3, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                Agendar
              </motion.button>
            ) : (
              <BookingForm key="form" professional={professional} />
            )}
          </AnimatePresence>
        </div>
      </motion.article>
    </motion.section>
  );
}

function App() {
  const [selected, setSelected] = useState(null);
  useImagePalette();

  return (
    <LayoutGroup>
      <main className="app-shell" data-focused={Boolean(selected)}>
        <div className="ambient ambient-one" />
        <div className="ambient ambient-two" />
        <Header />
        <AnimatePresence mode="wait">
          {selected ? (
            <FocusView key={selected.id} professional={selected} onBack={() => setSelected(null)} />
          ) : (
            <CardsView key="cards" onSelect={setSelected} />
          )}
        </AnimatePresence>
      </main>
    </LayoutGroup>
  );
}

createRoot(document.getElementById('root')).render(<App />);
