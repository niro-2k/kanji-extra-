import React, { useState, useEffect } from 'react';
import kanjiData from './data.json';

const STORAGE_KEY = 'kanji-extra-flashcard-progress-v2';

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

// 루비 표시 컴포넌트 - 한자 위에만 후리가나
function RubyWord({ word, reading, revealed, color }) {
  if (!revealed) {
    return <span style={{ fontSize: '22px' }}>{word}</span>;
  }
  
  return (
    <ruby style={{ fontSize: '22px' }}>
      {word}
      <rt style={{ color, fontSize: '12px' }}>{reading}</rt>
    </ruby>
  );
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
        <div className={`font-medium ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
          <RubyWord word={ex.word} reading={ex.reading} revealed={revealed} color={color} />
        </div>
        <div className={`text-sm transition-opacity pb-0.5 ${revealed ? 'opacity-100' : 'opacity-0'}`} style={{ color: '#FFFF33' }}>
          {ex.meaning}
        </div>
      </div>
    </div>
  );
}

function FlipCard({ char, isFlipped, onTap, darkMode, revealedReadings, onToggleReading }) {
  const hasOndokuEx = char.ondokuEx?.length > 0;
  const hasKundokuEx = char.kundokuEx?.length > 0;
  
  return (
    <div className="cursor-pointer flex-1 min-h-0 my-1" onClick={onTap}>
      <div className="relative w-full h-full">
        {/* 앞면 - 한자만 */}
        {!isFlipped && (
          <div
            className={`w-full h-full rounded-2xl shadow-lg flex items-center justify-center ${
              darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'
            }`}
          >
            <span 
              className={`font-serif select-none ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}
              style={{ fontSize: '120px' }}
            >
              {char.kanji}
            </span>
          </div>
        )}

        {/* 뒷면 - 상세 정보 */}
        {isFlipped && (
          <div
            className={`w-full h-full rounded-2xl shadow-lg flex flex-col overflow-hidden ${
              darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'
            }`}
          >
            {/* 상단: 한자 + 훈음 */}
            <div className="text-center py-3 shrink-0">
              <div className={`text-5xl font-serif ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                {char.kanji}
              </div>
              <div style={{ color: '#FF2FFF', fontSize: '14px', marginTop: '4px' }}>
                {char.korean}
              </div>
            </div>

            {/* 중단: 음독/훈독 좌우 배치 */}
            <div className="flex gap-4 px-4 flex-1 min-h-0 overflow-auto">
              {/* 음독 (왼쪽) */}
              <div className={`flex-1 ${hasOndokuEx ? '' : 'opacity-30'}`}>
                <div className="text-sm font-bold mb-2 text-center" style={{ color: '#FFFF33' }}>
                  {char.ondoku || '-'}
                </div>
                <div className="pl-2" style={{ borderLeft: '2px solid rgba(255, 255, 51, 0.5)' }}>
                  {hasOndokuEx ? char.ondokuEx.slice(0, 2).map((ex, i) => (
                    <ExampleItem
                      key={i}
                      ex={ex}
                      revealed={revealedReadings[`on-${i}`]}
                      onTap={() => onToggleReading(`on-${i}`)}
                      darkMode={darkMode}
                      color="#FFFF33"
                    />
                  )) : (
                    <div className="text-slate-600 text-sm">-</div>
                  )}
                </div>
              </div>

              {/* 훈독 (오른쪽) */}
              <div className={`flex-1 ${hasKundokuEx ? '' : 'opacity-30'}`}>
                <div className="text-sm font-bold mb-2 text-center" style={{ color: '#33FF66' }}>
                  {char.kundoku || '-'}
                </div>
                <div className="pl-2" style={{ borderLeft: '2px solid rgba(51, 255, 102, 0.5)' }}>
                  {hasKundokuEx ? char.kundokuEx.slice(0, 2).map((ex, i) => (
                    <ExampleItem
                      key={i}
                      ex={ex}
                      revealed={revealedReadings[`kun-${i}`]}
                      onTap={() => onToggleReading(`kun-${i}`)}
                      darkMode={darkMode}
                      color="#33FF66"
                    />
                  )) : (
                    <div className="text-slate-600 text-sm">-</div>
                  )}
                </div>
              </div>
            </div>
            
            <div className={`text-center text-xs py-2 shrink-0 ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}>
              예문 탭 → 읽기 표시
            </div>
          </div>
        )}
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

  // 다음 한자
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

  // 이전 한자
  const goToPrevChar = () => {
    if (selectedChar > 0) {
      setSelectedChar(selectedChar - 1);
    } else if (selectedGroup > 0) {
      const prevGroup = kanjiData[selectedGroup - 1];
      setSelectedGroup(selectedGroup - 1);
      setSelectedChar(prevGroup.characters.length - 1);
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

  const handleOutsideClick = (e) => {
    if (e.target === e.currentTarget) {
      goToNextChar();
    }
  };

  // 이전 버튼 활성화 여부
  const canGoPrev = selectedChar > 0 || selectedGroup > 0;
  // 다음 버튼 활성화 여부
  const canGoNext = selectedChar < currentGroup.characters.length - 1 || selectedGroup < kanjiData.length - 1;

  if (!currentGroup || !currentChar) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>;

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
              상용한자 外 플립 카드
            </h1>
            <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>
              {kanjiData.length}개 그룹 · {totalKanji}자
            </p>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-10 h-10 rounded-full text-lg ${darkMode ? 'bg-slate-800 text-yellow-400' : 'bg-white text-slate-600 border'}`}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>

        {/* 진행도 */}
        <div className="mb-2 shrink-0">
          <div className="flex justify-between items-center mb-1">
            <span className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>학습 진도</span>
            <span className="text-xs text-amber-500 font-medium">{learnedCount} / {totalKanji} ({Math.round(learnedCount/totalKanji*100)}%)</span>
          </div>
          <div className={`h-1 rounded-full ${darkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all"
              style={{ width: `${(learnedCount/totalKanji)*100}%` }}
            />
          </div>
        </div>

        {/* 계열 네비게이션 */}
        <div className="flex items-center gap-2 mb-2 shrink-0">
          <button 
            onClick={() => selectedGroup > 0 && handleGroupSelect(selectedGroup - 1)}
            className={`w-8 h-8 flex items-center justify-center rounded ${selectedGroup > 0 ? (darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700') : 'text-slate-700 cursor-not-allowed'}`}
          >
            ◀
          </button>
          <button 
            onClick={() => setShowGroupList(!showGroupList)}
            className="flex-1 bg-fuchsia-500 text-white py-2 rounded-full text-sm font-medium"
          >
            {currentGroup.groupName} ({selectedGroup + 1}/{kanjiData.length})
          </button>
          <button 
            onClick={() => selectedGroup < kanjiData.length - 1 && handleGroupSelect(selectedGroup + 1)}
            className={`w-8 h-8 flex items-center justify-center rounded ${selectedGroup < kanjiData.length - 1 ? (darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700') : 'text-slate-700 cursor-not-allowed'}`}
          >
            ▶
          </button>
        </div>

        {/* 그룹 리스트 (토글) */}
        {showGroupList && (
          <div className={`mb-2 max-h-48 overflow-y-auto rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-white'} p-2 shrink-0`}>
            {kanjiData.map((group, idx) => (
              <button
                key={idx}
                onClick={() => handleGroupSelect(idx)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                  idx === selectedGroup 
                    ? 'bg-fuchsia-500 text-white' 
                    : darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {group.groupName}
              </button>
            ))}
          </div>
        )}

        {/* 한자 선택 탭 */}
        <div className="flex justify-center gap-2 mb-2 shrink-0 flex-wrap">
          {currentGroup.characters.map((char, idx) => (
            <button
              key={char.kanji}
              onClick={() => handleCharSelect(idx)}
              className={`w-12 h-12 rounded-xl text-2xl font-serif relative ${
                selectedChar === idx
                  ? 'text-white'
                  : darkMode ? 'bg-slate-800 text-slate-400' : 'bg-white text-slate-600 border'
              }`}
              style={selectedChar === idx ? { backgroundColor: '#FF2FFF' } : {}}
            >
              {char.kanji}
              {learned[char.kanji] && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full text-white text-xs flex items-center justify-center">✓</span>
              )}
            </button>
          ))}
        </div>

        {/* 플립 카드 */}
        <FlipCard
          char={currentChar}
          isFlipped={isFlipped}
          onTap={() => setIsFlipped(!isFlipped)}
          darkMode={darkMode}
          revealedReadings={revealedReadings}
          onToggleReading={toggleReading}
        />

        {/* 하단 버튼 영역 */}
        <div className="flex gap-2 mt-2 shrink-0">
          {/* 이전 한자 버튼 */}
          <button
            onClick={goToPrevChar}
            disabled={!canGoPrev}
            className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
              canGoPrev
                ? 'bg-slate-600 text-white hover:bg-slate-500'
                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
            }`}
          >
            ← 이전 한자
          </button>
          
          {/* 다음 한자 버튼 */}
          <button
            onClick={goToNextChar}
            disabled={!canGoNext}
            className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
              canGoNext
                ? 'bg-fuchsia-500 text-white hover:bg-fuchsia-400'
                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
            }`}
          >
            다음 한자 →
          </button>
          
          {/* 완료 버튼 */}
          <button
            onClick={toggleLearned}
            className={`px-4 py-3 rounded-xl font-medium transition-colors ${
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
            카드 탭: 앞면 · 바깥 탭: 다음
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
