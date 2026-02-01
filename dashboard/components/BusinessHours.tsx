'use client';

import { X } from 'lucide-react';

interface BusinessHour {
  day_of_week: number;
  open_time: string;
  close_time: string;
  is_closed: boolean;
}

interface BusinessHoursProps {
  hours: BusinessHour[];
  onChange: (hours: BusinessHour[]) => void;
}

const DAYS = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 7, label: 'Sunday' },
];

export default function BusinessHours({ hours, onChange }: BusinessHoursProps) {
  const updateHour = (index: number, field: keyof BusinessHour, value: any) => {
    const newHours = [...hours];
    newHours[index] = { ...newHours[index], [field]: value };
    onChange(newHours);
  };

  const addHour = () => {
    onChange([...hours, { day_of_week: 1, open_time: '09:00', close_time: '17:00', is_closed: false }]);
  };

  const removeHour = (index: number) => {
    onChange(hours.filter((_, i) => i !== index));
  };

  // Initialize with all 7 days if empty
  const initializeHours = () => {
    if (hours.length === 0) {
      const defaultHours = DAYS.map(day => ({
        day_of_week: day.value,
        open_time: '09:00',
        close_time: '17:00',
        is_closed: false,
      }));
      onChange(defaultHours);
    }
  };

  // Ensure we have hours for all days
  const allHours = DAYS.map(day => {
    const existing = hours.find(h => h.day_of_week === day.value);
    return existing || { day_of_week: day.value, open_time: '', close_time: '', is_closed: true };
  });

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Business Hours</label>
      <div className="space-y-2">
        {allHours.map((hour, index) => {
          const day = DAYS.find(d => d.value === hour.day_of_week);
          return (
            <div key={hour.day_of_week} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg">
              <div className="w-24 text-sm font-medium text-gray-700">{day?.label}</div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!hour.is_closed}
                  onChange={(e) => {
                    const newHours = [...allHours];
                    newHours[index] = { ...newHours[index], is_closed: !e.target.checked };
                    onChange(newHours);
                  }}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600">Open</span>
              </label>
              {!hour.is_closed && (
                <>
                  <input
                    type="time"
                    value={hour.open_time || '09:00'}
                    onChange={(e) => {
                      const newHours = [...allHours];
                      newHours[index] = { ...newHours[index], open_time: e.target.value };
                      onChange(newHours);
                    }}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="time"
                    value={hour.close_time || '17:00'}
                    onChange={(e) => {
                      const newHours = [...allHours];
                      newHours[index] = { ...newHours[index], close_time: e.target.value };
                      onChange(newHours);
                    }}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </>
              )}
              {hour.is_closed && (
                <span className="text-sm text-gray-500">Closed</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
