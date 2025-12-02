// Utility functions for date formatting and calculations

/**
 * Format Date object to ISO date string (YYYY-MM-DD)
 */
export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Format ISO date (YYYY-MM-DD) to display format (DD MMM YYYY)
 */
export const formatDisplayDate = (isoDate: string): string => {
  if (!isoDate) return '';
  
  // Handle both ISO format (YYYY-MM-DD) and display format (DD MMM YYYY)
  if (isoDate.includes('-')) {
    const date = new Date(isoDate);
    const day = date.getDate().toString().padStart(2, '0');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${day} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  }
  
  return isoDate; // Already in display format
};

/**
 * Calculate end date based on start date and time comparison
 * If end time is less than start time, it's next day
 */
export const calculateEndDate = (startDate: string, startTime: string, endTime: string): string => {
  if (!startDate || !startTime || !endTime) return startDate;
  
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  
  // If end time is less than or equal to start time, it means next day
  if (endMinutes <= startMinutes) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + 1);
    return formatDate(date);
  }
  
  return startDate;
};

/**
 * Format Date object to full day and date string (e.g., "Senin, 3 Desember 2025")
 */
export const formatDateFull = (date: Date): string => {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

/**
 * Format Date object to time string with WIB (HH:MM:SS WIB)
 */
export const formatTime = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds} WIB`;
};

/**
 * Get month names in Indonesian (short form)
 */
export const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
