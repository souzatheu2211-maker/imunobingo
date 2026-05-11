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
  Lightbulb,
  Trophy
} from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import confetti from 'canvas-confetti';
import { cn } from '@/lib/utils';

type CaseResult = 'success' | 'fail';

const Diagnosis = () => {
  const [selectedCase, setSelectedCase] = useState<DiagnosisCase | null>(null);
  const [revealedClues, setRevealedClues] = useState<number>(0);
  const [showQuestion, setShowQuestion] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [results, setResults] = useState<Record<string, CaseResult>>({});

  useEffect(() => {
    const savedResults = localStorage.getItem('imuno_diagnosis_results');
    if (savedResults) setResults(JSON.parse(savedResults));
    
    const savedScore = localStorage.getItem('imuno_diagnosis_score');
    if (savedScore) setScore(parseInt(savedScore));
  }, []);

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

  const saveResult = (id: string, status: CaseResult) => {
    const newResults = { ...results, [id]: status };
    setResults(newResults);
    localStorage.setItem('imuno_diagnosis_results', JSON.stringify(newResults));
  };

  const handleFinalAnswer = (index: number) => {
    if (finished || !selectedCase) return;
    
    setSelectedAnswer(index);
    const isCorrect = index === selectedCase.finalQuestion.answer;
    
    if (isCorrect) {
      const finalScore = 50 + (4 - revealedClues) * 5;
      const newScore = score + finalScore;
      setScore(newScore);
      localStorage.setItem('imuno_diagnosis_score', newScore.toString());
      saveResult(selectedCase.id, 'success');
      showSuccess("Diagnóstico Preciso! Parabéns, Doutor(a).");
      confetti();
    } else {
      saveResult(selectedCase.id, 'fail');
      showError("Diagnóstico Incorreto. Revise as evidências.");
    }
    
    setFinished(true);
  };

  const resetProgress = () => {
    if (confirm("Deseja realmente resetar todo o seu progresso de diagnósticos?")) {
      localStorage.removeItem('imuno_diagnosis_results');
      localStorage.removeItem('imuno_diagnosis_score');
      setResults({});
      setScore(0);
      showSuccess("Progresso resetado!");
    }
  };

  const reset = () => {
    setSelectedCase(null);
    setFinished(false);
  };

  if (!selectedCase) {
    const completedCount = Object.keys(results).length;
    const successCount = Object.values(results).filter(r => r === 'success').length;

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
          <div className="bg-white/5 px-6 py-3 rounded-2xl border border-white/10 backdrop-blur-xl flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Casos Tentados</p>
              <p className="text-xl font-black text-white">{completedCount}/{DIAGNOSIS_CASES.length}</p>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Score Total</p>
              <p className="text-xl font-black text-emerald-400">{score} XP</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DIAGNOSIS_CASES.map((c) => {
            const result = results[c.id];
            return (
              <Card 
                key={c.id} 
                onClick={() => startCase(c)}
                className={cn(
                  "bg-white/5 border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all duration-500 group rounded-[2.5rem] overflow-hidden border-t-white/20 cursor-pointer relative",
                  result === 'success' && "ring-2 ring-emerald-500/50 bg-emerald-500/5",
                  result === 'fail' && "ring-2 ring-red-500/50 bg-red-500/5"
                )}
              >
                {result && (
                  <div className={cn(
                    "absolute top-6 right-6 p-2 rounded-full border z-10",
                    result === 'success' ? "bg-emerald-500/20 border-emerald-500/30" : "bg-red-500/20 border-red-500/30"
                  )}>
                    {result === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-red-500" />}
                  </div>
                )}
                
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-start justify-between">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 border",
                      result === 'success' ? "bg-emerald-600/20 border-emerald-500/20" : 
                      result === 'fail' ? "bg-red-600/20 border-red-500/20" :
                      "bg-white/5 border-white/10"
                    )}>
                      <Stethoscope className={cn(
                        "w-7 h-7",
                        result === 'success' ? "text-emerald-400" : 
                        result === 'fail' ? "text-red-400" : 
                        "text-slate-500"
                      )} />
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">Categoria</span>
                      <Badge variant="outline" className="border-white/10 text-slate-400 text-[7px] font-bold uppercase">
                        {c.category}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className={cn(
                      "text-2xl font-black tracking-tight leading-tight transition-colors",
                      result === 'success' ? "text-emerald-400" : 
                      result === 'fail' ? "text-red-400" : 
                      "text-white group-hover:text-emerald-400"
                    )}>
                      {c.title}
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 font-medium">
                      {c.initialPresentation}
                    </p>
                  </div>

                  <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-white transition-colors pt-2">
                    {result ? "Revisar Investigação" : "Iniciar Investigação"} <ChevronRight className="ml-1 w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {completedCount === DIAGNOSIS_CASES.length && (
          <div className="bg-white/5 border border-white/10 p-12 rounded-[3rem] text-center space-y-6 animate-in zoom-in duration-1000">
            <Trophy className="w-20 h-20 text-yellow-500 mx-auto animate-bounce" />
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-white">Ciclo de Estudos Concluído!</h2>
              <p className="text-slate-400 max-w-md mx-auto">Você analisou todos os casos da unidade. Sua taxa de acerto foi de {Math.round((successCount / completedCount) * 100)}%.</p>
            </div>
            <Button 
              variant="outline" 
              className="border-white/10 text-slate-400 hover:bg-white/5"
              onClick={resetProgress}
            >
              <RotateCcw className="mr-2 w-4 h-4" /> RESETAR PROGRESSO
            </Button>
          </div>
        )}
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