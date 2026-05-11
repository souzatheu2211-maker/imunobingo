import React, { useState, useEffect } from 'react';
import { DIAGNOSIS_CASES, DiagnosisCase } from '@/data/diagnosisCases';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Microscope, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  RotateCcw, 
  BookOpen,
  Search,
  AlertCircle,
  Stethoscope,
  FileText,
  Lightbulb
} from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import confetti from 'canvas-confetti';
import { cn } from '@/lib/utils';

const Diagnosis = () => {
  const [selectedCase, setSelectedCase] = useState<DiagnosisCase | null>(null);
  const [revealedClues, setRevealedClues] = useState<number>(0);
  const [showQuestion, setShowQuestion] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const startCase = (c: DiagnosisCase) => {
    setSelectedCase(c);
    setRevealedClues(0);
    setShowQuestion(false);
    setFinished(false);
    setSelectedAnswer(null);
  };

  const revealNextClue = () => {
    if (selectedCase && revealedClues < selectedCase.clues.length) {
      setRevealedClues(prev => prev + 1);
      if (revealedClues + 1 === selectedCase.clues.length) {
        showSuccess("Todas as evidências coletadas!");
      }
    }
  };

  const handleFinalAnswer = (index: number) => {
    if (finished || !selectedCase) return;
    
    setSelectedAnswer(index);
    const isCorrect = index === selectedCase.finalQuestion.answer;
    
    if (isCorrect) {
      // Bônus por usar menos pistas (opcional, aqui daremos 50 fixo + bônus de precisão)
      const finalScore = 50 + (4 - revealedClues) * 5;
      setScore(prev => prev + finalScore);
      showSuccess("Diagnóstico Preciso! Parabéns, Doutor(a).");
      confetti();
    } else {
      showError("Diagnóstico Incorreto. Revise as evidências.");
    }
    
    setFinished(true);
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
              <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">Unidade de Investigação</span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter">Missão Diagnóstico</h1>
            <p className="text-slate-400 font-medium">Analise as pistas clínicas e identifique a patologia.</p>
          </div>
          <div className="bg-white/5 px-6 py-3 rounded-2xl border border-white/10 backdrop-blur-xl">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Score Total</p>
            <p className="text-2xl font-black text-emerald-400">{score} XP</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DIAGNOSIS_CASES.map((c) => (
            <Card 
              key={c.id} 
              onClick={() => startCase(c)}
              className="bg-white/5 border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all duration-500 group rounded-[2.5rem] overflow-hidden border-t-white/20 cursor-pointer"
            >
              <CardContent className="p-8 space-y-6">
                <div className="flex items-start justify-between">
                  <div className="bg-emerald-600/20 w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 border border-emerald-500/20">
                    <Stethoscope className="text-emerald-400 w-7 h-7" />
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
                    {c.initialPresentation}
                  </p>
                </div>

                <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-white transition-colors">
                  Iniciar Investigação <ChevronRight className="ml-1 w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const progress = (revealedClues / selectedCase.clues.length) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in zoom-in duration-500 pb-20">
      <div className="flex items-center justify-between">
        <Button onClick={reset} variant="ghost" className="text-slate-500 hover:text-white">
          <ChevronRight className="rotate-180 mr-2 w-4 h-4" /> ABANDONAR CASO
        </Button>
        <Badge className="bg-emerald-600 text-white font-black px-4 py-1 rounded-full">
          CASO: {selectedCase.title.toUpperCase()}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Coluna da Esquerda: Prontuário e Pistas */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="bg-white/5 border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-xl">
            <div className="h-2 w-full bg-emerald-500" />
            <CardHeader className="p-8 pb-4">
              <div className="flex items-center gap-2 text-emerald-400 mb-2">
                <FileText className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Apresentação Inicial</span>
              </div>
              <p className="text-white text-xl leading-relaxed font-bold">{selectedCase.initialPresentation}</p>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Evidências Clínicas</h3>
                  <span className="text-[10px] font-black text-emerald-500">{revealedClues}/{selectedCase.clues.length}</span>
                </div>
                <Progress value={progress} className="h-2 bg-white/5" />
                
                <div className="space-y-3">
                  {selectedCase.clues.map((clue, i) => (
                    <div 
                      key={i}
                      className={cn(
                        "p-4 rounded-2xl border transition-all duration-500 flex items-start gap-3",
                        i < revealedClues 
                          ? "bg-white/5 border-white/10 text-slate-200 animate-in slide-in-from-left" 
                          : "bg-transparent border-dashed border-white/5 text-transparent select-none"
                      )}
                    >
                      <Search className={cn("w-4 h-4 mt-0.5 shrink-0", i < revealedClues ? "text-emerald-400" : "text-slate-800")} />
                      <p className="text-sm font-medium leading-relaxed">{clue}</p>
                    </div>
                  ))}
                </div>

                {!finished && revealedClues < selectedCase.clues.length && (
                  <Button 
                    onClick={revealNextClue}
                    className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-900/20"
                  >
                    <Search className="mr-2 h-5 w-5" /> REVELAR PRÓXIMA PISTA
                  </Button>
                )}

                {!finished && revealedClues === selectedCase.clues.length && !showQuestion && (
                  <Button 
                    onClick={() => setShowQuestion(true)}
                    className="w-full h-16 bg-violet-600 hover:bg-violet-500 text-white font-black rounded-2xl shadow-xl shadow-violet-900/20 animate-bounce"
                  >
                    <Lightbulb className="mr-2 h-6 w-6" /> DAR DIAGNÓSTICO FINAL
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna da Direita: Pergunta Final ou Resultado */}
        <div className="lg:col-span-5">
          {showQuestion && !finished ? (
            <Card className="bg-slate-900/80 border-white/10 rounded-[2.5rem] p-8 sticky top-8 animate-in slide-in-from-right duration-500">
              <div className="flex items-center gap-2 text-violet-400 mb-6">
                <AlertCircle className="w-5 h-5" />
                <span className="text-xs font-black uppercase tracking-widest">Veredito Médico</span>
              </div>
              <h3 className="text-xl font-black text-white mb-8 leading-tight">
                {selectedCase.finalQuestion.question}
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {selectedCase.finalQuestion.options.map((opt, i) => (
                  <Button
                    key={i}
                    onClick={() => handleFinalAnswer(i)}
                    className="h-16 bg-white/5 hover:bg-violet-600 border border-white/10 hover:border-violet-400 text-white font-bold text-left justify-start px-6 rounded-2xl transition-all"
                  >
                    <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mr-4 text-xs">{String.fromCharCode(65 + i)}</span>
                    {opt}
                  </Button>
                ))}
              </div>
            </Card>
          ) : finished ? (
            <Card className="bg-white/5 border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in duration-500 sticky top-8">
              <div className={cn("h-2 w-full", selectedAnswer === selectedCase.finalQuestion.answer ? "bg-emerald-500" : "bg-red-500")} />
              <CardContent className="p-8 text-center space-y-6">
                <div className={cn(
                  "w-20 h-20 rounded-full flex items-center justify-center mx-auto",
                  selectedAnswer === selectedCase.finalQuestion.answer ? "bg-emerald-600/20" : "bg-red-600/20"
                )}>
                  {selectedAnswer === selectedCase.finalQuestion.answer 
                    ? <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    : <XCircle className="w-10 h-10 text-red-500" />
                  }
                </div>
                
                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    {selectedAnswer === selectedCase.finalQuestion.answer ? "EXCELENTE TRABALHO!" : "DIAGNÓSTICO ERRADO"}
                  </h2>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                    {selectedAnswer === selectedCase.finalQuestion.answer ? "Você salvou o paciente" : "O paciente precisa de revisão"}
                  </p>
                </div>

                <div className="bg-white/5 p-6 rounded-2xl border border-white/10 text-left space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-black text-[10px] uppercase tracking-widest">
                    <BookOpen className="w-4 h-4" /> Discussão do Caso
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed font-medium italic">
                    "{selectedCase.explanation}"
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <Button onClick={reset} className="h-14 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl">
                    PRÓXIMO CASO <ChevronRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Button onClick={() => startCase(selectedCase)} variant="ghost" className="text-slate-500 hover:text-white">
                    <RotateCcw className="mr-2 w-4 h-4" /> REVISAR ESTE CASO
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center space-y-4 opacity-20">
              <Search className="w-16 h-16 text-slate-500" />
              <p className="text-sm font-black uppercase tracking-widest text-slate-500">Colete as pistas para liberar o diagnóstico</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Diagnosis;