export interface DiagnosisCase {
  id: string;
  title: string;
  initialPresentation: string;
  clues: string[];
  finalQuestion: {
    question: string;
    options: string[];
    answer: number;
  };
  explanation: string;
  category: string;
}

export const DIAGNOSIS_CASES: DiagnosisCase[] = [
  {
    id: "1",
    title: "Emergência Pediátrica",
    initialPresentation: "Paciente de 8 anos é trazido às pressas após ingerir um doce em uma festa de aniversário.",
    clues: [
      "Pista 1: O paciente apresenta urticária (placas vermelhas) generalizada e coceira intensa.",
      "Pista 2: Há um inchaço visível nos lábios e pálpebras (angioedema).",
      "Pista 3: O paciente começa a apresentar estridor inspiratório e dificuldade para falar.",
      "Pista 4: A pressão arterial está em 80/40 mmHg (Hipotensão grave)."
    ],
    finalQuestion: {
      question: "Com base nas evidências clínicas, qual o diagnóstico mais provável?",
      options: ["Crise de Asma", "Choque Anafilático", "Intoxicação Alimentar", "Urticária Comum"],
      answer: 1
    },
    category: "Hipersensibilidade Tipo I",
    explanation: "Trata-se de anafilaxia, uma reação sistêmica grave mediada por IgE. A liberação massiva de histamina causa vasodilatação (choque) e edema de glote, exigindo adrenalina imediata."
  },
  {
    id: "2",
    title: "O Mistério das Articulações",
    initialPresentation: "Mulher de 25 anos queixa-se de cansaço extremo e dores nas articulações das mãos há 3 meses.",
    clues: [
      "Pista 1: A paciente relata que as dores pioram ao acordar e melhoram durante o dia.",
      "Pista 2: Surgiu uma mancha avermelhada nas bochechas e no dorso do nariz após exposição solar.",
      "Pista 3: Exames laboratoriais mostram proteinúria (proteína na urina), indicando dano renal.",
      "Pista 4: O teste de FAN (Fator Antinuclear) resultou em título alto (1:640)."
    ],
    finalQuestion: {
      question: "Qual patologia autoimune explica este quadro clínico?",
      options: ["Artrite Reumatoide", "Lúpus Eritematoso Sistêmico", "Febre Reumática", "Dermatite de Contato"],
      answer: 1
    },
    category: "Autoimunidade",
    explanation: "O Lúpus (LES) é caracterizado pelo rash malar (borboleta), artralgia e presença de autoanticorpos (FAN). É uma hipersensibilidade do tipo III por deposição de imunocomplexos."
  },
  {
    id: "3",
    title: "Vulnerabilidade Imunológica",
    initialPresentation: "Paciente de 32 anos procura o posto com tosse persistente e manchas brancas na boca.",
    clues: [
      "Pista 1: As manchas brancas são compatíveis com Candidíase Oral (sapinho).",
      "Pista 2: O paciente relata perda de 10kg nos últimos 2 meses sem dieta.",
      "Pista 3: O hemograma revela uma linfopenia (baixa contagem de linfócitos) acentuada.",
      "Pista 4: A contagem de Linfócitos T CD4+ está em 150 células/mm³."
    ],
    finalQuestion: {
      question: "Qual a condição clínica que define este estágio de imunodeficiência?",
      options: ["Leucemia", "AIDS (SIDA)", "Linfoma de Hodgkin", "Tuberculose Isolada"],
      answer: 1
    },
    category: "Imunodeficiência",
    explanation: "A AIDS é o estágio avançado da infecção pelo HIV, definido pela queda de CD4 abaixo de 200/mm³ e presença de infecções oportunistas como a candidíase esofágica."
  },
  {
    id: "4",
    title: "Complicação Pós-Cirúrgica",
    initialPresentation: "Paciente de 45 anos, transplantado renal há 12 dias, apresenta febre e mal-estar.",
    clues: [
      "Pista 1: O volume de urina (diurese) diminuiu drasticamente nas últimas 24 horas.",
      "Pista 2: Há dor e sensibilidade ao palpar a região onde o rim foi implantado.",
      "Pista 3: A biópsia do enxerto mostra infiltrado denso de Linfócitos T CD8+.",
      "Pista 4: Os níveis de creatinina sérica subiram de 1.2 para 3.5 mg/dL."
    ],
    finalQuestion: {
      question: "Qual o processo imunológico em curso?",
      options: ["Infecção Urinária", "Rejeição Aguda Celular", "Rejeição Hiperaguda", "Toxicidade por Medicamento"],
      answer: 1
    },
    category: "Transplantes",
    explanation: "A rejeição aguda ocorre dias ou semanas após o transplante e é mediada principalmente por células T que reconhecem o MHC (HLA) do doador como estranho."
  },
  {
    id: "5",
    title: "Icterícia Neonatal",
    initialPresentation: "Recém-nascido de 24 horas de vida apresenta pele e olhos amarelados (icterícia) intensa.",
    clues: [
      "Pista 1: A mãe possui tipo sanguíneo O e fator Rh Negativo.",
      "Pista 2: O bebê possui tipo sanguíneo A e fator Rh Positivo.",
      "Pista 3: O teste de Coombs Direto no sangue do bebê foi Positivo.",
      "Pista 4: O hemograma do RN mostra muitos eritroblastos (hemácias jovens) e anemia."
    ],
    finalQuestion: {
      question: "Qual o diagnóstico desta patologia hemolítica?",
      options: ["Icterícia Fisiológica", "Eritroblastose Fetal", "Anemia Falciforme", "Sepse Neonatal"],
      answer: 1
    },
    category: "Hipersensibilidade Tipo II",
    explanation: "A Eritroblastose Fetal ocorre quando anticorpos IgG anti-Rh da mãe atravessam a placenta e destroem as hemácias do feto Rh+. É uma hipersensibilidade citotóxica tipo II."
  }
];