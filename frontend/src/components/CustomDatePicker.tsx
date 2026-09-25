import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CustomDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  placeholder?: string;
  label?: string;
  align?: 'left' | 'right';
}

const MONTHS = [
  'Tháng Một', 'Tháng Hai', 'Tháng Ba', 'Tháng Tư',
  'Tháng Năm', 'Tháng Sáu', 'Tháng Bảy', 'Tháng Tám',
  'Tháng Chín', 'Tháng Mười', 'Tháng Mười Một', 'Tháng Mười Hai'
];

const DAYS_OF_WEEK = ['Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7', 'CN'];

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({ value, onChange, placeholder = 'mm/dd/yy', label, align = 'left' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Parse initial value or use current date
  const initialDate = value ? new Date(value) : new Date();
  
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());

  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setCurrentMonth(d.getMonth());
        setCurrentYear(d.getFullYear());
      }
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    const day = new Date(year, month, 1).getDay();
    // Convert Sunday (0) to 6, Monday (1) to 0, etc. for our Mon-Sun grid
    return day === 0 ? 6 : day - 1;
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleDateClick = (day: number) => {
    const d = new Date(Date.UTC(currentYear, currentMonth, day));
    onChange(d.toISOString().split('T')[0]);
    setIsOpen(false);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const daysInPrevMonth = getDaysInMonth(currentMonth === 0 ? 11 : currentMonth - 1, currentMonth === 0 ? currentYear - 1 : currentYear);
    
    const days = [];
    
    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push(
        <div key={`prev-${i}`} className="w-8 h-8 flex items-center justify-center text-[#434651] text-sm cursor-not-allowed">
          {daysInPrevMonth - i}
        </div>
      );
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = new Date(Date.UTC(currentYear, currentMonth, i)).toISOString().split('T')[0];
      const isSelected = value === dateStr;
      
      days.push(
        <button
          key={`curr-${i}`}
          onClick={() => handleDateClick(i)}
          className={`w-8 h-8 flex items-center justify-center text-sm font-medium rounded transition-colors
            ${isSelected ? 'bg-[#089981] text-white' : 'text-[#d1d4dc] hover:bg-[#2a2e39]'}`}
        >
          {i}
        </button>
      );
    }
    
    // Next month days to fill grid (usually 42 cells total, 6 rows * 7 days)
    const totalCells = Math.ceil((days.length) / 7) * 7;
    const remainingCells = totalCells - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      days.push(
        <div key={`next-${i}`} className="w-8 h-8 flex items-center justify-center text-[#434651] text-sm cursor-not-allowed">
          {i}
        </div>
      );
    }
    
    return days;
  };

  const years = useMemo(() => {
    const currentY = new Date().getFullYear();
    return Array.from({ length: 20 }, (_, i) => currentY - 10 + i);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      {label && <label className="text-[10px] text-[#787b86] uppercase font-semibold mb-1 block">{label}</label>}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#131722] border border-[#2a2e39] text-[#d1d4dc] rounded px-3 py-2 text-sm cursor-pointer hover:border-[#787b86] transition-colors flex items-center justify-between"
      >
        <span className={value ? 'text-[#d1d4dc]' : 'text-[#787b86]'}>
          {value ? new Date(value).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }) : placeholder}
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#787b86]"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
      </div>

      {isOpen && (
        <div className={`absolute top-full z-50 mt-1 bg-[#1e222d] border border-[#2a2e39] rounded-lg shadow-xl p-4 w-[280px] ${align === 'right' ? 'right-0' : 'left-0'}`}>
          <div className="flex items-center justify-between mb-4">
            <button onClick={handlePrevMonth} className="text-[#787b86] hover:text-white p-1 rounded hover:bg-[#2a2e39]">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-white font-bold text-sm">
              {MONTHS[currentMonth]} {currentYear}
            </span>
            <button onClick={handleNextMonth} className="text-[#787b86] hover:text-white p-1 rounded hover:bg-[#2a2e39]">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex gap-2 mb-4">
            <select
              value={currentMonth}
              onChange={(e) => setCurrentMonth(Number(e.target.value))}
              className="bg-[#131722] border border-[#2a2e39] text-white rounded px-2 py-1.5 text-sm flex-1 outline-none focus:border-[#2962ff]"
            >
              {MONTHS.map((m, i) => (
                <option key={m} value={i}>{m}</option>
              ))}
            </select>
            <select
              value={currentYear}
              onChange={(e) => setCurrentYear(Number(e.target.value))}
              className="bg-[#131722] border border-[#2a2e39] text-white rounded px-2 py-1.5 text-sm w-24 outline-none focus:border-[#2962ff]"
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS_OF_WEEK.map(day => (
              <div key={day} className="text-[#787b86] text-xs font-semibold text-center py-1">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {renderCalendar()}
          </div>
        </div>
      )}
    </div>
  );
};
