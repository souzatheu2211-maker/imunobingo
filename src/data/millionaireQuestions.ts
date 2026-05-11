export interface MillionaireQuestion {
  id: string;
  difficulty: "easy" | "medium" | "hard";
  question: string;
  options: { A: string; B: string; C: string; D: string };
  correct: "A" | "B" | "C" | "D";
  explanation: string;
  tip: string;
}

export const MILLIONAIRE_QUESTIONS: MillionaireQuestion[] = [
  // EASY (1-12)
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

  // MEDIUM (13-30)
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
    question: "Qual opção representa um órgão linfóide secundário?",
    options: { A: "Timo", B: "Medula óssea", C: "Baço", D: "Bursa" },
    correct: "C",
    explanation: "O baço é órgão secundário importante que filtra o sangue.",
    tip: "Localizado no quadrante superior esquerdo do abdome."
  },
  {
    id: "m8",
    difficulty: "medium",
    question: "Qual estrutura está associada ao intestino e mucosas?",
    options: { A: "Placas de Peyer", B: "Timo", C: "Medula óssea", D: "Bursa" },
    correct: "A",
    explanation: "Placas de Peyer são tecido linfóide associado ao intestino.",
    tip: "Parte do GALT (Gut-Associated Lymphoid Tissue)."
  },
  {
    id: "m9",
    difficulty: "medium",
    question: "Qual célula é a principal apresentadora de antígeno (APC)?",
    options: { A: "Hemácia", B: "Célula dendrítica", C: "Neurônio", D: "Adipócito" },
    correct: "B",
    explanation: "Células dendríticas são APCs mais eficientes.",
    tip: "Possuem prolongamentos que lembram dendritos nervosos."
  },
  {
    id: "m10",
    difficulty: "medium",
    question: "Qual célula faz fagocitose e apresentação de antígenos?",
    options: { A: "Macrófago", B: "Plaqueta", C: "Hemácia", D: "Osteócito" },
    correct: "A",
    explanation: "Macrófagos fagocitam e apresentam antígenos.",
    tip: "Derivam dos monócitos sanguíneos."
  },
  {
    id: "m11",
    difficulty: "medium",
    question: "Qual é a função da vacinação?",
    options: { A: "Induzir memória", B: "Bloquear adaptativa", C: "Destruir linfonodos", D: "Inibir células B" },
    correct: "A",
    explanation: "Vacinas estimulam imunidade adaptativa e memória.",
    tip: "Prepara o exército antes da guerra real."
  },
  {
    id: "m12",
    difficulty: "medium",
    question: "O que reconhece epítopos na imunidade adaptativa?",
    options: { A: "BCR/TCR", B: "Complemento C3", C: "PRR", D: "Pepsina" },
    correct: "A",
    explanation: "BCR/TCR reconhecem epítopos específicos.",
    tip: "Receptores de antígenos dos linfócitos."
  },
  {
    id: "m13",
    difficulty: "medium",
    question: "Qual célula é citada como acessória/inflamatória?",
    options: { A: "Eosinófilo", B: "Linfócito T", C: "Linfócito B", D: "Célula dendrítica" },
    correct: "A",
    explanation: "Eosinófilos participam de inflamação e alergias.",
    tip: "Importante contra parasitas multicelulares."
  },
  {
    id: "m14",
    difficulty: "medium",
    question: "O que elimina patógenos rapidamente na imunidade inata?",
    options: { A: "Sistema complemento", B: "TCR", C: "BCR", D: "Anticorpo IgG" },
    correct: "A",
    explanation: "Complemento atua rapidamente contra microrganismos.",
    tip: "Proteínas plasmáticas que furam a membrana bacteriana."
  },
  {
    id: "m15",
    difficulty: "medium",
    question: "O que significa 'expansão clonal'?",
    options: { A: "Destruição de Ig", B: "Multiplicação de linfócitos", C: "Produção de hemácias", D: "Formação de muco" },
    correct: "B",
    explanation: "Linfócitos específicos se proliferam após estímulo antigênico.",
    tip: "Fazer cópias idênticas do soldado que reconheceu o inimigo."
  },
  {
    id: "m16",
    difficulty: "medium",
    question: "Qual alternativa descreve a imunidade humoral?",
    options: { A: "Mediada por T CD8", B: "Mediada por anticorpos", C: "Exclusiva de neutrófilos", D: "Exclusiva de macrófagos" },
    correct: "B",
    explanation: "Humoral envolve anticorpos e linfócitos B.",
    tip: "Ocorre nos 'humores' (líquidos) do corpo."
  },
  {
    id: "m17",
    difficulty: "medium",
    question: "Qual alternativa descreve a imunidade celular?",
    options: { A: "Mediada por T e citocinas", B: "Mediada por IgA", C: "Mediada por complemento", D: "Mediada por plaquetas" },
    correct: "A",
    explanation: "Imunidade celular depende de linfócitos T.",
    tip: "Ação direta de células sobre outras células."
  },
  {
    id: "m18",
    difficulty: "medium",
    question: "Qual célula destrói células infectadas por vírus?",
    options: { A: "Linfócito T CD8", B: "Mastócito", C: "Basófilo", D: "Eosinófilo" },
    correct: "A",
    explanation: "CD8 destrói células infectadas via MHC I.",
    tip: "Linfócito T Citotóxico."
  },

  // HARD (31-45)
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
  },
  {
    id: "h8",
    difficulty: "hard",
    question: "Qual célula libera mediadores inflamatórios na alergia?",
    options: { A: "Mastócito", B: "Hemácia", C: "Neurônio", D: "Linfócito T CD8" },
    correct: "A",
    explanation: "Mastócitos participam fortemente de hipersensibilidade.",
    tip: "Ricos em grânulos de histamina."
  },
  {
    id: "h9",
    difficulty: "hard",
    question: "Qual opção representa uma célula acessória inflamatória?",
    options: { A: "Basófilo", B: "Hepatócito", C: "Neurônio", D: "Astrócito" },
    correct: "A",
    explanation: "Basófilos participam de reações inflamatórias/alérgicas.",
    tip: "Granulócito circulante raro."
  },
  {
    id: "h10",
    difficulty: "hard",
    question: "Qual é uma função biológica do sistema imune?",
    options: { A: "Eliminar células tumorais", B: "Produzir bile", C: "Produzir T3/T4", D: "Controlar pressão" },
    correct: "A",
    explanation: "Vigilância imunológica contra tumores é função do SI.",
    tip: "Limpeza de células que sofreram mutação."
  },
  {
    id: "h11",
    difficulty: "hard",
    question: "Qual resposta é considerada 'obtida durante a vida'?",
    options: { A: "Inata", B: "Adaptativa", C: "Mecânica", D: "Metabólica" },
    correct: "B",
    explanation: "Imunidade adaptativa é adquirida ao longo da vida.",
    tip: "Também chamada de imunidade adquirida."
  },
  {
    id: "h12",
    difficulty: "hard",
    question: "Qual alternativa descreve a memória imunológica?",
    options: { A: "Resposta rápida e forte", B: "Destruir o corpo", C: "Exclusiva de neutrófilos", D: "Só ocorre na inata" },
    correct: "A",
    explanation: "Memória gera resposta mais eficiente em reinfecções.",
    tip: "O princípio básico das vacinas."
  },
  {
    id: "h13",
    difficulty: "hard",
    question: "Qual é o órgão linfóide primário em mamíferos?",
    options: { A: "Tonsilas", B: "Linfonodos", C: "Medula óssea", D: "Placas de Peyer" },
    correct: "C",
    explanation: "Medula óssea é órgão linfóide primário.",
    tip: "Onde nascem todas as células do sangue."
  },
  {
    id: "h14",
    difficulty: "hard",
    question: "Quais os principais ramos da imunidade adaptativa?",
    options: { A: "Humoral e celular", B: "Mecânica e hormonal", C: "Óssea e muscular", D: "Digestiva e respiratória" },
    correct: "A",
    explanation: "Adaptativa divide-se em humoral e celular.",
    tip: "Anticorpos vs Células T."
  },
  {
    id: "h15",
    difficulty: "hard",
    question: "Qual a contribuição de Edward Jenner?",
    options: { A: "Complemento", B: "Vacinação (varíola)", C: "MHC", D: "TCR" },
    correct: "B",
    explanation: "Jenner iniciou vacinação usando cowpox contra varíola humana.",
    tip: "O pai da imunologia."
  }
];