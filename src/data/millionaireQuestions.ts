export interface MillionaireQuestion {
  id: string;
  difficulty: "easy" | "medium" | "hard";
  question: string;
  options: { A: string; B: string; C: string; D: string };
  correct: "A" | "B" | "C" | "D";
  explanation: string;
  tip: string;
  is_special?: boolean;
  special_type?: 'professor' | 'surprise';
}

export const MILLIONAIRE_QUESTIONS: MillionaireQuestion[] = [
  // EASY (1-5)
  {
    id: "q1",
    difficulty: "easy",
    question: "Qual é a primeira linha de defesa física do corpo humano?",
    options: { A: "Anticorpos", B: "Pele e Mucosas", C: "Linfócitos T", D: "Baço" },
    correct: "B",
    explanation: "A pele e as mucosas formam a barreira física inicial da imunidade inata.",
    tip: "É o maior órgão do corpo humano."
  },
  {
    id: "q2",
    difficulty: "easy",
    question: "Qual célula é conhecida como o 'comedor' de patógenos na imunidade inata?",
    options: { A: "Hemácia", B: "Macrófago", C: "Plaqueta", D: "Neurônio" },
    correct: "B",
    explanation: "Macrófagos são fagócitos profissionais que englobam e destroem invasores.",
    tip: "Seu nome vem do grego 'Grande Comedor'."
  },
  // ESPECIAL PROFESSOR (Após q2)
  {
    id: "sp_prof",
    difficulty: "medium",
    question: "QUESTÃO DO PROFESSOR: Qual citocina é o principal pirógeno endógeno que induz a febre?",
    options: { A: "IL-1", B: "IL-10", C: "TGF-beta", D: "IFN-gama" },
    correct: "A",
    explanation: "A Interleucina-1 (IL-1) atua no hipotálamo para elevar a temperatura corporal.",
    tip: "Ajudas bloqueadas! O erro aqui é fatal.",
    is_special: true,
    special_type: 'professor'
  },
  // EASY (3-5)
  {
    id: "q3",
    difficulty: "easy",
    question: "Onde os Linfócitos T completam sua maturação?",
    options: { A: "Medula Óssea", B: "Timo", C: "Fígado", D: "Pâncreas" },
    correct: "B",
    explanation: "Os precursores saem da medula mas maturam no Timo.",
    tip: "T de..."
  },
  {
    id: "q4",
    difficulty: "easy",
    question: "Qual imunoglobulina é a primeira a ser produzida em uma infecção aguda?",
    options: { A: "IgG", B: "IgE", C: "IgM", D: "IgA" },
    correct: "C",
    explanation: "A IgM é o anticorpo da fase aguda, com estrutura pentamérica.",
    tip: "É a maior de todas as Igs."
  },
  {
    id: "q5",
    difficulty: "easy",
    question: "Qual célula produz anticorpos?",
    options: { A: "Linfócito T", B: "Plasmócito", C: "Neutrófilo", D: "NK" },
    correct: "B",
    explanation: "Plasmócitos são linfócitos B diferenciados que secretam anticorpos.",
    tip: "São fábricas de proteínas."
  },
  // ESPECIAL SURPRESA (Entre q5 e q6)
  {
    id: "sp_surp",
    difficulty: "hard",
    question: "RODADA SURPRESA: Qual via do complemento é ativada diretamente pela superfície de patógenos sem anticorpos?",
    options: { A: "Via Clássica", B: "Via das Lectinas", C: "Via Alternativa", D: "Via Comum" },
    correct: "C",
    explanation: "A via alternativa é ativada pela hidrólise espontânea de C3 em superfícies estranhas.",
    tip: "Ajudas bloqueadas! O último do ranking será eliminado.",
    is_special: true,
    special_type: 'surprise'
  },
  // MEDIUM (6-9)
  {
    id: "q6",
    difficulty: "medium",
    question: "Qual molécula apresenta antígenos endógenos para células T CD8+?",
    options: { A: "MHC Classe I", B: "MHC Classe II", C: "CD28", D: "BCR" },
    correct: "A",
    explanation: "O MHC I está em todas as células nucleadas e apresenta peptídeos internos.",
    tip: "Presente em quase todas as células do corpo."
  },
  {
    id: "q7",
    difficulty: "medium",
    question: "Qual célula é responsável pela vigilância contra tumores e células sem MHC I?",
    options: { A: "Neutrófilo", B: "Célula NK", C: "Basófilo", D: "Eosinófilo" },
    correct: "B",
    explanation: "As Natural Killers matam células que tentam 'se esconder' baixando o MHC I.",
    tip: "Assassinas Naturais."
  },
  {
    id: "q8",
    difficulty: "medium",
    question: "Qual imunoglobulina atravessa a placenta para proteger o feto?",
    options: { A: "IgM", B: "IgA", C: "IgG", D: "IgE" },
    correct: "C",
    explanation: "A IgG é a única que atravessa a barreira placentária devido ao seu tamanho e receptores.",
    tip: "A mais abundante no soro."
  },
  {
    id: "q9",
    difficulty: "medium",
    question: "O que caracteriza a Hipersensibilidade Tipo I?",
    options: { A: "Imunocomplexos", B: "IgE e Mastócitos", C: "Células T tardias", D: "Citotoxicidade" },
    correct: "B",
    explanation: "A alergia imediata é mediada pela desgranulação de mastócitos via IgE.",
    tip: "Pense em rinite e anafilaxia."
  },
  // HARD (10-15)
  {
    id: "q10",
    difficulty: "hard",
    question: "Qual é a função da proteína C3b no sistema complemento?",
    options: { A: "Lise direta", B: "Opsonização", C: "Quimiotaxia", D: "Produção de IgE" },
    correct: "B",
    explanation: "C3b 'tempera' o patógeno para facilitar a fagocitose.",
    tip: "Vem do grego 'preparar para comer'."
  },
  {
    id: "q11",
    difficulty: "hard",
    question: "Qual síndrome é causada pela ausência congênita do Timo?",
    options: { A: "Síndrome de DiGeorge", B: "Síndrome de Bruton", C: "SCID", D: "Síndrome de Job" },
    correct: "A",
    explanation: "DiGeorge resulta em falha no desenvolvimento da 3ª e 4ª bolsas faríngeas.",
    tip: "Afeta a imunidade celular drasticamente."
  },
  {
    id: "q12",
    difficulty: "hard",
    question: "Qual citocina é o principal fator de crescimento para Linfócitos T?",
    options: { A: "IL-1", B: "IL-2", C: "IL-6", D: "TNF-alfa" },
    correct: "B",
    explanation: "A IL-2 promove a expansão clonal de células T ativadas.",
    tip: "Essencial para a proliferação."
  },
  {
    id: "q13",
    difficulty: "hard",
    question: "O que é um Hapteno?",
    options: { A: "Um antígeno completo", B: "Molécula pequena que precisa de carreador", C: "Um tipo de anticorpo", D: "Uma célula do baço" },
    correct: "B",
    explanation: "Haptenos são antigênicos mas não imunogênicos sozinhos.",
    tip: "Pense no Níquel em bijuterias."
  },
  {
    id: "q14",
    difficulty: "hard",
    question: "Qual via do complemento utiliza a C1q para iniciar a cascata?",
    options: { A: "Via Alternativa", B: "Via das Lectinas", C: "Via Clássica", D: "Via Terminal" },
    correct: "C",
    explanation: "A via clássica inicia com o complexo C1 ligando-se a anticorpos.",
    tip: "Depende de anticorpos IgG ou IgM."
  },
  {
    id: "q15",
    difficulty: "hard",
    question: "PERGUNTA DO MILHÃO: Qual mecanismo evita que o sistema imune ataque o próprio corpo?",
    options: { A: "Opsonização", B: "Tolerância Imunológica", C: "Diapedese", D: "Quimiotaxia" },
    correct: "B",
    explanation: "A tolerância central e periférica educa os linfócitos a não reagirem ao 'self'.",
    tip: "O equilíbrio entre defesa e auto-ataque."
  }
];