import { create } from 'zustand';
import { User, Exam, Result, Subject, Question, UserRole } from '../types';
import { supabase } from '../lib/supabase';

interface AppState {
  user: User | null;
  
  setUser: (user: User | null) => void;
  login: (id: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  
  // Principal actions
  fetchUsers: () => Promise<User[]>;
  addUser: (user: User) => Promise<boolean>;
  resetPassword: (id: string) => Promise<boolean>;
  fetchSystemStats: () => Promise<{ students: number, teachers: number, exams: number }>;
  fetchSubjects: () => Promise<Subject[]>;
  addSubject: (name: string) => Promise<Subject | null>;
  
  // Teacher actions
  fetchTeacherExams: (teacherId: string) => Promise<Exam[]>;
  addExam: (exam: Omit<Exam, 'exam_id' | 'subject_name'>) => Promise<Exam | null>;
  addQuestion: (question: Omit<Question, 'question_id'>) => Promise<boolean>;
  fetchExamQuestions: (examId: number) => Promise<Question[]>;
  fetchTeacherResults: (teacherId: string) => Promise<Result[]>;
  fetchExamAttemptsCount: (examId: number) => Promise<number>;
  deleteExam: (examId: number, teacherId: string) => Promise<{ success: boolean, error?: string }>;
  deleteQuestion: (questionId: number) => Promise<{ success: boolean, error?: string }>;
  
  // Student actions
  fetchAvailableExams: () => Promise<Exam[]>;
  fetchStudentResults: (studentId: string) => Promise<Result[]>;
  submitResult: (result: Omit<Result, 'result_id' | 'exam_title'>) => Promise<boolean>;
}

export const useStore = create<AppState>((set, get) => ({
  user: null,

  setUser: (user) => set({ user }),
  
  login: async (id, role) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .eq('role', role)
        .single();

      if (error) {
        if (error.message.includes('schema cache')) {
          console.error('Database schema missing: The "users" table was not found. Please run the SQL setup script in your Supabase dashboard.');
        }
        throw error;
      }

      if (data) {
        set({ user: data });
        return true;
      }
    } catch (err) {
      console.error('Supabase login error:', err);
    }
    
    return false;
  },

  logout: () => set({ user: null }),

  // Principal actions
  fetchUsers: async () => {
    const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    if (error) return [];
    return data;
  },

  addUser: async (user) => {
    const { error } = await supabase.from('users').insert([user]);
    return !error;
  },

  resetPassword: async (id) => {
    // Reset password to a default one for the principal to give to the user
    const defaultPassword = 'password123';
    const { error } = await supabase.from('users').update({ password: defaultPassword }).eq('id', id);
    if (error) {
      console.error('Error resetting password:', error);
      return false;
    }
    console.log(`Password reset for user ${id} to "${defaultPassword}"`);
    return true;
  },

  fetchSystemStats: async () => {
    const { count: students } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student');
    const { count: teachers } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'teacher');
    const { count: exams } = await supabase.from('exams').select('*', { count: 'exact', head: true });
    return { students: students || 0, teachers: teachers || 0, exams: exams || 0 };
  },

  fetchSubjects: async () => {
    const { data, error } = await supabase.from('subjects').select('*').order('subject_name');
    if (error) return [];
    return data;
  },

  addSubject: async (name) => {
    const { user } = get();
    if (!user) return null;
    const { data, error } = await supabase.from('subjects').insert([{ subject_name: name, created_by: user.id }]).select().single();
    if (error) return null;
    return data;
  },

  // Teacher actions
  fetchTeacherExams: async (teacherId) => {
    const { data, error } = await supabase
      .from('exams')
      .select('*, subjects(subject_name)')
      .eq('created_by', teacherId)
      .order('created_at', { ascending: false });
    
    if (error) return [];
    return data.map((exam: any) => ({
      ...exam,
      subject_name: exam.subjects?.subject_name
    }));
  },

  addExam: async (exam) => {
    const { data, error } = await supabase.from('exams').insert([exam]).select().single();
    if (error) return null;
    return data;
  },

  addQuestion: async (question) => {
    const { error } = await supabase.from('questions').insert([question]);
    return !error;
  },

  fetchExamQuestions: async (examId) => {
    const { data, error } = await supabase.from('questions').select('*').eq('exam_id', examId);
    if (error) return [];
    return data;
  },

  fetchTeacherResults: async (teacherId) => {
    // First get exams created by this teacher
    const { data: exams } = await supabase.from('exams').select('exam_id, title').eq('created_by', teacherId);
    if (!exams || exams.length === 0) return [];
    
    const examIds = exams.map(e => e.exam_id);
    const { data, error } = await supabase.from('results').select('*').in('exam_id', examIds).order('submitted_at', { ascending: false });
    
    if (error) return [];
    
    // Attach exam titles
    return data.map(result => ({
      ...result,
      exam_title: exams.find(e => e.exam_id === result.exam_id)?.title
    }));
  },

  fetchExamAttemptsCount: async (examId) => {
    const { count } = await supabase.from('results').select('*', { count: 'exact', head: true }).eq('exam_id', examId);
    return count || 0;
  },

  deleteExam: async (examId, teacherId) => {
    const { error } = await supabase
      .from('exams')
      .delete()
      .eq('exam_id', examId)
      .eq('created_by', teacherId);
    
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  },

  deleteQuestion: async (questionId) => {
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('question_id', questionId);
    
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  },

  // Student actions
  fetchAvailableExams: async () => {
    const { data, error } = await supabase
      .from('exams')
      .select('*, subjects(subject_name)')
      .order('created_at', { ascending: false });
    
    if (error) return [];
    return data.map((exam: any) => ({
      ...exam,
      subject_name: exam.subjects?.subject_name
    }));
  },

  fetchStudentResults: async (studentId) => {
    const { data, error } = await supabase.from('results').select('*, exams(title)').eq('student_id', studentId).order('submitted_at', { ascending: false });
    if (error) return [];
    return data.map((r: any) => ({
      ...r,
      exam_title: r.exams?.title
    }));
  },

  submitResult: async (result) => {
    const { error } = await supabase.from('results').insert([result]);
    return !error;
  }
}));
