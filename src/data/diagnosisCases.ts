export interface DiagnosisCase {
  id: string;
  title: string;
  description: string;
  symptoms: string[];
  questions: {
    question: string;
    options: string[];
    answer: number;
  }[];
  explanation: string;
  category: string;
}

export const DIAGNOSIS_CASES: DiagnosisCase[] = [
  {
    id: "1",
    title: "O Choque do Amendoim",
    description: "Paciente de 8 anos apresenta urticária generalizada, edema de glote e queda de pressão arterial 10 minutos após ingerir um doce em uma festa.",
    symptoms: ["Dispneia", "Hipotensão", "Edema facial", "Urticária"],
    category: "Hipersensibilidade Tipo I",
    questions: [
      {
        question: "Qual a classe de anticorpo responsável por iniciar esta reação imediata?",
        options: ["IgG", "IgM", "IgA", "IgE"],
        answer: 3
      },
      {
        question: "A qual célula o anticorpo mencionado se liga através de receptores de alta afinidade (FcεRI)?",
        options: ["Neutrófilo", "Mastócito", "Linfócito T", "Macrófago"],
        answer: 1
      },
      {
        question: "Qual o principal mediador pré-formado liberado que causa a vasodilatação e o edema?",
        options: ["Citocina", "Histamina", "Interferon", "Sistema Complemento"],
        answer: 1
      },
      {
        question: "A queda da pressão arterial indica que a reação tornou-se sistêmica. Como chamamos esse quadro?",
        options: ["Imunodeficiência", "Autoimunidade", "Anafilaxia", "Opsonização"],
        answer: 2
      },
      {
        question: "Qual o tratamento de emergência padrão-ouro para reverter o choque e o edema de glote?",
        options: ["Antibiótico", "Adrenalina (Epinefrina)", "Antiviral", "Vitamina C"],
        answer: 1
      }
    ],
    explanation: "A anafilaxia é uma reação de hipersensibilidade tipo I. A IgE ligada a mastócitos reconhece o alérgeno, causando desgranulação massiva de histamina, resultando em colapso circulatório e obstrução das vias aéreas."
  },
  {
    id: "2",
    title: "A Borboleta no Rosto",
    description: "Mulher de 25 anos com dor articular persistente, febre baixa e uma mancha avermelhada em formato de borboleta na face que piora com o sol.",
    symptoms: ["Rash malar", "Artralgia", "Fotossensibilidade", "Fadiga"],
    category: "Autoimunidade (Lúpus)",
    questions: [
      {
        question: "O 'rash malar' (mancha em borboleta) é característico de qual patologia autoimune?",
        options: ["Artrite Reumatoide", "Lúpus Eritematoso Sistêmico", "AIDS", "Psoríase"],
        answer: 1
      },
      {
        question: "Qual o mecanismo de dano tecidual predominante nesta doença?",
        options: ["Ataque direto por células NK", "Deposição de Imunocomplexos (Tipo III)", "Ação de IgE em mastócitos", "Destruição por Neutrófilos"],
        answer: 1
      },
      {
        question: "Qual exame laboratorial é o 'padrão-ouro' para triagem inicial desta suspeita?",
        options: ["Hemograma", "FAN (Anticorpos Antinucleares)", "Glicemia", "Ureia e Creatinina"],
        answer: 1
      },
      {
        question: "A deposição desses complexos nos rins pode causar qual complicação grave?",
        options: ["Cálculo Renal", "Glomerulonefrite Lúpica", "Infecção Urinária", "Diabetes Insipidus"],
        answer: 1
      },
      {
        question: "Por que a exposição solar (UV) piora as lesões cutâneas?",
        options: ["Causa queimadura simples", "Induz apoptose celular e exposição de antígenos nucleares", "O sol mata os anticorpos", "Aumenta a produção de vitamina D"],
        answer: 1
      }
    ],
    explanation: "O Lúpus (LES) é uma doença autoimune sistêmica onde anticorpos atacam o próprio núcleo das células. A formação de imunocomplexos (Antígeno-Anticorpo) circula e se deposita em vasos, pele e rins, ativando o complemento e causando inflamação crônica."
  },
  {
    id: "3",
    title: "O Inimigo Invisível",
    description: "Paciente apresenta infecções oportunistas recorrentes, como candidíase oral persistente e pneumonia por fungos. Relata perda de peso e suores noturnos.",
    symptoms: ["Linfadenopatia", "Infecções fúngicas", "Perda de peso", "Leucopenia"],
    category: "Imunodeficiência (HIV)",
    questions: [
      {
        question: "Qual o principal alvo celular do vírus HIV no sistema imunológico?",
        options: ["Linfócito B", "Linfócito T CD4+", "Linfócito T CD8+", "Célula NK"],
        answer: 1
      },
      {
        question: "O vírus utiliza qual receptor de superfície para entrar nesta célula?",
        options: ["CD8", "CD4", "MHC II", "BCR"],
        answer: 1
      },
      {
        question: "A destruição dessas células causa a perda de qual função essencial?",
        options: ["Fagocitose", "Coordenação da resposta imune adaptativa", "Produção de hemácias", "Coagulação sanguínea"],
        answer: 1
      },
      {
        question: "Como chamamos as infecções que aproveitam a baixa imunidade para atacar?",
        options: ["Infecções Primárias", "Infecções Oportunistas", "Infecções Virais", "Infecções Bacterianas"],
        answer: 1
      },
      {
        question: "Qual o critério laboratorial para definir o estágio de AIDS?",
        options: ["Presença de febre", "Contagem de CD4 abaixo de 200 células/mm³", "Presença de tosse", "Aumento de Neutrófilos"],
        answer: 1
      }
    ],
    explanation: "O HIV causa uma imunodeficiência adquirida ao destruir os linfócitos T auxiliares (CD4+). Sem eles, o sistema imune não consegue ativar células B para produzir anticorpos nem células T citotóxicas, deixando o corpo vulnerável a patógenos que normalmente seriam eliminados."
  },
  {
    id: "4",
    title: "Rejeição Pós-Transplante",
    description: "Paciente recebeu um transplante renal há 15 dias. Apresenta febre, diminuição do volume urinário e dor intensa sobre o local do enxerto.",
    symptoms: ["Oligúria", "Febre", "Hipertensão", "Dor no enxerto"],
    category: "Hipersensibilidade Tipo IV",
    questions: [
      {
        question: "Qual o tipo de rejeição que ocorre nos primeiros dias/semanas após o transplante?",
        options: ["Hiperaguda", "Aguda", "Crônica", "Inata"],
        answer: 1
      },
      {
        question: "Qual o principal mecanismo imunológico envolvido na rejeição aguda celular?",
        options: ["Anticorpos pré-formados", "Linfócitos T citotóxicos (CD8+)", "Mastócitos", "Complemento"],
        answer: 1
      },
      {
        question: "O que as células T do receptor reconhecem como 'estranho' no órgão doado?",
        options: ["Tipo sanguíneo", "Moléculas de MHC (HLA) do doador", "Glicose", "Proteínas do plasma"],
        answer: 1
      },
      {
        question: "Esta reação é classificada como qual tipo de hipersensibilidade?",
        options: ["Tipo I", "Tipo II", "Tipo III", "Tipo IV (Tardia)"],
        answer: 3
      },
      {
        question: "Qual a principal estratégia para prevenir ou tratar essa rejeição?",
        options: ["Antibióticos", "Imunossupressores (ex: Ciclosporina)", "Vitaminas", "Diuréticos"],
        answer: 1
      }
    ],
    explanation: "A rejeição aguda é mediada principalmente por células T que reconhecem o MHC do doador como não-próprio. Isso desencadeia uma resposta inflamatória citotóxica que ataca os vasos e tecidos do órgão transplantado."
  },
  {
    id: "5",
    title: "Anemia Hemolítica do RN",
    description: "Recém-nascido apresenta icterícia grave (pele amarelada) e anemia profunda logo após o nascimento. A mãe é Rh negativo e o bebê Rh positivo.",
    symptoms: ["Icterícia", "Anemia", "Hepatoesplenomegalia", "Palidez"],
    category: "Hipersensibilidade Tipo II",
    questions: [
      {
        question: "Qual a classe de anticorpo materno que atravessa a placenta e ataca o feto?",
        options: ["IgM", "IgG", "IgA", "IgE"],
        answer: 1
      },
      {
        question: "Por que a IgG ataca as hemácias do bebê?",
        options: ["Reconhece o fator Rh como antígeno estranho", "O bebê não tem sangue", "A mãe tem infecção", "O sangue é incompatível com ABO"],
        answer: 0
      },
      {
        question: "Qual o mecanismo de destruição das hemácias opsonizadas?",
        options: ["Fagocitose e Lise pelo Complemento", "Explosão celular", "Desidratação", "Falta de ferro"],
        answer: 0
      },
      {
        question: "Esta reação é classificada como qual tipo de hipersensibilidade?",
        options: ["Tipo I", "Tipo II (Citotóxica)", "Tipo III", "Tipo IV"],
        answer: 1
      },
      {
        question: "Qual medicamento a mãe deve receber em gestações futuras para prevenir isso?",
        options: ["Ferro", "Imunoglobulina Anti-Rh (RhoGAM)", "Corticoides", "Insulina"],
        answer: 1
      }
    ],
    explanation: "A Eritroblastose Fetal ocorre quando anticorpos IgG da mãe Rh- atacam as hemácias Rh+ do feto. É uma hipersensibilidade tipo II, onde o anticorpo se liga diretamente à célula-alvo, levando à sua destruição pelo sistema complemento ou macrófagos."
  }
];