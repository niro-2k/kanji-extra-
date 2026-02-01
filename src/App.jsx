import React, { useState, useEffect } from 'react';
import kanjiData from './data.json';

const STORAGE_KEY = 'kanji-flashcard-progress-v2';

function saveProgress(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadProgress() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  }
  return null;
}

// 예문 아이템 컴포넌트
function ExampleItem({ ex, revealed, onTap, darkMode, color }) {
  return (
    <div 
      className="py-2 cursor-pointer"
      onClick={(e) => {
        e.stopPropagation();
        onTap();
      }}
    >
      <div className="flex items-end gap-2">
        <div>
          <div className={`text-xs h-4 transition-opacity ${revealed ? 'opacity-100' : 'opacity-0'} ${color}`}>
            {ex.reading}
          </div>
          <div className={`font-medium ${darkMode ? 'text-slate-100' : 'text-slate-800'}`} style={{ fontSize: '26px' }}>
            {ex.word}
          </div>
        </div>
        <div className={`text-sm transition-opacity pb-0.5 ${revealed ? 'opacity-100' : 'opacity-0'} ${darkMode ? 'text-slate-300' : 'text-slate-500'}`}>
          {ex.meaning}
        </div>
      </div>
    </div>
  );
}

function FlipCard({ char, isFlipped, onTap, darkMode, revealedReadings, onToggleReading }) {
  const hasKundoku = char.kundoku && char.kundoku !== '-' && char.kundokuEx?.length > 0;
  
  return (
    <div className="cursor-pointer flex-1 min-h-0 my-1" onClick={onTap} style={{ perspective: '1000px' }}>
      <div
        className="relative w-full h-full transition-transform duration-500"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}
      >
        {/* 앞면 - 한자만 */}
        <div
          className={`absolute inset-0 w-full h-full rounded-2xl shadow-lg flex items-center justify-center ${
            darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'
          }`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <span 
            className={`font-serif select-none ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}
            style={{ fontSize: 'min(32vw, 160px)', lineHeight: 1 }}
          >
            {char.kanji}
          </span>
        </div>

        {/* 뒷면 */}
        <div
          className={`absolute inset-0 w-full h-full rounded-2xl shadow-lg p-4 overflow-hidden flex flex-col ${
            darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'
          }`}
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          {/* 훈음 헤더 */}
          <div className="text-center mb-3 shrink-0">
            <span className={`text-2xl font-bold ${darkMode ? 'text-amber-400' : 'text-slate-700'}`}>
              {char.korean}
            </span>
          </div>

          {/* 음독/훈독 좌우 대칭 */}
          <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
            {/* 음독 (왼쪽) */}
            <div className={`flex-1 ${char.ondoku && char.ondoku !== '-' ? '' : 'opacity-30'}`}>
              <div className={`text-sm font-bold mb-2 text-center ${darkMode ? 'text-rose-400' : 'text-rose-600'}`}>
                {char.ondoku || '-'}
              </div>
              <div className={`pl-3 border-l-2 ${darkMode ? 'border-rose-400/50' : 'border-rose-200'}`}>
                {char.ondokuEx?.slice(0, 2).map((ex, i) => (
                  <ExampleItem
                    key={i}
                    ex={ex}
                    revealed={revealedReadings[`on-${i}`]}
                    onTap={() => onToggleReading(`on-${i}`)}
                    darkMode={darkMode}
                    color={darkMode ? 'text-rose-300' : 'text-rose-500'}
                  />
                ))}
                {(!char.ondokuEx || char.ondokuEx.length === 0) && (
                  <div className="text-slate-600 text-sm">-</div>
                )}
              </div>
            </div>

            {/* 훈독 (오른쪽) */}
            <div className={`flex-1 ${hasKundoku ? '' : 'opacity-30'}`}>
              <div className={`text-sm font-bold mb-2 text-center ${darkMode ? 'text-sky-400' : 'text-sky-600'}`}>
                {char.kundoku || '-'}
              </div>
              <div className={`pl-3 border-l-2 ${darkMode ? 'border-sky-400/50' : 'border-sky-200'}`}>
                {hasKundoku ? char.kundokuEx?.slice(0, 2).map((ex, i) => (
                  <ExampleItem
                    key={i}
                    ex={ex}
                    revealed={revealedReadings[`kun-${i}`]}
                    onTap={() => onToggleReading(`kun-${i}`)}
                    darkMode={darkMode}
                    color={darkMode ? 'text-sky-300' : 'text-sky-500'}
                  />
                )) : (
                  <div className="text-slate-600 text-sm">-</div>
                )}
              </div>
            </div>
          </div>
          
          <div className={`text-center text-xs pt-2 shrink-0 ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}>
            예문 탭 → 읽기 표시
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [selectedGroup, setSelectedGroup] = useState(0);
  const [selectedChar, setSelectedChar] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [showGroupList, setShowGroupList] = useState(false);
  const [learned, setLearned] = useState({});
  const [revealedReadings, setRevealedReadings] = useState({});

  useEffect(() => {
    const saved = loadProgress();
    if (saved) {
      setSelectedGroup(saved.group || 0);
      setSelectedChar(saved.char || 0);
      setLearned(saved.learned || {});
      setDarkMode(saved.darkMode !== undefined ? saved.darkMode : true);
    }
  }, []);

  useEffect(() => {
    saveProgress({
      group: selectedGroup,
      char: selectedChar,
      learned: learned,
      darkMode: darkMode
    });
  }, [selectedGroup, selectedChar, learned, darkMode]);

  const currentGroup = kanjiData[selectedGroup];
  const currentChar = currentGroup?.characters[selectedChar];

  const totalKanji = kanjiData.reduce((sum, g) => sum + g.characters.length, 0);
  const learnedCount = Object.values(learned).filter(v => v).length;

  const goToNextChar = () => {
    if (selectedChar < currentGroup.characters.length - 1) {
      setSelectedChar(selectedChar + 1);
    } else if (selectedGroup < kanjiData.length - 1) {
      setSelectedGroup(selectedGroup + 1);
      setSelectedChar(0);
    }
    setIsFlipped(false);
    setRevealedReadings({});
  };

  const handleCharSelect = (index) => {
    setSelectedChar(index);
    setIsFlipped(false);
    setRevealedReadings({});
  };

  const handleGroupSelect = (index) => {
    setSelectedGroup(index);
    setSelectedChar(0);
    setIsFlipped(false);
    setShowGroupList(false);
    setRevealedReadings({});
  };

  const toggleLearned = () => {
    setLearned(prev => ({
      ...prev,
      [currentChar.kanji]: !prev[currentChar.kanji]
    }));
  };

  const toggleReading = (key) => {
    setRevealedReadings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    if (isFlipped) {
      setRevealedReadings({});
    }
  };

  const handleOutsideClick = (e) => {
    if (e.target === e.currentTarget) {
      goToNextChar();
    }
  };

  if (!currentGroup || !currentChar) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <div 
      className={`h-screen flex flex-col p-3 ${darkMode ? 'bg-slate-900' : 'bg-slate-100'}`}
      onClick={handleOutsideClick}
    >
      <div className="max-w-lg mx-auto w-full flex flex-col h-full" onClick={e => e.stopPropagation()}>
        
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-2 shrink-0">
          <div>
            <h1 className={`text-lg font-bold ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
              한자 플립 카드
            </h1>
            <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>
              {kanjiData.length}개 그룹 · {totalKanji}자
            </p>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-8 h-8 rounded-full text-sm ${darkMode ? 'bg-slate-800 text-yellow-400' : 'bg-white text-slate-600 border'}`}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>

        {/* 진행도 */}
        <div className="mb-2 shrink-0">
          <div className="flex justify-between text-xs mb-1">
            <span className={darkMode ? 'text-slate-500' : 'text-slate-500'}>학습 진도</span>
            <span className={darkMode ? 'text-amber-400' : 'text-slate-700'}>
              {learnedCount} / {totalKanji} ({Math.round(learnedCount / totalKanji * 100)}%)
            </span>
          </div>
          <div className={`h-1.5 rounded-full ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
            <div 
              className="h-1.5 rounded-full bg-emerald-500 transition-all"
              style={{ width: `${(learnedCount / totalKanji) * 100}%` }}
            />
          </div>
        </div>

        {/* 그룹 선택 */}
        <div className="flex items-center gap-2 mb-2 shrink-0">
          <button
            onClick={() => selectedGroup > 0 && handleGroupSelect(selectedGroup - 1)}
            className={`w-8 h-8 rounded-lg text-sm ${selectedGroup === 0 ? 'opacity-30' : ''} ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-white text-slate-600 border'}`}
          >
            ◀
          </button>
          
          <button
            onClick={() => setShowGroupList(!showGroupList)}
            className={`flex-1 py-1.5 px-3 rounded-lg font-medium text-sm ${darkMode ? 'bg-amber-500 text-slate-900' : 'bg-slate-800 text-white'}`}
          >
            {currentGroup.groupName} ({selectedGroup + 1}/{kanjiData.length})
          </button>
          
          <button
            onClick={() => selectedGroup < kanjiData.length - 1 && handleGroupSelect(selectedGroup + 1)}
            className={`w-8 h-8 rounded-lg text-sm ${selectedGroup === kanjiData.length - 1 ? 'opacity-30' : ''} ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-white text-slate-600 border'}`}
          >
            ▶
          </button>
        </div>

        {/* 그룹 목록 */}
        {showGroupList && (
          <div className={`mb-2 max-h-40 overflow-y-auto rounded-lg shrink-0 ${darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'}`}>
            {kanjiData.map((group, idx) => (
              <button
                key={group.group}
                onClick={() => handleGroupSelect(idx)}
                className={`w-full text-left px-3 py-1.5 text-xs ${
                  selectedGroup === idx
                    ? darkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-100 font-medium'
                    : darkMode ? 'text-slate-300' : 'text-slate-600'
                }`}
              >
                {idx + 1}. {group.groupName}
              </button>
            ))}
          </div>
        )}

        {/* 한자 탭 */}
        <div className="flex justify-center gap-2 mb-1 shrink-0 flex-wrap">
          {currentGroup.characters.map((char, idx) => (
            <button
              key={char.kanji}
              onClick={() => handleCharSelect(idx)}
              className={`w-12 h-12 rounded-xl text-2xl font-serif relative ${
                selectedChar === idx
                  ? darkMode ? 'bg-amber-500 text-slate-900' : 'bg-slate-800 text-white'
                  : darkMode ? 'bg-slate-800 text-slate-200 border border-slate-700' : 'bg-white text-slate-700 border'
              }`}
            >
              {char.kanji}
              {learned[char.kanji] && <span className="absolute -top-0.5 -right-0.5 text-xs text-emerald-400">✓</span>}
            </button>
          ))}
        </div>

        {/* 카드 */}
        <FlipCard
          char={currentChar}
          isFlipped={isFlipped}
          onTap={handleFlip}
          darkMode={darkMode}
          revealedReadings={revealedReadings}
          onToggleReading={toggleReading}
        />

        {/* 하단 버튼들 */}
        <div className="mt-2 flex gap-2 shrink-0">
          <button
            onClick={goToNextChar}
            className="flex-1 py-2.5 rounded-lg font-bold text-sm bg-emerald-500 text-white"
          >
            다음 한자 →
          </button>
          <button
            onClick={toggleLearned}
            className={`px-4 py-2.5 rounded-lg font-medium text-sm ${
              learned[currentChar.kanji]
                ? 'bg-emerald-600 text-white'
                : darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'
            }`}
          >
            {learned[currentChar.kanji] ? '✓' : '완료'}
          </button>
        </div>

        {/* 힌트 */}
        <div className="mt-1 text-center shrink-0">
          <span className={`text-xs ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}>
            {isFlipped ? '카드 탭: 앞면' : '카드 탭: 상세보기'} · 바깥 탭: 다음
          </span>
        </div>

        {/* 진행 dots */}
        <div className="mt-1 flex justify-center items-center gap-1 shrink-0">
          {currentGroup.characters.map((char, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full ${
                idx === selectedChar 
                  ? 'bg-amber-500 w-3'
                  : learned[char.kanji] ? 'bg-emerald-500 w-1.5' : darkMode ? 'bg-slate-700 w-1.5' : 'bg-slate-300 w-1.5'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
