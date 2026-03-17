export type UserRole = 'principal' | 'teacher' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  studentId?: string;
  teacherId?: string;
  principalId?: string;
  department?: string;
  class?: string;
  avgScore?: number;
  attendance?: number;
}

export interface Exam {
  id: string;
  title: string;
  courseName: string;
  courseCode: string;
  totalMarks: number;
  duration: number; // in minutes
  startTime?: string;
  endTime?: string;
  createdBy: string;
  status: 'upcoming' | 'open' | 'completed';
  shuffleQuestions: boolean;
  showResultsImmediately: boolean;
  perQuestionTimer: boolean;
  defaultTimePerQuestion?: number; // in seconds
}

export interface Question {
  id: string;
  examId: string;
  text: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  marks: number;
  timeOverride?: number; // in seconds
}

export interface Attempt {
  id: string;
  userId: string;
  examId: string;
  score: number;
  startedAt: string;
  submittedAt?: string;
  cheatFlags: number;
  status: 'active' | 'completed' | 'terminated';
}

export interface CheatLog {
  id: string;
  attemptId: string;
  eventType: 'tab_switch' | 'fullscreen_exit' | 'focus_loss';
  timestamp: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string;
  status: 'present' | 'absent' | 'late';
}
