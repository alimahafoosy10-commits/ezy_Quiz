export type UserRole = 'principal' | 'teacher' | 'student';

export interface User {
  id: string; // Login ID (TEXT PRIMARY KEY)
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  created_at?: string;
}

export interface Subject {
  subject_id: number;
  subject_name: string;
  created_by: string;
  created_at?: string;
}

export interface Exam {
  exam_id: number;
  title: string;
  subject_id: number;
  duration: number;
  total_marks: number;
  created_by: string;
  created_at?: string;
  subject_name?: string; // For display
}

export interface Question {
  question_id: number;
  exam_id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'A' | 'B' | 'C' | 'D';
  marks: number;
}

export interface Answer {
  answer_id: number;
  student_id: string;
  exam_id: number;
  question_id: number;
  selected_option: 'A' | 'B' | 'C' | 'D';
  submitted_at?: string;
}

export interface Result {
  result_id: number;
  student_id: string;
  exam_id: number;
  score: number;
  total_marks: number;
  submitted_at: string;
  exam_title?: string; // Joined from exams
}

export interface LoginActivity {
  activity_id: number;
  user_id: string;
  role: string;
  login_time: string;
  status: string;
}
