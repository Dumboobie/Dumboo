import { CategoryMeta, PaymentMethod } from '../types/finance';

export const EXPENSE_CATEGORIES: CategoryMeta[] = [
  {
    id: 'food',
    name: 'อาหาร & เครื่องดื่ม',
    type: 'expense',
    color: '#f97316', // orange-500
    bgColor: '#ffedd5', // orange-100
    iconName: 'Utensils',
    description: 'ข้าวจานหลัก, กาแฟ, ชานม, ขนม, สังสรรค์'
  },
  {
    id: 'transport',
    name: 'การเดินทาง & ยานพาหนะ',
    type: 'expense',
    color: '#3b82f6', // blue-500
    bgColor: '#dbeafe', // blue-100
    iconName: 'Car',
    description: 'BTS, MRT, น้ำมันรถ, ค่าแท็กซี่, ทางด่วน'
  },
  {
    id: 'shopping',
    name: 'ช้อปปิ้ง & เสื้อผ้า',
    type: 'expense',
    color: '#ec4899', // pink-500
    bgColor: '#fce7f3', // pink-100
    iconName: 'ShoppingBag',
    description: 'เสื้อผ้า, เครื่องสำอาง, ของใช้ส่วนตัว'
  },
  {
    id: 'housing',
    name: 'ที่อยู่อาศัย & ซ่อมแซม',
    type: 'expense',
    color: '#6366f1', // indigo-500
    bgColor: '#e0e7ff', // indigo-100
    iconName: 'Home',
    description: 'ค่าเช่าห้อง, ค่าผ่อนบ้าน, ค่าส่วนกลาง'
  },
  {
    id: 'bills',
    name: 'ค่าน้ำ ไฟ เน็ต โทรศัพท์',
    type: 'expense',
    color: '#06b6d4', // cyan-500
    bgColor: '#cffafe', // cyan-100
    iconName: 'Zap',
    description: 'ค่าไฟฟ้า, ค่าน้ำประปา, อินเทอร์เน็ต, รายเดือนมือถือ'
  },
  {
    id: 'entertainment',
    name: 'บันเทิง & ท่องเที่ยว',
    type: 'expense',
    color: '#a855f7', // purple-500
    bgColor: '#f3e8ff', // purple-100
    iconName: 'Film',
    description: 'ดูหนัง, คอนเสิร์ต, โรงแรม, สตรีมมิ่ง Netflix, เกม'
  },
  {
    id: 'health',
    name: 'สุขภาพ & ยา & ประกัน',
    type: 'expense',
    color: '#10b981', // emerald-500
    bgColor: '#d1fae5', // emerald-100
    iconName: 'HeartPulse',
    description: 'ยา, พบแพทย์, ประกันสุขภาพ, ตรวจสุขภาพ, ฟิตเนส'
  },
  {
    id: 'education',
    name: 'การศึกษา & พัฒนาตนเอง',
    type: 'expense',
    color: '#8b5cf6', // violet-500
    bgColor: '#ede9fe', // violet-100
    iconName: 'GraduationCap',
    description: 'หนังสือ, คอร์สเรียน, สัมมนา, เครื่องเขียน'
  },
  {
    id: 'family',
    name: 'ครอบครัว & สัตว์เลี้ยง',
    type: 'expense',
    color: '#eab308', // yellow-500
    bgColor: '#fef9c3', // yellow-100
    iconName: 'Heart',
    description: 'อาหารสัตว์, ให้พ่อแม่, ของขวัญครอบครัว'
  },
  {
    id: 'other_expense',
    name: 'อื่นๆ',
    type: 'expense',
    color: '#64748b', // slate-500
    bgColor: '#f1f5f9', // slate-100
    iconName: 'MoreHorizontal',
    description: 'ค่าใช้จ่ายจิปาถะอื่นๆ'
  }
];

