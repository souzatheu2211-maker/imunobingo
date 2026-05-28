export interface MillionaireQuestion {
  id: string;
  difficulty: "easy" | "medium" | "hard" | "special";
  question: string;
  options: { A: string; B: string; C: string; D: string };
  correct: "A" | "B" | "C" | "D";
  explanation?: string;
  tip?: string;
  isSpecial?: boolean;
  value?: number;
}

export const MILLIONAIRE_QUESTIONS: MillionaireQuestion[] = [
  {
    id: "q1",
    difficulty: "easy",
    question: "Qual célula realiza fagocitose e atua na defesa inespecífica?",
    options: { A: "Hemácia", B: "Neutrófilo", C: "Plaqueta", D: "Fibroblasto" },
    correct: "B",
    value: 1000
  },
  {
    id: "q2",
    difficulty: "easy",
    question: "Qual imunoglobulina é a mais abundante na corrente sanguínea?",
    options: { A: "IgE", B: "IgM", C: "IgA", D: "IgG" },
    correct: "D",
    value: 2000
  },
  {
    id: "prof",
    difficulty: "special",
    isSpecial: true,
    question: "Qual o nome completo do professor da disciplina?",
    options: { A: "Dr. Genivaldo Santos Cruz", B: "Genivaldo Santos Cruz", C: "Genivaldo Cruz Santos", D: "Dr Genivaldo Cruz Santos" },
    correct: "C",
    explanation: "Não tem nem explicação alguém errar essa aqui."
  },
  {
    id: "q3",
    difficulty: "easy",
    question: "Qual célula produz anticorpos?",
    options: { A: "Macrófago", B: "Linfócito B", C: "Neutrófilo", D: "Basófilo" },
    correct: "B",
    value: 3000
  },
  {
    id: "q4",
    difficulty: "easy",
    question: "Qual estrutura apresenta antígenos às células T?",
    options: { A: "Ribossomo", B: "Lisossomo", C: "MHC", D: "Centríolo" },
    correct: "C",
    value: 4000
  },
  {
    id: "q5",
    difficulty: "easy",
    question: "As células NK atuam principalmente em qual tipo de imunidade?",
    options: { A: "Humoral", B: "Específica", C: "Inata", D: "Artificial" },
    correct: "C",
    value: 5000
  },
  {
    id: "bonus",
    difficulty: "special",
    isSpecial: true,
    question: "Qual célula é responsável pela produção de anticorpos?",
    options: { A: "Neutrófilo", B: "Macrófago", C: "Linfócito B", D: "Hemácia" },
    correct: "C",
    explanation: "Os linfócitos B participam da resposta imune específica (humoral). Quando ativados, eles se diferenciam em plasmócitos, células responsáveis pela produção de anticorpos."
  },
  {
    id: "q6",
    difficulty: "medium",
    question: "Qual célula auxilia tanto a resposta humoral quanto a celular?",
    options: { A: "Hemácia", B: "Linfócito T auxiliar", C: "Plaqueta", D: "Eosinófilo" },
    correct: "B",
    value: 10000
  },
  {
    id: "q7",
    difficulty: "medium",
    question: "Qual proteína do MHC é reconhecida pelas células T CD8?",
    options: { A: "MHC classe II", B: "IgG", C: "MHC classe I", D: "Complemento" },
    correct: "C",
    value: 20000
  },
  {
    id: "q8",
    difficulty: "medium",
    question: "Qual célula libera histamina em reações alérgicas?",
    options: { A: "Basófilo", B: "Hemácia", C: "Neutrófilo", D: "Monócito" },
    correct: "A",
    value: 30000
  },
  {
    id: "q9",
    difficulty: "medium",
    question: "A perforina é produzida principalmente por:",
    options: { A: "Hemácias", B: "Células T citotóxicas", C: "Fibroblastos", D: "Plasmócitos" },
    correct: "B",
    value: 40000
  },
  {
    id: "maldade",
    difficulty: "special",
    isSpecial: true,
    question: "O quão ganancioso você é? Você pode eliminar uma pessoa do jogo e receber todo valor dela para subir ainda mais, deseja eliminar alguém?",
    options: { A: "SIM", B: "NÃO", C: "TALVEZ", D: "NUNCA" },
    correct: "B",
    explanation: "NÃO SEJA GANANCIOSO. UM CORPO NÃO FUNCIONA SOZINHO SEM O TRABALHO EM CONJUNTO DE TODAS AS CÉLULAS."
  },
  {
    id: "q10",
    difficulty: "medium",
    question: "Qual célula apresenta antígenos utilizando MHC classe II?",
    options: { A: "Hemácia", B: "Célula B", C: "Plaqueta", D: "Fibroblasto" },
    correct: "B",
    value: 50000
  },
  {
    id: "q11",
    difficulty: "hard",
    question: "Qual imunoglobulina participa mais das alergias?",
    options: { A: "IgG", B: "IgA", C: "IgM", D: "IgE" },
    correct: "D",
    value: 60000
  },
  {
    id: "q12",
    difficulty: "hard",
    question: "Qual célula combate principalmente parasitas?",
    options: { A: "Eosinófilo", B: "Hemácia", C: "Fibroblasto", D: "Condrócito" },
    correct: "A",
    value: 70000
  },
  {
    id: "q13",
    difficulty: "hard",
    question: "As células T citotóxicas possuem qual marcador?",
    options: { A: "CD4", B: "CD8", C: "CD20", D: "CD3 apenas" },
    correct: "B",
    value: 80000
  },
  {
    id: "q14",
    difficulty: "hard",
    question: "Qual processo leva uma célula à morte programada?",
    options: { A: "Necrose", B: "Mitose", C: "Apoptose", D: "Fagocitose" },
    correct: "C",
    value: 90000
  },
  {
    id: "q15",
    difficulty: "hard",
    question: "Qual estrutura é responsável por reconhecer antígenos específicos nos linfócitos T?",
    options: { A: "Ribossomo", B: "Receptor de célula T", C: "Complexo de Golgi", D: "Centríolo" },
    correct: "B",
    value: 100000
  }
];