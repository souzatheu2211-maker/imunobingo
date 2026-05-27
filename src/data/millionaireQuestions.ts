export interface MillionaireQuestion {
  id: string;
  difficulty: "easy" | "medium" | "hard" | "special";
  question: string;
  options: { A: string; B: string; C: string; D: string };
  correct: "A" | "B" | "C" | "D";
  explanation: string;
  tip: string;
  isSpecial?: boolean;
  specialType?: 'professor' | 'surprise' | 'malice';
}

export const SPECIAL_QUESTIONS: Record<string, MillionaireQuestion> = {
  professor: {
    id: "s_prof",
    difficulty: "special",
    specialType: 'professor',
    isSpecial: true,
    question: "Qual o nome completo do professor da disciplina?",
    options: { 
      A: "Dr. Genivaldo Santos Cruz", 
      B: "Genivaldo Santos Cruz", 
      C: "Genivaldo Cruz Santos", 
      D: "Dr Genivaldo Cruz Santos" 
    },
    correct: "C",
    explanation: "O nome correto é Genivaldo Cruz Santos.",
    tip: "Preste atenção na ordem dos sobrenomes!"
  },
  surprise: {
    id: "s_surp",
    difficulty: "special",
    specialType: 'surprise',
    isSpecial: true,
    question: "Qual célula é responsável pela produção de anticorpos?",
    options: { 
      A: "Neutrófilo", 
      B: "Macrófago", 
      C: "Linfócito B", 
      D: "Hemácia" 
    },
    correct: "C",
    explanation: "Os linfócitos B participam da resposta imune específica (humoral). Quando ativados, eles se diferenciam em plasmócitos, células responsáveis pela produção de anticorpos.",
    tip: "Pense na imunidade humoral."
  }
};

