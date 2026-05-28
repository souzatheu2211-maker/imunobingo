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
  // ESPECIAIS
  {
    id: "spec_prof_1",
    difficulty: "medium",
    is_special: true,
    special_type: 'professor',
    question: "O Dr. Micróbios exige: Qual citocina é o principal fator de crescimento autócrino para a expansão clonal de linfócitos T?",
    options: { A: "IL-1", B: "IL-2", C: "IL-10", D: "IFN-gama" },
    correct: "B",
    explanation: "A IL-2 é essencial para a proliferação de células T ativadas.",
    tip: "Ajudas bloqueadas pelo Professor!"
  },
  {
    id: "spec_surp_1",
    difficulty: "hard",
    is_special: true,
    special_type: 'surprise',
    question: "SURPRESA: Qual molécula de superfície é o marcador definitivo para identificar Linfócitos T Auxiliares?",
    options: { A: "CD8", B: "CD3", C: "CD4", D: "CD19" },
    correct: "C",
    explanation: "CD4 é o marcador de células T helper, enquanto CD8 é de citotóxicas.",
    tip: "Cuidado: O último do ranking será eliminado!"
  },
  // EASY (q1-q5)
  {
    id: "q1",
    difficulty: "easy",
    question: "Qual é a primeira linha de defesa do corpo, que já nasce com o indivíduo?",
    options: { A: "Imunidade Adaptativa", B: "Imunidade Inata", C: "Vacinas", D: "Anticorpos IgG" },
    correct: "B",
    explanation: "A imunidade inata é imediata e inespecífica.",
    tip: "Pense em barreiras naturais."
  },
  {
    id: "q2",
    difficulty: "easy",
    question: "Qual célula é famosa por 'comer' patógenos e apresentar seus restos?",
    options: { A: "Hemácia", B: "Macrófago", C: "Plaqueta", D: "Neurônio" },
    correct: "B",
    explanation: "Macrófagos são fagócitos e APCs (Células Apresentadoras de Antígenos).",
    tip: "O nome vem do grego 'grande comedor'."
  },
  {
    id: "q3",
    difficulty: "easy",
    question: "Onde os Linfócitos T terminam sua maturação?",
    options: { A: "Medula Óssea", B: "Baço", C: "Timo", D: "Fígado" },
    correct: "C",
    explanation: "Linfócitos T (T de Timo) amadurecem neste órgão torácico.",
    tip: "Um órgão que regride com a idade."
  },
  {
    id: "q4",
    difficulty: "easy",
    question: "Qual anticorpo é o primeiro a ser produzido em uma infecção recente?",
    options: { A: "IgG", B: "IgE", C: "IgM", D: "IgA" },
    correct: "C",
    explanation: "IgM é o anticorpo da fase aguda, um pentâmero gigante.",
    tip: "M de 'Muito cedo'."
  },
  {
    id: "q5",
    difficulty: "easy",
    question: "Qual destes é um exemplo de barreira física da imunidade inata?",
    options: { A: "Linfonodo", B: "Pele", C: "Anticorpo", D: "Célula B" },
    correct: "B",
    explanation: "A pele íntegra é a barreira física mais importante.",
    tip: "O maior órgão do corpo."
  },
  // MEDIUM (q6-q10)
  {
    id: "q6",
    difficulty: "medium",
    question: "Qual molécula apresenta antígenos endógenos para células T CD8+?",
    options: { A: "MHC Classe I", B: "MHC Classe II", C: "BCR", D: "TCR" },
    correct: "A",
    explanation: "MHC I está em todas as células nucleadas e apresenta para CD8.",
    tip: "Presente em quase todas as células do corpo."
  },
  {
    id: "q7",
    difficulty: "medium",
    question: "Qual célula é a principal responsável pela produção de anticorpos?",
    options: { A: "Linfócito T", B: "Plasmócito", C: "Célula NK", D: "Neutrófilo" },
    correct: "B",
    explanation: "Plasmócitos são células B diferenciadas que secretam anticorpos.",
    tip: "Deriva do Linfócito B."
  },
  {
    id: "q8",
    difficulty: "medium",
    question: "O sistema complemento converge na clivagem de qual proteína central?",
    options: { A: "C1q", B: "C3", C: "C5", D: "C9" },
    correct: "B",
    explanation: "A clivagem de C3 é o ponto central de todas as vias do complemento.",
    tip: "É o componente mais abundante do sistema."
  },
  {
    id: "q9",
    difficulty: "medium",
    question: "Qual imunoglobulina atravessa a placenta para proteger o feto?",
    options: { A: "IgM", B: "IgA", C: "IgG", D: "IgE" },
    correct: "C",
    explanation: "IgG é a única classe que atravessa a barreira placentária.",
    tip: "A mais abundante no soro."
  },
  {
    id: "q10",
    difficulty: "medium",
    question: "Qual célula é ativada por IgE e libera histamina em alergias?",
    options: { A: "Mastócito", B: "Eosinófilo", C: "Linfócito B", D: "Macrófago" },
    correct: "A",
    explanation: "Mastócitos possuem receptores de alta afinidade para IgE.",
    tip: "Célula tecidual cheia de grânulos."
  },
  // HARD (q11-q15)
  {
    id: "q11",
    difficulty: "hard",
    question: "Qual tipo de hipersensibilidade é mediada por imunocomplexos?",
    options: { A: "Tipo I", B: "Tipo II", C: "Tipo III", D: "Tipo IV" },
    correct: "C",
    explanation: "Tipo III envolve deposição de complexos antígeno-anticorpo.",
    tip: "Exemplo: Lúpus Eritematoso Sistêmico."
  },
  {
    id: "q12",
    difficulty: "hard",
    question: "Qual é o mecanismo de ação das células NK (Natural Killer)?",
    options: { A: "Fagocitose", B: "Produção de muco", C: "Lise por perforinas e granzimas", D: "Apresentação via MHC II" },
    correct: "C",
    explanation: "NKs induzem apoptose em células sem MHC I ou estressadas.",
    tip: "Assassinas naturais."
  },
  {
    id: "q13",
    difficulty: "hard",
    question: "Qual citocina é o principal mediador da resposta antiviral inata?",
    options: { A: "TNF-alfa", B: "Interferon Tipo I (IFN-a/b)", C: "IL-4", D: "IL-17" },
    correct: "B",
    explanation: "IFNs tipo I induzem estado antiviral nas células vizinhas.",
    tip: "Eles 'interferem' na replicação viral."
  },
  {
    id: "q14",
    difficulty: "hard",
    question: "A seleção negativa de linfócitos T no timo visa evitar:",
    options: { A: "Imunodeficiência", B: "Autoimunidade", C: "Alergias", D: "Câncer" },
    correct: "B",
    explanation: "A seleção negativa elimina células que reconhecem o 'self' com alta afinidade.",
    tip: "Garante a tolerância central."
  },
  {
    id: "q15",
    difficulty: "hard",
    question: "Qual receptor celular reconhece padrões moleculares associados a patógenos (PAMPs)?",
    options: { A: "TCR", B: "BCR", C: "TLR (Toll-Like Receptor)", D: "CD28" },
    correct: "C",
    explanation: "TLRs são os principais PRRs (Receptores de Reconhecimento de Padrão).",
    tip: "Uma família de receptores da imunidade inata."
  }
];