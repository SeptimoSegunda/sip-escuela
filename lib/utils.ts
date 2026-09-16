export const formatDate = (date: Date | string = new Date()): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return String(date);
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatNumber = (n: number): string => {
  return n.toLocaleString('es-AR');
};

const monthMap: Record<string, string> = {
  ene: '01', feb: '02', mar: '03', abr: '04', may: '05', jun: '06',
  jul: '07', ago: '08', sep: '09', oct: '10', nov: '11', dic: '12'
};

export const getLoanMonthKey = (dateStr: string): string => {
  if (!dateStr) return '';
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/');
    if (parts.length === 3) return `${parts[1].padStart(2, '0')}-${parts[2]}`;
  }
  const parts = dateStr.trim().split(/\s+/);
  if (parts.length >= 3) {
    const monthAbbr = parts[1].toLowerCase().replace('.', '').slice(0, 3);
    const monthNum = monthMap[monthAbbr] || '08';
    const year = parts[2];
    return `${monthNum}-${year}`;
  }
  return '08-2026';
};