export const MILLIONAIRE_QUESTIONS: MillionaireQuestion[] = [
  {
    id: "q1",
    difficulty: "easy",
    question: "Qual célula realiza fagocitose e participa da defesa inespecífica?",
    options: { A: "Plaqueta", B: "Hemácia", C: "Neutrófilo", D: "Melanócito" },
    correct: "C",
    explanation: "Neutrófilos são os fagócitos mais abundantes e a primeira linha de defesa celular inespecífica.",
    tip: "É a célula mais numerosa do sangue periférico."
  },
  {
    id: "q2",
    difficulty: "easy",
    question: "Qual imunoglobulina é mais abundante no sangue?",
    options: { A: "IgE", B: "IgG", C: "IgM", D: "IgA" },
    correct: "B",
    explanation: "A IgG representa cerca de 75-80% das imunoglobulinas séricas totais.",
    tip: "É a única que atravessa a placenta."
  },
  {
    id: "q3",
    difficulty: "easy",
    question: "Qual célula produz anticorpos?",
    options: { A: "Basófilo", B: "Macrófago", C: "Linfócito B", D: "Neutrófilo" },
    correct: "C",
    explanation: "Linfócitos B se diferenciam em plasmócitos para secretar anticorpos.",
    tip: "Pense na letra B de 'Bursa' ou 'Bone Marrow'."
  },
  {
    id: "q4",
    difficulty: "easy",
    question: "O MHC possui qual função principal?",
    options: { A: "Produzir anticorpos", B: "Fazer coagulação sanguínea", C: "Produzir histamina", D: "Apresentar antígenos às células T" },
    correct: "D",
    explanation: "O Complexo Principal de Histocompatibilidade (MHC) exibe peptídeos para reconhecimento pelos receptores de células T (TCR).",
    tip: "Funciona como uma 'bandeja' para mostrar o invasor."
  },
  {
    id: "q5",
    difficulty: "easy",
    question: "As células NK pertencem principalmente a qual imunidade?",
    options: { A: "Humoral", B: "Inata", C: "Artificial", D: "Passiva" },
    correct: "B",
    explanation: "Células NK são linfócitos da imunidade inata que destroem células infectadas ou tumorais sem necessidade de sensibilização prévia.",
    tip: "Assassinas Naturais."
  },
  {
    id: "q6",
    difficulty: "medium",
    question: "Qual célula auxilia outras células do sistema imune?",
    options: { A: "Linfócito T auxiliar", B: "Fibroblasto", C: "Hemácia", D: "Osteócito" },
    correct: "A",
    explanation: "Linfócitos T auxiliares (CD4+) coordenam a resposta imune através da secreção de citocinas.",
    tip: "Também conhecida como célula T Helper."
  },
  {
    id: "q7",
    difficulty: "medium",
    question: "As células T CD8 reconhecem antígenos apresentados por:",
    options: { A: "MHC classe II", B: "IgA", C: "MHC classe I", D: "Basófilos" },
    correct: "C",
    explanation: "Células T citotóxicas (CD8+) reconhecem peptídeos endógenos apresentados via MHC I.",
    tip: "MHC I está presente em quase todas as células nucleadas."
  },
  {
    id: "q8",
    difficulty: "medium",
    question: "Qual célula libera histamina nas alergias?",
    options: { A: "Monócito", B: "Basófilo", C: "Plaqueta", D: "Hemácia" },
    correct: "B",
    explanation: "Basófilos e mastócitos possuem grânulos ricos em histamina, liberados em processos alérgicos.",
    tip: "É um granulócito circulante."
  },
  {
    id: "q9",
    difficulty: "medium",
    question: "A perforina é responsável principalmente por:",
    options: { A: "Transporte de oxigênio", B: "Produção de anticorpos", C: "Lise celular", D: "Formação de plaquetas" },
    correct: "C",
    explanation: "Perforinas criam poros na membrana da célula alvo, levando à sua destruição (lise).",
    tip: "O nome sugere 'perfurar'."
  },
  {
    id: "q10",
    difficulty: "hard",
    question: "Qual célula pode apresentar antígenos utilizando MHC II?",
    options: { A: "Neurônio", B: "Hemácia", C: "Plaqueta", D: "Célula B" },
    correct: "D",
    explanation: "Células B, macrófagos e células dendríticas são as APCs profissionais que expressam MHC II.",
    tip: "É uma das três APCs profissionais."
  },
  {
    id: "q11",
    difficulty: "hard",
    question: "Qual imunoglobulina participa mais das reações alérgicas?",
    options: { A: "IgM", B: "IgA", C: "IgE", D: "IgG" },
    correct: "C",
    explanation: "A IgE liga-se a mastócitos e basófilos, desencadeando a desgranulação na presença de alérgenos.",
    tip: "E de 'Espirro' ou 'Edema'."
  },
  {
    id: "q12",
    difficulty: "hard",
    question: "Qual célula atua principalmente contra parasitas?",
    options: { A: "Basófilo", B: "Eosinófilo", C: "Fibroblasto", D: "Hemácia" },
    correct: "B",
    explanation: "Eosinófilos são especializados no combate a helmintos e parasitas multicelulares.",
    tip: "Seus grânulos são acidófilos."
  },
  {
    id: "q13",
    difficulty: "hard",
    question: "Qual marcador caracteriza células T citotóxicas?",
    options: { A: "CD8", B: "CD4", C: "CD20", D: "CD25" },
    correct: "A",
    explanation: "O marcador CD8 é a molécula correceptora das células T citotóxicas.",
    tip: "Interage com o MHC classe I."
  },
  {
    id: "q14",
    difficulty: "hard",
    question: "A apoptose é conhecida como:",
    options: { A: "Produção de citocinas", B: "Divisão celular", C: "Morte celular programada", D: "Processo de coagulação" },
    correct: "C",
    explanation: "Apoptose é o processo de morte celular controlada e programada, sem inflamação.",
    tip: "Diferente da necrose."
  },
  {
    id: "q15",
    difficulty: "hard",
    question: "O reconhecimento de antígenos pelos linfócitos T ocorre através do:",
    options: { A: "Retículo endoplasmático", B: "Complexo de Golgi", C: "Ribossomo", D: "Receptor de célula T" },
    correct: "D",
    explanation: "O TCR (T-Cell Receptor) é o complexo proteico responsável pelo reconhecimento de antígenos apresentados via MHC.",
    tip: "Sigla em inglês: TCR."
  }
];