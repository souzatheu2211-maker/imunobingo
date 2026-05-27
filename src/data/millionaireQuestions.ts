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
    explanation: "Não tem nem explicação alguém errar essa aqui.",
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
    explanation: "Os linfócitos B participam da resposta imune específica (humoral). Quando ativados, eles se diferenciam em plasmócitos, células responsáveis pela produção de anticorpos que combatem antígenos específicos.",
    tip: "Pense na imunidade humoral."
  }
};

export const MILLIONAIRE_QUESTIONS: MillionaireQuestion[] = [
  // EASY (1-22)
  {
    id: "e1",
    difficulty: "easy",
    question: "Qual característica é típica da imunidade inata?",
    options: { A: "Alta especificidade", B: "Memória duradoura", C: "Não requer contato prévio", D: "Depende de linfócitos T" },
    correct: "C",
    explanation: "A imunidade inata é imediata e não depende de exposição prévia.",
    tip: "Pense na primeira linha de defesa que já nasce com você."
  },
  {
    id: "e2",
    difficulty: "easy",
    question: "Qual característica é típica da imunidade adaptativa?",
    options: { A: "Não gera memória", B: "Altamente específica", C: "Não depende de antígenos", D: "Atua somente por fagócitos" },
    correct: "B",
    explanation: "A adaptativa é específica e produz memória imunológica.",
    tip: "É a resposta que 'aprende' com o invasor."
  },
  {
    id: "e3",
    difficulty: "easy",
    question: "Qual das opções é um exemplo de mediador celular da imunidade inata?",
    options: { A: "Linfócito T CD8", B: "Neutrófilo", C: "Anticorpo IgG", D: "Plasmócito" },
    correct: "B",
    explanation: "Neutrófilos são fagócitos típicos da imunidade inata.",
    tip: "É a célula mais numerosa que chega primeiro na infecção."
  },
  {
    id: "e4",
    difficulty: "easy",
    question: "Qual das opções é um componente humoral importante da imunidade inata?",
    options: { A: "Anticorpos", B: "Sistema complemento", C: "TCR", D: "BCR" },
    correct: "B",
    explanation: "O complemento é um sistema plasmático da imunidade inata.",
    tip: "Uma cascata de proteínas que 'complementa' a ação das células."
  },
  {
    id: "e5",
    difficulty: "easy",
    question: "Qual célula é considerada um fagócito profissional?",
    options: { A: "Linfócito B", B: "Neutrófilo", C: "Hemácia", D: "Plaqueta" },
    correct: "B",
    explanation: "Neutrófilos realizam fagocitose e destruição microbiana.",
    tip: "Eles literalmente 'comem' os patógenos."
  },
  {
    id: "e6",
    difficulty: "easy",
    question: "Qual é o principal objetivo do sistema imune?",
    options: { A: "Produzir energia", B: "Reconhecer o não-próprio", C: "Regular o coração", D: "Produzir glicose" },
    correct: "B",
    explanation: "O SI reconhece e elimina componentes não próprios.",
    tip: "Distinguir o 'eu' do 'outro'."
  },
  {
    id: "e7",
    difficulty: "easy",
    question: "Qual órgão linfóide é considerado primário?",
    options: { A: "Linfonodo", B: "Baço", C: "Timo", D: "Tonsila" },
    correct: "C",
    explanation: "O timo é órgão linfóide primário onde T amadurecem.",
    tip: "Localizado no tórax, regride com a idade."
  },
  {
    id: "e8",
    difficulty: "easy",
    question: "Qual órgão linfóide secundário filtra a linfa?",
    options: { A: "Linfonodo", B: "Medula óssea", C: "Timo", D: "Baço" },
    correct: "A",
    explanation: "Linfonodos filtram linfa e iniciam respostas adaptativas.",
    tip: "Estão espalhados pelo corpo em cadeias."
  },
  {
    id: "e9",
    difficulty: "easy",
    question: "Qual célula está mais associada à produção de anticorpos?",
    options: { A: "Linfócito B", B: "Neutrófilo", C: "NK", D: "Mastócito" },
    correct: "A",
    explanation: "Linfócitos B diferenciam-se em plasmócitos produtores de anticorpos.",
    tip: "B de 'Bone Marrow' ou 'Bursa'."
  },
  {
    id: "e10",
    difficulty: "easy",
    question: "Qual célula atua contra células infectadas e tumorais sem MHC I?",
    options: { A: "NK", B: "Hemácia", C: "Basófilo", D: "Plaqueta" },
    correct: "A",
    explanation: "Células NK atuam contra células infectadas/tumorais.",
    tip: "Assassinas Naturais."
  },
  {
    id: "e11",
    difficulty: "easy",
    question: "O que significa 'self' em imunologia?",
    options: { A: "Moléculas próprias", B: "Patógenos", C: "Anticorpos", D: "Toxinas" },
    correct: "A",
    explanation: "“Self” são componentes próprios reconhecidos como normais.",
    tip: "Tradução direta do inglês para 'si mesmo'."
  },
  {
    id: "e12",
    difficulty: "easy",
    question: "Qual dos seguintes é um patógeno alvo do sistema imune?",
    options: { A: "Vírus", B: "Bactérias", C: "Fungos", D: "Todas as anteriores" },
    correct: "D",
    explanation: "SI combate vírus, bactérias, fungos, protozoários e helmintos.",
    tip: "O sistema imune é polivalente."
  },
  {
    id: "e13",
    difficulty: "easy",
    question: "Qual célula é a principal responsável pela fagocitose inicial em infecções agudas?",
    options: { A: "Linfócito B", B: "Neutrófilo", C: "Plasmócito", D: "Linfócito T CD4" },
    correct: "B",
    explanation: "Neutrófilos são fagócitos rápidos e predominam na inflamação aguda.",
    tip: "É a célula mais numerosa do sangue."
  },
  {
    id: "e14",
    difficulty: "easy",
    question: "Qual estrutura é considerada uma barreira física da imunidade inata?",
    options: { A: "Pele", B: "Anticorpo IgG", C: "Linfócito T", D: "MHC I" },
    correct: "A",
    explanation: "Pele e mucosas são barreiras físicas importantes.",
    tip: "O maior órgão do corpo humano."
  },
  {
    id: "e15",
    difficulty: "easy",
    question: "Qual célula libera histamina em reações alérgicas?",
    options: { A: "Neutrófilo", B: "Mastócito", C: "NK", D: "Monócito" },
    correct: "B",
    explanation: "Mastócitos liberam histamina e participam de alergias.",
    tip: "Célula tecidual com muitos grânulos."
  },
  {
    id: "e16",
    difficulty: "easy",
    question: "Qual célula é mais associada à defesa contra parasitas (helmintos)?",
    options: { A: "Eosinófilo", B: "Neutrófilo", C: "Hemácia", D: "Plaqueta" },
    correct: "A",
    explanation: "Eosinófilos atacam parasitas e participam de alergias.",
    tip: "Seus grânulos coram-se com eosina."
  },
  {
    id: "e17",
    difficulty: "easy",
    question: "Qual imunoglobulina é a primeira produzida na resposta primária?",
    options: { A: "IgG", B: "IgE", C: "IgM", D: "IgA" },
    correct: "C",
    explanation: "IgM é a primeira a aparecer na resposta primária.",
    tip: "É um pentâmero gigante."
  },

  // MEDIUM (1-28)
  {
    id: "m1",
    difficulty: "medium",
    question: "Qual receptor reconhece antígenos na superfície de linfócitos B?",
    options: { A: "TCR", B: "PRR", C: "BCR", D: "MHC" },
    correct: "C",
    explanation: "Linfócitos B usam BCR para reconhecer antígenos.",
    tip: "B-Cell Receptor."
  },
  {
    id: "m2",
    difficulty: "medium",
    question: "Qual receptor reconhece antígenos em linfócitos T?",
    options: { A: "BCR", B: "TCR", C: "PRR", D: "IgE" },
    correct: "B",
    explanation: "Linfócitos T reconhecem antígenos via TCR.",
    tip: "T-Cell Receptor."
  },
  {
    id: "m3",
    difficulty: "medium",
    question: "O que são PAMPs?",
    options: { A: "Proteínas de memória", B: "Padrões de patógenos", C: "Anticorpos", D: "Receptores T" },
    correct: "B",
    explanation: "PAMPs são padrões conservados presentes em patógenos.",
    tip: "Pathogen-Associated Molecular Patterns."
  },
  {
    id: "m4",
    difficulty: "medium",
    question: "O que são PRRs?",
    options: { A: "Antígenos virais", B: "Receptores de PAMPs", C: "Anticorpos", D: "Genes MHC" },
    correct: "B",
    explanation: "PRRs detectam PAMPs e iniciam resposta inata.",
    tip: "Pattern Recognition Receptors."
  },
  {
    id: "m5",
    difficulty: "medium",
    question: "Qual molécula apresenta antígeno ao linfócito T?",
    options: { A: "MHC", B: "IgM", C: "Complemento", D: "Hemoglobina" },
    correct: "A",
    explanation: "MHC apresenta peptídeos antigênicos a linfócitos T.",
    tip: "Complexo Principal de Histocompatibilidade."
  },
  {
    id: "m6",
    difficulty: "medium",
    question: "Qual molécula é coestimulatória na ativação linfocitária?",
    options: { A: "CD28", B: "Insulina", C: "Hemoglobina", D: "Colágeno" },
    correct: "A",
    explanation: "CD28 e B7 são moléculas coestimuladoras.",
    tip: "O segundo sinal necessário para a ativação."
  },
  {
    id: "m7",
    difficulty: "medium",
    question: "Qual célula é a principal apresentadora de antígeno (APC)?",
    options: { A: "Hemácia", B: "Célula dendrítica", C: "Neurônio", D: "Adipócito" },
    correct: "B",
    explanation: "Células dendríticas são APCs mais eficientes.",
    tip: "Possuem prolongamentos que lembram dendritos nervosos."
  },
  {
    id: "m8",
    difficulty: "medium",
    question: "Qual célula faz fagocitose e apresentação de antígenos?",
    options: { A: "Macrófago", B: "Plaqueta", C: "Hemácia", D: "Osteócito" },
    correct: "A",
    explanation: "Macrófagos fagocitam e apresentam antígenos.",
    tip: "Derivam dos monócitos sanguíneos."
  },

  // HARD (1-25)
  {
    id: "h1",
    difficulty: "hard",
    question: "Por que a humoral não explica sozinha a rejeição a transplantes?",
    options: { A: "Anticorpos não existem", B: "Envolve mecanismos celulares", C: "B destroem enxertos", D: "Neutrófilos fazem memória" },
    correct: "B",
    explanation: "Rejeição e tolerância dependem fortemente de imunidade celular (T).",
    tip: "O reconhecimento do MHC estranho é feito por células T."
  },
  {
    id: "h2",
    difficulty: "hard",
    question: "Qual cientista descreveu a teoria fagocítica?",
    options: { A: "Edward Jenner", B: "Elie Metchnikoff", C: "Zinkernagel", D: "Medawar" },
    correct: "B",
    explanation: "Metchnikoff descreveu fagocitose por macrófagos e neutrófilos.",
    tip: "Ganhou o Nobel em 1908."
  },
  {
    id: "h3",
    difficulty: "hard",
    question: "Qual órgão amadurece os linfócitos T?",
    options: { A: "Linfonodo", B: "Timo", C: "Baço", D: "Placa de Peyer" },
    correct: "B",
    explanation: "Linfócitos T amadurecem no timo.",
    tip: "T de Timo."
  },
  {
    id: "h4",
    difficulty: "hard",
    question: "A remoção da Bursa de Fabricius em aves afeta qual célula?",
    options: { A: "Linfócitos T", B: "Linfócitos B", C: "Neutrófilos", D: "Mastócitos" },
    correct: "B",
    explanation: "Bursa é essencial para desenvolvimento de células B em aves.",
    tip: "B de Bursa."
  },
  {
    id: "h5",
    difficulty: "hard",
    question: "Qual é a consequência de falhas do sistema imune?",
    options: { A: "Imunodeficiências e tumores", B: "Aumento de glicose", C: "Aumento de massa", D: "Produção de Vit D" },
    correct: "A",
    explanation: "Falhas levam a imunodeficiências e maior risco de tumores.",
    tip: "O corpo fica sem vigilância."
  },
  {
    id: "h6",
    difficulty: "hard",
    question: "Qual fenômeno causa choque de transfusão?",
    options: { A: "Tolerância", B: "Incompatibilidade sanguínea", C: "Falha na fagocitose", D: "Aumento de IgA" },
    correct: "B",
    explanation: "Transfusão incompatível desencadeia reação imunológica grave.",
    tip: "Anticorpos atacando as hemácias doadas."
  },
  {
    id: "h7",
    difficulty: "hard",
    question: "Quais os pilares da organização do sistema imune?",
    options: { A: "Molecular, celular e anatômica", B: "Digestiva, nervosa e hormonal", C: "Muscular e renal", D: "Cardiovascular e cutânea" },
    correct: "A",
    explanation: "Bases do SI são molecular, celular e anatômica/histológica.",
    tip: "Do micro ao macro."
  }
];