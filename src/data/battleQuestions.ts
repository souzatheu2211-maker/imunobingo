export interface BattleQuestion {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

export const BATTLE_QUESTIONS: BattleQuestion[] = [
  {
    question: "Qual citocina é conhecida como o principal pirógeno endógeno, induzindo febre?",
    options: ["IL-1", "IL-10", "IFN-gama", "TGF-beta"],
    answer: 0,
    explanation: "A Interleucina-1 (IL-1) é produzida por macrófagos e atua no hipotálamo para elevar a temperatura corporal."
  },
  {
    question: "Qual célula é responsável por apresentar antígenos via MHC classe II para linfócitos T CD4+?",
    options: ["Célula NK", "Célula Dendrítica", "Hemácia", "Neurônio"],
    answer: 1,
    explanation: "Células dendríticas são as APCs profissionais mais eficientes na ativação de células T virgens."
  },
  {
    question: "O sistema complemento converge na clivagem de qual proteína central?",
    options: ["C1q", "C5", "C3", "C9"],
    answer: 2,
    explanation: "A clivagem de C3 é o evento central de todas as vias do complemento (clássica, alternativa e lectinas)."
  },
  {
    question: "Qual anticorpo é o principal mediador da hipersensibilidade tipo I (alergia)?",
    options: ["IgG", "IgM", "IgA", "IgE"],
    answer: 3,
    explanation: "A IgE liga-se a receptores de alta afinidade em mastócitos, desencadeando a desgranulação na presença do alérgeno."
  },
  {
    question: "Linfócitos T CD8+ reconhecem antígenos apresentados por qual molécula?",
    options: ["MHC Classe I", "MHC Classe II", "CD28", "BCR"],
    answer: 0,
    explanation: "O MHC I apresenta peptídeos endógenos para as células T citotóxicas (CD8+)."
  }
];