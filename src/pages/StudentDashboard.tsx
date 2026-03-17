import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, CheckCircle, ArrowRight, User as UserIcon, Mail, Hash } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { Card, Button } from '../components/ui';
import { useStore } from '../store/useStore';
import { Exam, Result } from '../types';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user, fetchAvailableExams, fetchStudentResults } = useStore();
  const [availableExams, setAvailableExams] = useState<Exam[]>([]);
  const [completedExams, setCompletedExams] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      setLoading(true);
      const [exams, results] = await Promise.all([
        fetchAvailableExams(),
        fetchStudentResults(user.id)
      ]);
      setAvailableExams(exams);
      setCompletedExams(results);
      setLoading(false);
    };
    loadData();
  }, [user, fetchAvailableExams, fetchStudentResults]);

  if (!user) return null;

  return (
    <DashboardLayout title="Student Dashboard">
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-accent-blue/20 to-transparent p-6 md:p-8 rounded-2xl border border-white/5">
          <h3 className="text-2xl md:text-3xl font-bold mb-2">Welcome, {user.name}</h3>
          <p className="text-sm md:text-base text-text-secondary">Explore your available exams and track your academic progress.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            {/* Available Exams Section */}
            <section>
              <h4 className="text-lg md:text-xl font-bold mb-4 md:mb-6 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-accent-blue" />
                Available Exams
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                {availableExams.length > 0 ? (
                  availableExams.map((exam) => (
                    <Card key={exam.exam_id} className="p-6 hover:border-accent-blue/30 transition-colors">
                      <div className="mb-4">
                        <h5 className="text-lg font-bold">{exam.title}</h5>
                        <p className="text-text-secondary text-sm">{exam.subject_name}</p>
                      </div>
                      
                      <div className="flex items-center gap-6 mb-6">
                        <div className="flex items-center gap-2 text-xs text-text-secondary">
                          <Clock className="w-4 h-4" />
                          {exam.duration} Minutes
                        </div>
                        <div className="flex items-center gap-2 text-xs text-text-secondary">
                          <Hash className="w-4 h-4" />
                          {exam.total_marks} Marks
                        </div>
                      </div>

                      <Button className="w-full" onClick={() => navigate(`/exam/${exam.exam_id}`)}>
                        Start Exam
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Card>
                  ))
                ) : (
                  <p className="text-text-secondary text-sm italic">No exams available at the moment.</p>
                )}
              </div>
            </section>

            {/* Completed Exams Section */}
            <section>
              <h4 className="text-lg md:text-xl font-bold mb-4 md:mb-6 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-accent-emerald" />
                Completed Exams
              </h4>
              <div className="space-y-3 md:space-y-4">
                {completedExams.length > 0 ? (
                  completedExams.map((result) => (
                    <Card key={result.result_id} className="p-3 md:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-white/5 bg-white/5">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-9 h-9 md:w-10 md:h-10 bg-accent-emerald/10 rounded-lg flex items-center justify-center shrink-0">
                          <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-accent-emerald" />
                        </div>
                        <div className="min-w-0">
                          <h5 className="font-semibold text-sm md:text-base truncate">{result.exam_title}</h5>
                          <p className="text-[10px] md:text-xs text-text-secondary">
                            Submitted on {new Date(result.submitted_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-left sm:text-right px-12 sm:px-0">
                        <p className="text-base md:text-lg font-bold text-accent-emerald">{result.score} Marks</p>
                      </div>
                    </Card>
                  ))
                ) : (
                  <p className="text-text-secondary text-sm italic">You haven't completed any exams yet.</p>
                )}
              </div>
            </section>
          </div>

          {/* Profile Section */}
          <div className="space-y-4 md:space-y-6">
            <h4 className="text-lg md:text-xl font-bold flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-text-secondary" />
              Profile
            </h4>
            <Card className="p-6 space-y-6">
              <div className="flex flex-col items-center text-center pb-6 border-b border-white/5">
                <div className="w-20 h-20 rounded-2xl bg-accent-blue/10 flex items-center justify-center border border-accent-blue/20 mb-4">
                  <UserIcon className="w-10 h-10 text-accent-blue" />
                </div>
                <h5 className="text-lg font-bold">{user.name}</h5>
                <p className="text-xs text-text-secondary uppercase tracking-widest font-bold">Student</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Hash className="w-4 h-4 text-text-secondary" />
                  <div>
                    <p className="text-[10px] text-text-secondary uppercase font-bold">Login ID</p>
                    <p className="text-sm font-medium">{user.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-text-secondary" />
                  <div>
                    <p className="text-[10px] text-text-secondary uppercase font-bold">Email</p>
                    <p className="text-sm font-medium">{user.email}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
