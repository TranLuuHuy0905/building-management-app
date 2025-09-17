export interface User {
  phone: string;
  role: 'resident' | 'admin' | 'technician';
  name: string;
  apartment?: string;
  id?: string;
}

export interface Notification {
  id: number;
  type: 'warning' | 'event' | 'reminder';
  title: string;
  content: string;
  date: string;
  targetType: 'all' | 'resident' | 'admin' | 'technician';
}

export interface Request {
  id: number;
  type: 'electric' | 'water' | 'other';
  title: string;
  description: string;
  apartment: string;
  status: 'pending' | 'processing' | 'completed';
  createdBy: 'resident' | 'admin';
  assignedTo: string;
  createdAt: string;
  completedAt?: string;
  rating?: number | null;
}

export interface Bill {
  id: number;
  apartment: string;
  month: string;
  serviceFee: number;
  parking: number;
  electricity: number;
  water: number;
  total: number;
  status: 'paid' | 'unpaid';
  dueDate: string;
  paidDate?: string;
}
