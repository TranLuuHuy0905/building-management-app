import type { Notification, Request, Bill } from './types';

// Mock users
export const users: { [key: string]: { role: 'resident' | 'admin' | 'technician', name: string, apartment?: string, id?: string } } = {
  '0901234567': { role: 'resident', apartment: 'A1204', name: 'Nguyễn Văn An' },
  '0901234568': { role: 'admin', name: 'Trần Thị Bình' },
  '0901234569': { role: 'technician', name: 'Lê Văn Cường', id: 'tech1' }
};

export const notifications: Notification[] = [
  {
    id: 1,
    type: 'warning',
    title: 'Thông báo bảo trì thang máy',
    content: 'Thang máy sẽ được bảo trì từ 8h-10h sáng ngày 20/09/2025',
    date: '2025-09-15',
    targetType: 'all'
  },
  {
    id: 2,
    type: 'event',
    title: 'Họp cư dân tháng 9',
    content: 'Cuộc họp sẽ diễn ra vào 19h ngày 25/09/2025 tại sảnh tầng 1',
    date: '2025-09-14',
    targetType: 'all'
  },
  {
    id: 3,
    type: 'reminder',
    title: 'Nhắc nhở thanh toán phí dịch vụ',
    content: 'Vui lòng thanh toán phí dịch vụ tháng 09/2025 trước ngày 30/09/2025.',
    date: '2025-09-22',
    targetType: 'resident'
  }
];

export const requests: Request[] = [
  {
    id: 1,
    type: 'electric',
    title: 'Mất điện căn hộ',
    description: 'Điện tự nhiên mất từ 2h chiều, kiểm tra giúp em',
    apartment: 'A1204',
    status: 'processing',
    createdBy: 'resident',
    assignedTo: 'tech1',
    createdAt: '2025-09-16',
    rating: null
  },
  {
    id: 2,
    type: 'water',
    title: 'Vòi nước bị rỉ',
    description: 'Vòi nước trong nhà vệ sinh bị rỉ nhỏ giọt',
    apartment: 'A1204',
    status: 'completed',
    createdBy: 'resident',
    assignedTo: 'tech1',
    createdAt: '2025-09-10',
    completedAt: '2025-09-12',
    rating: 5
  },
  {
    id: 3,
    type: 'other',
    title: 'Đèn hành lang không sáng',
    description: 'Bóng đèn hành lang tầng 12 khu A bị cháy.',
    apartment: 'BQL',
    status: 'pending',
    createdBy: 'admin',
    assignedTo: 'tech1',
    createdAt: '2025-09-17',
    rating: null
  }
];

export const bills: Bill[] = [
  {
    id: 1,
    apartment: 'A1204',
    month: '09/2025',
    serviceFee: 500000,
    parking: 200000,
    electricity: 300000,
    water: 100000,
    total: 1100000,
    status: 'unpaid',
    dueDate: '2025-09-30'
  },
  {
    id: 2,
    apartment: 'A1204',
    month: '08/2025',
    serviceFee: 500000,
    parking: 200000,
    electricity: 280000,
    water: 95000,
    total: 1075000,
    status: 'paid',
    paidDate: '2025-08-25'
  }
];
