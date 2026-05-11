import React, { useState } from 'react';
import { DIAGNOSIS_CASES, DiagnosisCase } from '@/data/diagnosisCases';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Microscope, ChevronRight, CheckCircle2, XCircle, Sparkles, RotateCcw, BookOpen } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import confetti from 'canvas-confetti';
import { cn } from '@/lib/utils';

const Diagnosis = () => {
  const [selectedCase, setSelectedCase] = useState<DiagnosisCase | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState<number[]>([]);

  const startCase = (c: DiagnosisCase) => {
    setSelectedCase(c);
    setCurrentStep(0);
    setScore(0);
    setFinished(false);
    setAnswers([]);
  };

  const handleAnswer = (index: number) => {
    const isCorrect = index === selectedCase?.questions[currentStep].answer;
    const newAnswers = [...answers, index];
    setAnswers(newAnswers);

    if (isCorrect) {
      setScore(prev => prev + 10);
      showSuccess("Raciocínio correto!");
    } else {
      setScore(prev => Math.max(0, prev - 5));
      showError("Diagnóstico incorreto.");
    }

    if (currentStep + 1 < (selectedCase?.questions.length || 0)) {
      setCurrentStep(prev => prev + 1);
    } else {
      setFinished(true);
      if (score + (isCorrect ? 10 : 0) === (selectedCase?.questions.length || 0) * 10) {
        confetti();
        setScore(prev => prev + 50); // Bônus de perfeição
      }
    }
  };

  const reset = () => {
    setSelectedCase(null);
    setFinished(false);
  };

  if (!selectedCase) {
    return (
      <div className="space-y-10 animate-in fade-in duration-700">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
              <Microscope className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">Unidade de Diagnóstico</span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter">Missão Diagnóstico</h1>
            <p className="text-slate-400 font-medium">Analise os sintomas e identifique a patologia imunológica.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DIAGNOSIS_CASES.map((c) => (
            <Card 
              key={c.id} 
              onClick={() => startCase(c)}
              className="bg-white/5 border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all duration-500 group rounded-[2rem] overflow-hidden border-t-white/20 cursor-pointer"
            >
              <CardContent className="p-8 space-y-6">
                <div className="flex items-start justify-between">
                  <div className="bg-emerald-600/20 w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 border border-emerald-500/20">
                    <Microscope className="text-emerald-400 w-7 h-7" />
                  </div>
                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-[8px] font-black uppercase">
                    {c.category}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-white text-xl font-black tracking-tight leading-tight group-hover:text-emerald-400 transition-colors">
                    {c.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 font-medium">
                    {c.description}
                  </p>
                </div>

                <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-white transition-colors">
                  Iniciar Caso <ChevronRight className="ml-1 w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in zoom-in duration-500">
      <div className="flex items-center justify-between">
        <Button onClick={reset} variant="ghost" className="text-slate-500 hover:text-white">
          <ChevronRight className="rotate-180 mr-2 w-4 h-4" /> VOLTAR AO ACERVO
        </Button>
        <div className="flex items-center gap-3">
          <Badge className="bg-emerald-600 text-white font-black px-4 py-1 rounded-full">
            SCORE: {score} XP
          </Badge>
        </div>
      </div>

      {!finished ? (
        <div className="space-y-6">
          <Card className="bg-white/5 border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <div className="h-2 w-full bg-emerald-500" />
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-3xl font-black text-white tracking-tight">{selectedCase.title}</CardTitle>
              <p className="text-slate-400 text-lg leading-relaxed mt-4 font-medium">{selectedCase.description}</p>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <div className="flex flex-wrap gap-2 mt-4">
                {selectedCase.symptoms.map((s, i) => (
                  <Badge key={i} variant="secondary" className="bg-white/5 text-slate-300 border-white/10 px-3 py-1">
                    • {s}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center gap-2 ml-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Pergunta {currentStep + 1} de {selectedCase.questions.length}</span>
            </div>
            <Card className="bg-slate-900/80 border-white/10 rounded-[2rem] p-8">
              <h3 className="text-xl font-black text-white mb-8">{selectedCase.questions[currentStep].question}</h3>
              <div className="grid grid-cols-1 gap-3">
                {selectedCase.questions[currentStep].options.map((opt, i) => (
                  <Button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    className="h-16 bg-white/5 hover:bg-emerald-600 border border-white/10 hover:border-emerald-400 text-white font-bold text-left justify-start px-6 rounded-2xl transition-all"
                  >
                    <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mr-4 text-xs">{String.fromCharCode(65 + i)}</span>
                    {opt}
                  </Button>
                ))}
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <Card className="bg-white/5 border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in duration-1000">
          <div className="h-2 w-full bg-emerald-500" />
          <CardContent className="p-12 text-center space-y-8">
            <div className="w-24 h-24 bg-emerald-600/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-white tracking-tighter">MISSÃO CONCLUÍDA</h2>
              <p className="text-emerald-400 font-black uppercase tracking-[0.3em]">Diagnóstico Finalizado com Sucesso</p>
            </div>

            <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 text-left space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-widest">
                <BookOpen className="w-4 h-4" /> Explicação Científica
              </div>
              <p className="text-slate-300 leading-relaxed font-medium italic">
                "{selectedCase.explanation}"
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Button onClick={reset} className="h-14 bg-emerald-600 hover:bg-emerald-500 text-white font-black px-10 rounded-2xl shadow-xl shadow-emerald-900/20">
                PRÓXIMO CASO <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
              <Button onClick={() => startCase(selectedCase)} variant="outline" className="h-14 border-white/10 hover:bg-white/5 text-white font-black px-10 rounded-2xl">
                <RotateCcw className="mr-2 w-5 h-5" /> REVISAR CASO
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Diagnosis;