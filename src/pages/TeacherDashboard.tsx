import React, { useEffect, useState } from 'react';
import { Plus, BookOpen, Clock, Users, FileText, Play, CheckCircle, ArrowRight, Trash2, Save } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { Card, Button, Input, Badge, Modal } from '../components/ui';
import { useStore } from '../store/useStore';
import { Exam, Result, Question, Subject } from '../types';

export default function TeacherDashboard() {
  const { 
    user, 
    fetchTeacherExams, 
    addExam, 
    addQuestion, 
    fetchTeacherResults, 
    fetchSubjects, 
    addSubject,
    deleteExam,
    deleteQuestion,
    fetchExamQuestions
  } = useStore();
  const [exams, setExams] = useState<Exam[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'create' | 'results'>('overview');
  const [loading, setLoading] = useState(true);

  // Delete Exam State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [examToDelete, setExamToDelete] = useState<Exam | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Manage Questions State
  const [isQuestionsModalOpen, setIsQuestionsModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [newExam, setNewExam] = useState({
    title: '',
    duration: 30,
    total_marks: 100,
  });
  const [subjectName, setSubjectName] = useState('');
  const [questions, setQuestions] = useState<{
    question_text: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_answer: 'A' | 'B' | 'C' | 'D';
    marks: number;
  }[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      setLoading(true);
      const [teacherExams, teacherResults, allSubjects] = await Promise.all([
        fetchTeacherExams(user.id),
        fetchTeacherResults(user.id),
        fetchSubjects()
      ]);
      setExams(teacherExams);
      setResults(teacherResults);
      setSubjects(allSubjects);
      setLoading(false);
    };
    loadData();
  }, [user, fetchTeacherExams, fetchTeacherResults, fetchSubjects]);

  const handleCreateExam = async () => {
    if (!user || !newExam.title || !subjectName) return;

    let finalSubjectId = 0;
    
    // Check if subject exists
    const existingSubject = subjects.find(s => s.subject_name.toLowerCase() === subjectName.toLowerCase());
    
    if (existingSubject) {
      finalSubjectId = existingSubject.subject_id;
    } else {
      // Create new subject
      const createdSubject = await addSubject(subjectName);
      if (createdSubject) {
        finalSubjectId = createdSubject.subject_id;
        // Refresh subjects list
        const updatedSubjects = await fetchSubjects();
        setSubjects(updatedSubjects);
      } else {
        alert('Failed to create new subject. Please try again.');
        return;
      }
    }

    const examData = {
      ...newExam,
      subject_id: finalSubjectId,
      created_by: user.id,
      created_at: new Date().toISOString(),
    };

    const createdExam = await addExam(examData);
    if (createdExam) {
      // Add questions
      for (const q of questions) {
        await addQuestion({ ...q, exam_id: createdExam.exam_id });
      }
      
      // Reset and refresh
      setNewExam({ title: '', duration: 30, total_marks: 100 });
      setSubjectName('');
      setQuestions([]);
      setActiveTab('overview');
      const updatedExams = await fetchTeacherExams(user.id);
      setExams(updatedExams);
    }
  };

  const handleDeleteExam = async () => {
    if (!user || !examToDelete) return;
    
    setIsDeleting(true);
    const { success, error } = await deleteExam(examToDelete.exam_id, user.id);
    
    if (success) {
      setExams(exams.filter(e => e.exam_id !== examToDelete.exam_id));
      setIsDeleteModalOpen(false);
      setExamToDelete(null);
      alert('Exam deleted successfully');
    } else {
      alert(error || 'Failed to delete exam');
    }
    setIsDeleting(false);
  };

  const handleManageQuestions = async (exam: Exam) => {
    setSelectedExam(exam);
    setLoadingQuestions(true);
    setIsQuestionsModalOpen(true);
    const questions = await fetchExamQuestions(exam.exam_id);
    setExamQuestions(questions);
    setLoadingQuestions(false);
  };

  const handleDeleteQuestion = async (questionId: number) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    
    const { success, error } = await deleteQuestion(questionId);
    if (success) {
      setExamQuestions(examQuestions.filter(q => q.question_id !== questionId));
      alert('Question deleted successfully');
    } else {
      alert(error || 'Failed to delete question');
    }
  };

  const addQuestionField = () => {
    setQuestions([...questions, {
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_answer: 'A',
      marks: 1
    }]);
  };

  if (!user) return null;

  return (
    <DashboardLayout title="Teacher Dashboard">
      <div className="space-y-8">
        {/* Navigation Tabs */}
        <div className="flex gap-2 md:gap-4 border-b border-white/5 pb-4 overflow-x-auto no-scrollbar scroll-smooth">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'overview' ? 'bg-accent-blue text-white' : 'text-text-secondary hover:bg-white/5'}`}
          >
            Exam Monitor
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'create' ? 'bg-accent-blue text-white' : 'text-text-secondary hover:bg-white/5'}`}
          >
            Create Exam
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'results' ? 'bg-accent-blue text-white' : 'text-text-secondary hover:bg-white/5'}`}
          >
            Results Viewer
          </button>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6 md:space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <Card className="p-4 md:p-6">
                <p className="text-[10px] md:text-xs font-bold text-text-secondary uppercase tracking-widest mb-1 md:mb-2">Total Exams</p>
                <p className="text-2xl md:text-3xl font-bold">{exams.length}</p>
              </Card>
              <Card className="p-4 md:p-6">
                <p className="text-[10px] md:text-xs font-bold text-text-secondary uppercase tracking-widest mb-1 md:mb-2">Total Submissions</p>
                <p className="text-2xl md:text-3xl font-bold">{results.length}</p>
              </Card>
              <Card className="p-4 md:p-6 sm:col-span-2 lg:col-span-1">
                <p className="text-[10px] md:text-xs font-bold text-text-secondary uppercase tracking-widest mb-1 md:mb-2">Active Exams</p>
                <p className="text-2xl md:text-3xl font-bold text-accent-emerald">{exams.length}</p>
              </Card>
            </div>

            <section>
              <h4 className="text-lg md:text-xl font-bold mb-4 md:mb-6 flex items-center gap-2">
                <Play className="w-5 h-5 text-accent-blue" />
                Exam Monitor
              </h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {exams.map((exam) => (
                  <Card key={exam.exam_id} className="p-6 relative group">
                    <button 
                      onClick={() => {
                        setExamToDelete(exam);
                        setIsDeleteModalOpen(true);
                      }}
                      className="absolute top-4 right-4 p-2 text-text-secondary hover:text-accent-red transition-colors"
                      title="Delete Exam"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h5 className="text-lg font-bold">{exam.title}</h5>
                        <p className="text-text-secondary text-sm">{exam.subject_name}</p>
                      </div>
                      <Badge variant="success">ACTIVE</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-2 bg-white/5 rounded-lg">
                        <p className="text-[10px] text-text-secondary uppercase font-bold">Duration</p>
                        <p className="text-sm font-bold">{exam.duration}m</p>
                      </div>
                      <div className="text-center p-2 bg-white/5 rounded-lg">
                        <p className="text-[10px] text-text-secondary uppercase font-bold">Marks</p>
                        <p className="text-sm font-bold">{exam.total_marks}</p>
                      </div>
                      <div className="text-center p-2 bg-white/5 rounded-lg">
                        <p className="text-[10px] text-text-secondary uppercase font-bold">Attempts</p>
                        <p className="text-sm font-bold">{results.filter(r => r.exam_id === exam.exam_id).length}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button variant="secondary" className="flex-1" onClick={() => handleManageQuestions(exam)}>
                        Questions
                      </Button>
                      <Button variant="secondary" className="flex-1" onClick={() => setActiveTab('results')}>
                        Submissions
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <Modal 
          isOpen={isDeleteModalOpen} 
          onClose={() => setIsDeleteModalOpen(false)}
          title="Delete Exam"
        >
          <div className="space-y-6">
            <p className="text-text-secondary">
              Are you sure you want to delete this exam? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <Button variant="secondary" className="flex-1" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" className="flex-1" onClick={handleDeleteExam} isLoading={isDeleting}>
                Delete
              </Button>
            </div>
          </div>
        </Modal>

        {/* Manage Questions Modal */}
        <Modal
          isOpen={isQuestionsModalOpen}
          onClose={() => setIsQuestionsModalOpen(false)}
          title={`Questions: ${selectedExam?.title}`}
        >
          <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 no-scrollbar">
            {loadingQuestions ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-accent-blue/30 border-t-accent-blue rounded-full animate-spin" />
              </div>
            ) : examQuestions.length > 0 ? (
              examQuestions.map((q, idx) => (
                <Card key={q.question_id} className="p-4 border-white/5 bg-white/5 space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-accent-blue">Question {idx + 1}</span>
                    <button 
                      onClick={() => handleDeleteQuestion(q.question_id)}
                      className="p-1 text-text-secondary hover:text-accent-red transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-sm font-medium">{q.question_text}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {['A', 'B', 'C', 'D'].map(opt => (
                      <div key={opt} className={`text-[10px] p-1.5 rounded border ${q.correct_answer === opt ? 'bg-accent-emerald/10 border-accent-emerald/30 text-accent-emerald' : 'bg-white/5 border-white/10 text-text-secondary'}`}>
                        <span className="font-bold mr-1">{opt}:</span>
                        {(q as any)[`option_${opt.toLowerCase()}`]}
                      </div>
                    ))}
                  </div>
                </Card>
              ))
            ) : (
              <p className="text-center text-text-secondary py-8 italic">No questions found for this exam.</p>
            )}
          </div>
          <div className="mt-6 pt-6 border-t border-white/5">
            <Button variant="secondary" className="w-full" onClick={() => setIsQuestionsModalOpen(false)}>
              Close
            </Button>
          </div>
        </Modal>

        {activeTab === 'create' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="lg:col-span-2 space-y-6 md:space-y-8">
              <Card className="p-4 md:p-8">
                <h4 className="text-lg md:text-xl font-bold mb-6 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-accent-blue" />
                  Create Exam Panel
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-8">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-secondary uppercase">Exam Title</label>
                    <Input
                      placeholder="e.g. Final Term Mathematics"
                      value={newExam.title}
                      onChange={(e) => setNewExam({ ...newExam, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-secondary uppercase">Subject</label>
                    <div className="relative">
                      <Input
                        placeholder="Type or select subject..."
                        value={subjectName}
                        onChange={(e) => setSubjectName(e.target.value)}
                        list="subjects-list"
                      />
                      <datalist id="subjects-list">
                        {subjects.map(s => (
                          <option key={s.subject_id} value={s.subject_name} />
                        ))}
                      </datalist>
                      <p className="text-[10px] text-text-secondary mt-1">
                        If the subject doesn't exist, it will be created automatically.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-secondary uppercase">Duration (Minutes)</label>
                    <Input
                      type="number"
                      value={newExam.duration}
                      onChange={(e) => setNewExam({ ...newExam, duration: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-secondary uppercase">Total Marks</label>
                    <Input
                      type="number"
                      value={newExam.total_marks}
                      onChange={(e) => setNewExam({ ...newExam, total_marks: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h5 className="font-bold flex items-center gap-2">
                      <FileText className="w-4 h-4 text-accent-blue" />
                      Question Manager
                    </h5>
                    <Button variant="secondary" onClick={addQuestionField}>
                      <Plus className="w-3 h-3 mr-1" /> Add Question
                    </Button>
                  </div>

                  {questions.map((q, idx) => (
                    <Card key={idx} className="p-6 border-white/5 bg-white/5 space-y-4">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-accent-blue">Question {idx + 1}</span>
                        <button onClick={() => setQuestions(questions.filter((_, i) => i !== idx))}>
                          <Trash2 className="w-4 h-4 text-accent-red hover:opacity-80" />
                        </button>
                      </div>
                      <Input
                        placeholder="Enter question text..."
                        value={q.question_text}
                        onChange={(e) => {
                          const newQs = [...questions];
                          newQs[idx].question_text = e.target.value;
                          setQuestions(newQs);
                        }}
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {(['A', 'B', 'C', 'D'] as const).map((optKey) => (
                          <div key={optKey} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`correct-${idx}`}
                              checked={q.correct_answer === optKey}
                              onChange={() => {
                                const newQs = [...questions];
                                newQs[idx].correct_answer = optKey;
                                setQuestions(newQs);
                              }}
                            />
                            <Input
                              placeholder={`Option ${optKey}`}
                              value={q[`option_${optKey.toLowerCase()}` as keyof typeof q] as string}
                              onChange={(e) => {
                                const newQs = [...questions];
                                (newQs[idx] as any)[`option_${optKey.toLowerCase()}`] = e.target.value;
                                setQuestions(newQs);
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>

                <div className="mt-8 pt-8 border-t border-white/5">
                  <Button className="w-full" onClick={handleCreateExam}>
                    <Save className="w-4 h-4 mr-2" />
                    Publish Examination
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'results' && (
          <section>
            <h4 className="text-lg md:text-xl font-bold mb-4 md:mb-6 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-accent-emerald" />
              Results Viewer
            </h4>
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10">
                      <th className="px-4 md:px-6 py-3 md:py-4 text-[10px] md:text-xs font-bold text-text-secondary uppercase">Student ID</th>
                      <th className="px-4 md:px-6 py-3 md:py-4 text-[10px] md:text-xs font-bold text-text-secondary uppercase">Exam Title</th>
                      <th className="px-4 md:px-6 py-3 md:py-4 text-[10px] md:text-xs font-bold text-text-secondary uppercase">Score</th>
                      <th className="px-4 md:px-6 py-3 md:py-4 text-[10px] md:text-xs font-bold text-text-secondary uppercase">Submitted At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {results.map((result) => (
                      <tr key={result.result_id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-medium">{result.student_id}</td>
                        <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-text-secondary">{result.exam_title}</td>
                        <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm font-bold text-accent-emerald">{result.score}</td>
                        <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-text-secondary">
                          {new Date(result.submitted_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {results.length === 0 && (
                <div className="p-12 text-center">
                  <p className="text-text-secondary italic">No results found.</p>
                </div>
              )}
            </Card>
          </section>
        )}
      </div>
    </DashboardLayout>
  );
}
