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
    description: "Paciente de 8 anos apresenta urticária generalizada, edema de glote e queda de pressão arterial 10 minutos após ingerir um doce.",
    symptoms: ["Dispneia", "Hipotensão", "Edema facial"],
    category: "Hipersensibilidade Tipo I",
    questions: [
      {
        question: "Qual o mecanismo imunológico predominante?",
        options: ["Imunocomplexos", "IgE e Mastócitos", "Células T citotóxicas", "Citotoxicidade por IgG"],
        answer: 1
      },
      {
        question: "Qual o tratamento imediato de escolha?",
        options: ["Antibiótico", "Adrenalina", "Antiviral", "Vitamina C"],
        answer: 1
      }
    ],
    explanation: "Trata-se de anafilaxia, uma reação de hipersensibilidade tipo I mediada por IgE que causa liberação massiva de histamina."
  },
  {
    id: "2",
    title: "A Borboleta no Rosto",
    description: "Mulher de 25 anos com dor articular, febre e mancha avermelhada em formato de borboleta na face após exposição solar.",
    symptoms: ["Rash malar", "Artralgia", "Fotossensibilidade"],
    category: "Autoimunidade (Lúpus)",
    questions: [
      {
        question: "Qual o diagnóstico mais provável?",
        options: ["Artrite Séptica", "Lúpus Eritematoso Sistêmico", "Dermatite de Contato", "HIV"],
        answer: 1
      },
      {
        question: "Qual tipo de hipersensibilidade explica o dano tecidual?",
        options: ["Tipo I", "Tipo II", "Tipo III", "Tipo IV"],
        answer: 2
      }
    ],
    explanation: "O LES é uma doença autoimune onde imunocomplexos (Tipo III) se depositam nos tecidos, causando inflamação."
  },
  {
    id: "3",
    title: "O Inimigo Invisível",
    description: "Paciente com infecções oportunistas recorrentes (candidíase oral e pneumonia por fungo). Exames mostram contagem de células T muito baixa.",
    symptoms: ["Perda de peso", "Linfadenopatia", "Infecções fúngicas"],
    category: "Imunodeficiência (HIV)",
    questions: [
      {
        question: "Qual célula é o alvo principal do vírus HIV?",
        options: ["Linfócito B", "Linfócito T CD4+", "Neutrófilo", "Macrófago"],
        answer: 1
      }
    ],
    explanation: "O HIV infecta células CD4+, desestruturando toda a coordenação da resposta imune adaptativa."
  },
  {
    id: "4",
    title: "Rejeição Pós-Transplante",
    description: "Paciente submetido a transplante renal há 10 dias apresenta febre e dor no local do enxerto. Biópsia mostra infiltrado de linfócitos.",
    symptoms: ["Febre", "Oligúria", "Dor local"],
    category: "Hipersensibilidade Tipo IV",
    questions: [
      {
        question: "Qual o tipo de rejeição celular predominante?",
        options: ["Tipo I", "Tipo II", "Tipo III", "Tipo IV"],
        answer: 3
      }
    ],
    explanation: "A rejeição aguda é mediada principalmente por células T (Tipo IV) que reconhecem o MHC do doador como estranho."
  },
  {
    id: "5",
    title: "Anemia Hemolítica",
    description: "Recém-nascido apresenta icterícia grave e anemia logo após o parto. A mãe é Rh negativo e o bebê Rh positivo.",
    symptoms: ["Icterícia", "Anemia", "Hepatoesplenomegalia"],
    category: "Hipersensibilidade Tipo II",
    questions: [
      {
        question: "Qual o mecanismo de destruição das hemácias?",
        options: ["Lise por IgE", "Opsonização por IgG e Complemento", "Ataque por Neutrófilos", "Imunocomplexos"],
        answer: 1
      }
    ],
    explanation: "A Doença Hemolítica do Recém-Nascido é uma hipersensibilidade tipo II, onde anticorpos maternos destroem as hemácias do feto."
  },
  {
    id: "6",
    title: "Dermatite de Contato",
    description: "Paciente apresenta eczema e coceira intensa no pulso após usar um relógio de níquel por 2 dias.",
    symptoms: ["Prurido", "Eritema", "Vesículas"],
    category: "Hipersensibilidade Tipo IV",
    questions: [
      {
        question: "Por que a reação demorou 48h para aparecer?",
        options: ["Produção lenta de anticorpos", "Tempo para ativação e migração de células T", "Liberação lenta de histamina", "Acúmulo de imunocomplexos"],
        answer: 1
      }
    ],
    explanation: "A hipersensibilidade tipo IV é tardia porque depende da proliferação e migração de células T de memória."
  },
  {
    id: "7",
    title: "A Resposta à Vacina",
    description: "Estudante de enfermagem recebe vacina de Hepatite B. Após 1 mês, o exame anti-HBs é positivo.",
    symptoms: ["Nenhum (Imunidade)"],
    category: "Memória Imunológica",
    questions: [
      {
        question: "Qual o objetivo principal da vacinação?",
        options: ["Gerar inflamação aguda", "Gerar células de memória e anticorpos", "Ativar apenas a imunidade inata", "Destruir o fígado"],
        answer: 1
      }
    ],
    explanation: "A vacina induz uma resposta adaptativa artificial ativa, criando clones de memória para proteção futura."
  },
  {
    id: "8",
    title: "Inflamação Aguda",
    description: "Paciente com corte infectado no pé apresenta calor, rubor, tumor e dor no local.",
    symptoms: ["Calor", "Rubor", "Edema", "Dor"],
    category: "Imunidade Inata",
    questions: [
      {
        question: "Qual a primeira célula a chegar no local da infecção?",
        options: ["Linfócito B", "Neutrófilo", "Plasmócito", "Linfócito T"],
        answer: 1
      }
    ],
    explanation: "Neutrófilos são os 'primeiros respondentes' da imunidade inata, atraídos por quimiocinas para o sítio inflamatório."
  },
  {
    id: "9",
    title: "Deficiência de Complemento",
    description: "Criança com infecções recorrentes por bactérias encapsuladas (Neisseria). Exames mostram ausência de C3.",
    symptoms: ["Meningites recorrentes", "Infecções graves"],
    category: "Sistema Complemento",
    questions: [
      {
        question: "Qual a função do MAC (Complexo de Ataque à Membrana)?",
        options: ["Produzir anticorpos", "Furar a membrana do patógeno", "Ativar células T", "Induzir febre"],
        answer: 1
      }
    ],
    explanation: "O MAC (C5b-C9) forma poros na membrana bacteriana, causando lise osmótica do patógeno."
  },
  {
    id: "10",
    title: "Infecção Viral",
    description: "Paciente com gripe apresenta alta produção de proteínas que impedem a replicação viral em células vizinhas.",
    symptoms: ["Febre", "Mialgia", "Coriza"],
    category: "Interferons",
    questions: [
      {
        question: "Qual molécula é responsável pelo estado antiviral?",
        options: ["Interferon Tipo I (Alfa/Beta)", "Histamina", "IgE", "C3b"],
        answer: 0
      }
    ],
    explanation: "Os interferons tipo I são cruciais na defesa antiviral, induzindo resistência em células ainda não infectadas."
  },
  {
    id: "11",
    title: "Artrite Reumatoide",
    description: "Idosa com rigidez matinal e deformidade nas articulações das mãos. Presença de Fator Reumatoide no sangue.",
    symptoms: ["Rigidez matinal", "Deformidade articular"],
    category: "Autoimunidade",
    questions: [
      {
        question: "O Fator Reumatoide é geralmente um anticorpo de qual classe contra a porção Fc da IgG?",
        options: ["IgE", "IgM", "IgD", "IgA"],
        answer: 1
      }
    ],
    explanation: "O Fator Reumatoide é classicamente um anticorpo IgM que se liga à IgG própria, formando imunocomplexos."
  },
  {
    id: "12",
    title: "Febre Reumática",
    description: "Criança apresenta problemas cardíacos após uma faringite por Estreptococos não tratada. Anticorpos contra a bactéria atacam o coração.",
    symptoms: ["Sopro cardíaco", "Poliartrite"],
    category: "Mimetismo Molecular",
    questions: [
      {
        question: "Como se chama quando um antígeno bacteriano é parecido com um do corpo?",
        options: ["Opsonização", "Mimetismo Molecular", "Tolerância Central", "Anergia"],
        answer: 1
      }
    ],
    explanation: "No mimetismo molecular, a resposta imune contra o patógeno cruza com tecidos do hospedeiro por semelhança estrutural."
  },
  {
    id: "13",
    title: "Agamaglobulinemia",
    description: "Menino de 2 anos com ausência total de anticorpos no sangue e linfonodos muito pequenos.",
    symptoms: ["Infecções bacterianas repetitivas", "Ausência de células B"],
    category: "Imunodeficiência Primária",
    questions: [
      {
        question: "Qual o defeito provável?",
        options: ["Maturação de células T", "Maturação de células B", "Função de Neutrófilos", "Produção de C3"],
        answer: 1
      }
    ],
    explanation: "A Agamaglobulinemia de Bruton impede a maturação de pré-células B em células B maduras."
  },
  {
    id: "14",
    title: "Tuberculose",
    description: "Paciente com tosse crônica e sudorese noturna. O teste de Mantoux (PPD) apresenta uma pápula endurecida após 72h.",
    symptoms: ["Tosse", "Febre vespertina", "PPD positivo"],
    category: "Hipersensibilidade Tipo IV",
    questions: [
      {
        question: "O teste de PPD avalia qual tipo de resposta?",
        options: ["Humoral (Anticorpos)", "Celular (T CD4+ Th1)", "Inata (NK)", "Alérgica (IgE)"],
        answer: 1
      }
    ],
    explanation: "O PPD é uma reação de hipersensibilidade tardia que indica memória celular contra o bacilo da TB."
  },
  {
    id: "15",
    title: "Asma Brônquica",
    description: "Jovem apresenta sibilância e falta de ar ao entrar em contato com poeira. Melhora com uso de broncodilatador.",
    symptoms: ["Sibilos", "Tosse seca", "Dispneia"],
    category: "Hipersensibilidade Tipo I",
    questions: [
      {
        question: "Qual citocina estimula a troca de isotipo para IgE na asma?",
        options: ["IL-4", "IFN-gama", "IL-12", "TNF-alfa"],
        answer: 0
      }
    ],
    explanation: "A IL-4 produzida por células Th2 é o principal estímulo para que células B produzam IgE."
  }
];