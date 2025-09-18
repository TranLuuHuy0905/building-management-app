export interface User {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  role: 'resident' | 'admin' | 'technician';
  apartment?: string;
  buildingName: string;
}

export interface Notification {
  id: string; // Changed to string for Firestore ID
  type: 'warning' | 'event' | 'reminder';
  title: string;
  content: string;
  date: string;
  targetType: 'all' | 'resident' | 'admin' | 'technician';
  buildingName: string;
}

export interface Request {
  id: string; // Changed to string for Firestore ID
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
  buildingName: string;
}

export interface Bill {
  id: string; // Changed to string for Firestore ID
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
  buildingName: string;
}

export interface BulkUserCreationData {
  name: string;
  apartment: string;
  email: string;
  password: string;
  phone: string;
}