export const INCOME_CATEGORIES: CategoryMeta[] = [
  {
    id: 'salary',
    name: 'เงินเดือนประจำ',
    type: 'income',
    color: '#10b981', // emerald-500
    bgColor: '#d1fae5',
    iconName: 'WalletCards',
    description: 'เงินเดือนหลัก, รายได้ประจำ'
  },
  {
    id: 'bonus',
    name: 'โบนัส & ค่าคอมฯ',
    type: 'income',
    color: '#059669', // emerald-600
    bgColor: '#a7f3d0',
    iconName: 'Trophy',
    description: 'โบนัสประจำปี, incentive, commission'
  },
  {
    id: 'freelance',
    name: 'ฟรีแลนซ์ & งานเสริม',
    type: 'income',
    color: '#0d9488', // teal-600
    bgColor: '#ccfbf1',
    iconName: 'Briefcase',
    description: 'งานรับจ้าง, งานนอกเวลา, โปรเจกต์พิเศษ'
  },
  {
    id: 'investment',
    name: 'การลงทุน & ปันผล',
    type: 'income',
    color: '#2563eb', // blue-600
    bgColor: '#dbeafe',
    iconName: 'TrendingUp',
    description: 'ดอกเบี้ยเงินฝาก, เงินปันผลหุ้น, กำไรกองทุน'
  },
  {
    id: 'business',
    name: 'ธุรกิจ & ค้าขาย',
    type: 'income',
    color: '#7c3aed', // violet-600
    bgColor: '#ede9fe',
    iconName: 'Store',
    description: 'ยอดขายร้านค้า, ธุรกิจส่วนตัว'
  },
  {
    id: 'gift',
    name: 'ของขวัญ & เงินช่วยเหลือ',
    type: 'income',
    color: '#d97706', // amber-600
    bgColor: '#fef3c7',
    iconName: 'Gift',
    description: 'ซองงานแต่ง, เงินแต๊ะเอีย, คนในบ้านโอนให้'
  },
  {
    id: 'other_income',
    name: 'รายรับอื่นๆ',
    type: 'income',
    color: '#64748b',
    bgColor: '#f1f5f9',
    iconName: 'Coins',
    description: 'รายรับเบ็ดเตล็ดอื่นๆ'
  }
];

export const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: string }[] = [
  { id: 'cash', label: 'เงินสด', icon: 'Banknote' },
  { id: 'bank', label: 'โอนเงินธนาคาร', icon: 'Building2' },
  { id: 'promptpay', label: 'พร้อมเพย์ QR', icon: 'QrCode' },
  { id: 'credit_card', label: 'บัตรเครดิต', icon: 'CreditCard' },
  { id: 'ewallet', label: 'E-Wallet', icon: 'Smartphone' },
];

export const QUICK_PRESETS = [
  { title: 'ข้าวมื้อเช้า/เที่ยง', amount: 60, type: 'expense' as const, category: 'food' },
  { title: 'กาแฟ / ชา', amount: 55, type: 'expense' as const, category: 'food' },
  { title: 'รถไฟฟ้า / รถเมล์', amount: 45, type: 'expense' as const, category: 'transport' },
  { title: 'ซื้อของ 7-11', amount: 120, type: 'expense' as const, category: 'food' },
  { title: 'น้ำมันรถ', amount: 500, type: 'expense' as const, category: 'transport' },
];

export const THAI_MONTH_NAMES = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
  'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
  'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

export const THAI_MONTH_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.',
  'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.',
  'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];

export function getCategoryMeta(categoryId: string, type: 'income' | 'expense'): CategoryMeta {
  const list = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const found = list.find((c) => c.id === categoryId);
  if (found) return found;
  // Try looking in other list as fallback
  const alt = (type === 'income' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).find(c => c.id === categoryId);
  if (alt) return alt;
  return {
    id: categoryId,
    name: categoryId,
    type,
    color: '#64748b',
    bgColor: '#f1f5f9',
    iconName: 'MoreHorizontal'
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount).replace('THB', '฿').trim();
}

export function formatThaiDate(dateString: string): string {
  try {
    const [yearStr, monthStr, dayStr] = dateString.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1;
    const day = parseInt(dayStr, 10);
    const buddhistYear = year + 543;
    return `${day} ${THAI_MONTH_SHORT[month]} ${buddhistYear}`;
  } catch {
    return dateString;
  }
}

export function formatThaiMonthYear(yearMonth: string): string {
  try {
    const [yearStr, monthStr] = yearMonth.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1;
    const thaiMonth = THAI_MONTH_NAMES[month];
    const thaiYear = year + 543;
    return `${thaiMonth} ${thaiYear} (${year})`;
  } catch {
    return yearMonth;
  }
}
