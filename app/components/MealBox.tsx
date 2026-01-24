'use client';

import { useState, useRef, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import Chip from './Chip';

export type MealType = 'breakfast' | 'lunch' | 'dinner';
export type MealCategory = '도시락' | '배달' | '외식';

interface MealBoxProps {
  type: MealType;
  date: Date;
  initialFoods?: string[];
  initialCategory?: MealCategory;
  onSave?: (foods: string[], category: MealCategory | null) => void;
  className?: string;
}

const mealLabels: Record<MealType, string> = {
  breakfast: '아침',
  lunch: '점심',
  dinner: '저녁',
};

export default function MealBox({ 
  type, 
  date,
  initialFoods = [],
  initialCategory = null,
  onSave,
  className = ''
}: MealBoxProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [foods, setFoods] = useState<string[]>(initialFoods);
  const [category, setCategory] = useState<MealCategory | null>(initialCategory);
  const [newFoodInput, setNewFoodInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // 편집 모드 진입 시 입력 필드에 포커스
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleAddFood = () => {
    const trimmed = newFoodInput.trim();
    if (trimmed && !foods.includes(trimmed)) {
      setFoods([...foods, trimmed]);
      setNewFoodInput('');
    }
  };

  const handleRemoveFood = (index: number) => {
    setFoods(foods.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave?.(foods, category);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFoods(initialFoods);
    setCategory(initialCategory);
    setNewFoodInput('');
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddFood();
    }
  };

  return (
    <div
      onClick={() => !isEditing && setIsEditing(true)}
      className={`
        relative flex flex-col gap-2 p-3 rounded-xs border border-gray-200 w-full
        bg-white transition-colors
        ${type === 'breakfast' ? 'border-l-4 border-l-yellow-500' : ''}
        ${type === 'lunch' ? 'border-l-4 border-l-red-400' : ''}
        ${type === 'dinner' ? 'border-l-4 border-l-blue-400' : ''}
        ${!isEditing ? 'hover:bg-gray-50 cursor-pointer' : ''}
        ${className}
      `}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-700">
          {mealLabels[type]}
        </span>
      </div>

      {isEditing ? (
        /* 편집 모드 */
        <div className="flex flex-col gap-3" onClick={(e) => e.stopPropagation()}>
          {/* 음식 이름 입력 */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-2">
              {foods.map((food, index) => (
                <Chip
                  key={index}
                  label={food}
                  onRemove={() => handleRemoveFood(index)}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={newFoodInput}
                onChange={(e) => setNewFoodInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="음식 이름 입력 후 Enter"
                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#339551]"
              />
              <button
                onClick={handleAddFood}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                추가
              </button>
            </div>
          </div>

          {/* 도시락/배달/외식 선택 */}
          <div className="flex flex-col gap-2">
            <span className="text-xs text-gray-600">식사 유형</span>
            <div className="flex gap-3">
              {(['도시락', '배달', '외식'] as MealCategory[]).map((cat) => (
                <label
                  key={cat}
                  className="flex items-center gap-1 cursor-pointer"
                >
                  <input
                    type="radio"
                    name={`category-${type}-${date.toISOString()}`}
                    checked={category === cat}
                    onChange={() => setCategory(cat)}
                    className="w-3 h-3 text-[#339551] focus:ring-[#339551]"
                  />
                  <span className="text-xs text-gray-700">{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 저장/취소 버튼 */}
          <div className="flex justify-end gap-2 mt-1">
            <button
              onClick={handleSave}
              className="flex items-center justify-center w-6 h-6 rounded-full bg-[#339551] text-white hover:bg-[#2d7d47] transition-colors"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-300 text-gray-700 hover:bg-gray-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* 표시 모드 */
        <div className="flex flex-col gap-2">
          {foods.length > 0 || category ? (
            <>
              {foods.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {foods.map((food, index) => (
                    <Chip key={index} label={food} />
                  ))}
                </div>
              )}
              {category && (
                <span className="text-xs text-gray-500">{category}</span>
              )}
            </>
          ) : (
            <span className="text-xs text-gray-400">식단을 추가하세요</span>
          )}
        </div>
      )}
    </div>
  );
}
