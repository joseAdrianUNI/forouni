import type { Category, Thread } from "../../types/forum";

export const CATEGORIES: Category[] = [
  { id: "general", name: "General", threadCount: 128 },
  { id: "carreras", name: "Carreras", threadCount: 76 },
  { id: "examenes", name: "Exámenes", threadCount: 54 },
  { id: "eventos", name: "Eventos", threadCount: 32 },
  { id: "tecnologia", name: "Tecnología", threadCount: 21 },
  { id: "off-topic", name: "Off-topic", threadCount: 89 },
];

export const MOCK_THREADS: Thread[] = [
  {
    id: "1",
    title: "¿Alguien más está sufriendo con el parcial de Cálculo III?",
    excerpt:
      "Dejo aquí mi resumen de series y criterios de convergencia, por si le sirve a alguien antes del examen del viernes.",
    category: "Exámenes",
    imageUrl:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80",
    author: "anon_matematico",
    createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    repliesCount: 34,
    reactionsCount: 58,
  },
  {
    id: "2",
    title: "Feria de talento UNI 2026 — fotos y resumen del evento",
    excerpt: "Quedó increíble la presentación de robótica, dejo algunas fotos del stand.",
    category: "Eventos",
    imageUrl:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&q=80",
    author: "comite_eventos",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    repliesCount: 12,
    reactionsCount: 91,
  },
  {
    id: "3",
    title: "Recomendaciones de laptop para Ingeniería en Sistemas",
    excerpt: "Entre 700-900 dólares, para programar y correr máquinas virtuales sin morir en el intento.",
    category: "Tecnología",
    author: "sistemas_2027",
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    repliesCount: 21,
    reactionsCount: 15,
  },
  {
    id: "4",
    title: "Grupo de estudio para Termodinámica — se busca gente seria",
    excerpt: "Nos reunimos martes y jueves en la biblioteca, quedan 2 cupos.",
    category: "Carreras",
    imageUrl:
      "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=600&q=80",
    author: "termo_survivor",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    repliesCount: 8,
    reactionsCount: 19,
  },
  {
    id: "5",
    title: "¿Vale la pena el club de debate este semestre?",
    excerpt: "Estoy indeciso, cuéntenme su experiencia si ya estuvieron dentro.",
    category: "General",
    author: "curioso_uni",
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    repliesCount: 5,
    reactionsCount: 7,
  },
  {
    id: "6",
    title: "Memes de finales — edición apocalipsis académico",
    excerpt: "Hilo libre para sobrevivir emocionalmente a la semana de exámenes.",
    category: "Off-topic",
    imageUrl:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80",
    author: "meme_lord_uni",
    createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    repliesCount: 63,
    reactionsCount: 140,
  },
];
