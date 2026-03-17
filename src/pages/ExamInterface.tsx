import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Shield, AlertTriangle, CheckCircle, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { Card, Button, Badge } from '../components/ui';
import { useStore } from '../store/useStore';
import { Exam, Question } from '../types';

export default function ExamInterface() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { user, fetchAvailableExams, fetchExamQuestions, submitResult } = useStore();
  
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, 'A' | 'B' | 'C' | 'D'>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    const loadExam = async () => {
      if (!examId) return;
      setLoading(true);
      const exams = await fetchAvailableExams();
      const foundExam = exams.find(e => e.exam_id === parseInt(examId));
      if (foundExam) {
        setExam(foundExam);
        setTimeLeft(foundExam.duration * 60);
        const qs = await fetchExamQuestions(parseInt(examId));
        setQuestions(qs);
      }
      setLoading(false);
    };
    loadExam();
  }, [examId, fetchAvailableExams, fetchExamQuestions]);

  useEffect(() => {
    if (timeLeft > 0 && !isSubmitted && !loading) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !isSubmitted && !loading && exam) {
      handleSubmit();
    }
  }, [timeLeft, isSubmitted, loading, exam]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (questionId: number, option: 'A' | 'B' | 'C' | 'D') => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = async () => {
    if (!user || !exam || isSubmitted) return;

    // Calculate score
    let score = 0;
    questions.forEach(q => {
      if (answers[q.question_id] === q.correct_answer) {
        score += q.marks;
      }
    });

    const resultData = {
      student_id: user.id,
      exam_id: exam.exam_id,
      score,
      total_marks: exam.total_marks,
      submitted_at: new Date().toISOString(),
    };

    const success = await submitResult(resultData);
    if (success) {
      setIsSubmitted(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-bg flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-accent-blue animate-spin" />
      </div>
    );
  }

  if (!exam || questions.length === 0) {
    return (
      <div className="min-h-screen bg-primary-bg flex items-center justify-center p-6">
        <Card className="max-w-md w-full p-10 text-center">
          <AlertTriangle className="w-12 h-12 text-accent-amber mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Exam Not Found</h2>
          <p className="text-text-secondary mb-6">This exam may have been removed or is not yet available.</p>
          <Button className="w-full" onClick={() => navigate('/dashboard/student')}>
            Return to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-primary-bg flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="max-w-md w-full p-10 text-center">
            <div className="w-20 h-20 bg-accent-emerald/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-accent-emerald" />
            </div>
            <h2 className="text-3xl font-bold mb-2">Exam Submitted</h2>
            <p className="text-text-secondary mb-8">Your responses have been recorded successfully. You can view your score in the dashboard.</p>
            <Button className="w-full" onClick={() => navigate('/dashboard/student')}>
              Return to Dashboard
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  const q = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-primary-bg flex flex-col">
      {/* Exam Header */}
      <header className="h-auto min-h-[80px] border-b border-white/5 bg-secondary-bg/50 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between px-4 md:px-8 py-4 sm:py-0 sticky top-0 z-20 gap-4">
        <div className="flex items-center gap-3 md:gap-4 w-full sm:w-auto">
          <div className="p-2 bg-accent-blue/10 rounded-lg shrink-0">
            <Shield className="w-5 h-5 text-accent-blue" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-sm md:text-base truncate">{exam.title}</h3>
            <p className="text-[9px] md:text-[10px] text-text-secondary uppercase tracking-widest truncate">{exam.subject_name} • Proctored Session</p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-4 md:gap-8 w-full sm:w-auto">
          <div className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-1.5 md:py-2 bg-white/5 rounded-xl border border-white/10">
            <Clock className={`w-4 h-4 md:w-5 md:h-5 ${timeLeft < 300 ? 'text-accent-red animate-pulse' : 'text-text-secondary'}`} />
            <span className={`font-mono text-lg md:text-xl font-bold ${timeLeft < 300 ? 'text-accent-red' : 'text-text-primary'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
          <Button variant="danger" size="sm" className="md:px-6" onClick={handleSubmit}>Finish</Button>
        </div>
      </header>

      {/* Exam Content */}
      <div className="flex-grow flex flex-col items-center p-4 md:p-8">
        <div className="w-full max-w-4xl space-y-6 md:space-y-8">
          {/* Question Navigator */}
          <div className="flex flex-wrap gap-2 justify-center max-h-[120px] overflow-y-auto p-2 no-scrollbar">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentQuestion(i)}
                className={`w-8 h-8 md:w-10 md:h-10 rounded-lg font-bold text-xs md:text-sm transition-all border shrink-0 ${currentQuestion === i ? 'bg-accent-blue border-accent-blue text-white shadow-lg shadow-accent-blue/20' : answers[questions[i].question_id] !== undefined ? 'bg-accent-emerald/20 border-accent-emerald/30 text-accent-emerald' : 'bg-white/5 border-white/10 text-text-secondary hover:bg-white/10'}`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {/* Question Card */}
          <Card className="p-6 md:p-10">
            <div className="flex justify-between items-start mb-6 md:mb-8">
              <Badge variant="info">Question {currentQuestion + 1} of {questions.length}</Badge>
              <span className="text-xs md:text-sm text-text-secondary font-medium">{q.marks} Marks</span>
            </div>

            <h4 className="text-lg md:text-2xl font-semibold mb-6 md:mb-10 leading-relaxed">
              {q.question_text}
            </h4>

            <div className="grid grid-cols-1 gap-3 md:gap-4">
              {(['A', 'B', 'C', 'D'] as const).map((optKey) => (
                <button
                  key={optKey}
                  onClick={() => handleAnswer(q.question_id, optKey)}
                  className={`w-full p-4 md:p-5 rounded-xl md:rounded-2xl border transition-all flex items-center gap-3 md:gap-4 group ${answers[q.question_id] === optKey ? 'bg-accent-blue/10 border-accent-blue text-text-primary' : 'bg-white/5 border-white/10 text-left hover:bg-white/10 hover:border-accent-blue/50'}`}
                >
                  <div className={`w-7 h-7 md:w-8 md:h-8 rounded-lg border flex items-center justify-center font-bold text-xs md:text-sm transition-all shrink-0 ${answers[q.question_id] === optKey ? 'bg-accent-blue border-accent-blue text-white' : 'bg-white/5 border-white/10 group-hover:bg-accent-blue group-hover:border-accent-blue'}`}>
                    {optKey}
                  </div>
                  <span className="font-medium text-sm md:text-base">{q[`option_${optKey.toLowerCase()}` as keyof Question]}</span>
                </button>
              ))}
            </div>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <Button variant="secondary" className="w-full sm:w-auto order-2 sm:order-1" disabled={currentQuestion === 0} onClick={() => setCurrentQuestion(prev => prev - 1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            <div className="flex items-center gap-2 text-accent-amber text-[10px] md:text-xs font-bold uppercase tracking-widest order-1 sm:order-2">
              <AlertTriangle className="w-4 h-4" />
              Auto-save active
            </div>
            <Button className="w-full sm:w-auto order-3" disabled={currentQuestion === questions.length - 1} onClick={() => setCurrentQuestion(prev => prev + 1)}>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
