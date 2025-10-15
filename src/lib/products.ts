import { Product } from './types';

export const products: Product[] = [
  {
    id: 'bot-customer-service',
    name: 'Customer Service AI Bot',
    name_es: 'Bot de Servicio al Cliente IA',
    description: 'Automated customer service bot that handles inquiries 24/7 with natural language understanding.',
    description_es: 'Bot de servicio al cliente automatizado que maneja consultas 24/7 con comprensión de lenguaje natural.',
    prices: {
      usd: 4999, // $49.99
      cop: 19990000, // 199,900 COP
    },
    image: 'customer-service',
  },
  {
    id: 'bot-sales-assistant',
    name: 'Sales Assistant Bot',
    name_es: 'Bot Asistente de Ventas',
    description: 'Intelligent sales bot that engages customers, recommends products, and closes deals automatically.',
    description_es: 'Bot de ventas inteligente que involucra clientes, recomienda productos y cierra ventas automáticamente.',
    prices: {
      usd: 7999, // $79.99
      cop: 31990000, // 319,900 COP
    },
    image: 'sales-assistant',
  },
  {
    id: 'bot-appointment-scheduler',
    name: 'Appointment Scheduler Bot',
    name_es: 'Bot Programador de Citas',
    description: 'Streamline your booking process with an AI bot that schedules appointments and sends reminders.',
    description_es: 'Optimiza tu proceso de reservas con un bot IA que programa citas y envía recordatorios.',
    prices: {
      usd: 3999, // $39.99
      cop: 15990000, // 159,900 COP
    },
    image: 'appointment-scheduler',
  },
  {
    id: 'bot-lead-qualifier',
    name: 'Lead Qualification Bot',
    name_es: 'Bot Calificador de Prospectos',
    description: 'Qualify leads automatically by asking the right questions and scoring potential customers.',
    description_es: 'Califica prospectos automáticamente haciendo las preguntas correctas y puntuando clientes potenciales.',
    prices: {
      usd: 5999, // $59.99
      cop: 23990000, // 239,900 COP
    },
    image: 'lead-qualifier',
  },
  {
    id: 'bot-faq-assistant',
    name: 'FAQ Assistant Bot',
    name_es: 'Bot Asistente de Preguntas Frecuentes',
    description: 'Answer common questions instantly with a knowledge-base powered FAQ bot.',
    description_es: 'Responde preguntas comunes instantáneamente con un bot de preguntas frecuentes basado en conocimiento.',
    prices: {
      usd: 2999, // $29.99
      cop: 11990000, // 119,900 COP
    },
    image: 'faq-assistant',
  },
  {
    id: 'bot-ecommerce-helper',
    name: 'E-commerce Helper Bot',
    name_es: 'Bot Ayudante de E-commerce',
    description: 'Help customers find products, track orders, and complete purchases with ease.',
    description_es: 'Ayuda a los clientes a encontrar productos, rastrear pedidos y completar compras con facilidad.',
    prices: {
      usd: 8999, // $89.99
      cop: 35990000, // 359,900 COP
    },
    image: 'ecommerce-helper',
  },
];
