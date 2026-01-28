import React, { useState, useEffect } from 'react';
import kanjiData from './data.json';

const STORAGE_KEY = 'kanji-flashcard-progress';

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

function FlipCard({ char, isFlipped, onTap, darkMode }) {
  const hasOndoku = char.ondoku && char.ondoku !== '-' && char.ondokuEx?.length > 0;
  const hasKundoku = char.kundoku && char.kundoku !== '-' && char.kundokuEx?.length > 0;
  
  return (
    <div className="cursor-pointer" onClick={onTap} style={{ perspective: '1000px' }}>
      <div
        className="relative w-full transition-transform duration-500"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}
      >
        {/* 앞면 - 한자만 */}
        <div
          className={`w-full rounded-2xl shadow-lg flex items-center justify-center ${
            darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'
          }`}
          style={{ backfaceVisibility: 'hidden', height: '320px' }}
        >
          <span className={`font-serif select-none ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}
            style={{ fontSize: '120px', lineHeight: 1 }}>
            {char.kanji}
          </span>
        </div>

        {/* 뒷면 - 좌우 배치 */}
        <div
          className={`absolute inset-0 w-full rounded-2xl shadow-lg p-4 ${
            darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'
          }`}
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', height: '320px' }}
        >
          {/* 상단: 한자 + 한국음뜻 */}
          <div className={`flex items-center justify-center gap-4 mb-3 pb-2 border-b ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
            <span className={`font-serif ${darkMode ? 'text-slate-100' : 'text-slate-800'}`} style={{ fontSize: '42px' }}>
              {char.kanji}
            </span>
            <span className={`text-lg font-bold ${darkMode ? 'text-amber-400' : 'text-slate-600'}`}>
              {char.korean}
            </span>
          </div>

          {/* 좌우 배치: 음독(왼쪽) | 훈독(오른쪽) */}
          <div className="flex gap-3" style={{ height: 'calc(100% - 70px)' }}>
            {/* 왼쪽: 음독 */}
            <div className={`flex-1 ${hasKundoku ? 'pr-3 border-r' : ''} ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
              {hasOndoku && (
                <>
                  <div className={`text-sm font-bold mb-2 ${darkMode ? 'text-rose-400' : 'text-rose-600'}`}>
                    {char.ondoku}
                  </div>
                  <div className={`pl-2 border-l-2 ${darkMode ? 'border-rose-400/50' : 'border-rose-200'}`}>
                    {char.ondokuEx?.slice(0, 2).map((ex, i) => (
                      <div key={i} className="py-1">
                        <ruby className={`font-medium ${darkMode ? 'text-slate-100' : 'text-slate-800'}`} style={{ fontSize: '28px' }}>
                          {ex.word}
                          <rp>(</rp>
                          <rt className={`font-normal ${darkMode ? 'text-rose-400' : 'text-rose-500'}`} style={{ fontSize: '12px' }}>{ex.reading}</rt>
                          <rp>)</rp>
                        </ruby>
                        <span className={`text-base ml-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{ex.meaning}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* 오른쪽: 훈독 */}
            {hasKundoku && (
              <div className="flex-1">
                <div className={`text-sm font-bold mb-2 ${darkMode ? 'text-sky-400' : 'text-sky-600'}`}>
                  {char.kundoku}
                </div>
                <div className={`pl-2 border-l-2 ${darkMode ? 'border-sky-400/50' : 'border-sky-200'}`}>
                  {char.kundokuEx?.slice(0, 2).map((ex, i) => (
                    <div key={i} className="py-1">
                      <ruby className={`font-medium ${darkMode ? 'text-slate-100' : 'text-slate-800'}`} style={{ fontSize: '28px' }}>
                        {ex.word}
                        <rp>(</rp>
                        <rt className={`font-normal ${darkMode ? 'text-sky-400' : 'text-sky-500'}`} style={{ fontSize: '12px' }}>{ex.reading}</rt>
                        <rp>)</rp>
                      </ruby>
                      <span className={`text-base ml-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{ex.meaning}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
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

  const toggleLearned = (kanji) => {
    setLearned(prev => ({
      ...prev,
      [kanji]: !prev[kanji]
    }));
  };

  const totalKanji = kanjiData.reduce((sum, g) => sum + g.characters.length, 0);
  const learnedCount = Object.values(learned).filter(v => v).length;

  const handleCharSelect = (index) => {
    setSelectedChar(index);
    setIsFlipped(false);
  };

  const handleGroupSelect = (index) => {
    setSelectedGroup(index);
    setSelectedChar(0);
    setIsFlipped(false);
    setShowGroupList(false);
  };

  const goToPrevGroup = () => {
    if (selectedGroup > 0) handleGroupSelect(selectedGroup - 1);
  };

  const goToNextGroup = () => {
    if (selectedGroup < kanjiData.length - 1) handleGroupSelect(selectedGroup + 1);
  };

  const resetProgress = () => {
    if (confirm('진도를 초기화하시겠습니까?')) {
      setSelectedGroup(0);
      setSelectedChar(0);
      setLearned({});
      setIsFlipped(false);
    }
  };

  if (!currentGroup || !currentChar) return <div>Loading...</div>;

  return (
    <div className={`min-h-screen p-4 ${darkMode ? 'bg-slate-900' : 'bg-slate-100'}`}>
      <div className="max-w-lg mx-auto">
        
        <div className="flex justify-between items-center mb-3">
          <div>
            <h1 className={`text-xl font-bold ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
              한자 플립 카드
            </h1>
            <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {kanjiData.length}개 그룹 · {totalKanji}자
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={resetProgress}
              className={`p-2 rounded-full text-xs ${darkMode ? 'bg-slate-800 text-slate-400' : 'bg-white text-slate-500 border'}`}
            >
              ↺
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-full ${darkMode ? 'bg-slate-800 text-yellow-400' : 'bg-white text-slate-600 border'}`}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>학습 진도</span>
            <span className={darkMode ? 'text-amber-400' : 'text-slate-700'}>
              {learnedCount} / {totalKanji} ({Math.round(learnedCount / totalKanji * 100)}%)
            </span>
          </div>
          <div className={`h-2 rounded-full ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
            <div 
              className="h-2 rounded-full bg-amber-500 transition-all"
              style={{ width: `${(learnedCount / totalKanji) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={goToPrevGroup}
            disabled={selectedGroup === 0}
            className={`p-2 rounded-lg ${selectedGroup === 0 ? 'opacity-30' : darkMode ? 'bg-slate-800 text-slate-300' : 'bg-white text-slate-600 border'}`}
          >
            ◀
          </button>
          
          <button
            onClick={() => setShowGroupList(!showGroupList)}
            className={`flex-1 py-2 px-4 rounded-lg font-medium ${darkMode ? 'bg-amber-500 text-slate-900' : 'bg-slate-800 text-white'}`}
          >
            {currentGroup.groupName} ({selectedGroup + 1}/{kanjiData.length})
          </button>
          
          <button
            onClick={goToNextGroup}
            disabled={selectedGroup === kanjiData.length - 1}
            className={`p-2 rounded-lg ${selectedGroup === kanjiData.length - 1 ? 'opacity-30' : darkMode ? 'bg-slate-800 text-slate-300' : 'bg-white text-slate-600 border'}`}
          >
            ▶
          </button>
        </div>

        {showGroupList && (
          <div className={`mb-4 max-h-60 overflow-y-auto rounded-lg ${darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'}`}>
            {kanjiData.map((group, idx) => {
              const groupLearned = group.characters.filter(c => learned[c.kanji]).length;
              return (
                <button
                  key={group.group}
                  onClick={() => handleGroupSelect(idx)}
                  className={`w-full text-left px-4 py-2 text-sm flex justify-between ${
                    selectedGroup === idx
                      ? darkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-100 font-medium'
                      : darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{idx + 1}. {group.groupName}</span>
                  <span className={darkMode ? 'text-slate-500' : 'text-slate-400'}>
                    {groupLearned}/{group.characters.length}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <div className="flex justify-center gap-3 mb-2 flex-wrap">
          {currentGroup.characters.map((char, idx) => (
            <button
              key={char.kanji}
              onClick={() => handleCharSelect(idx)}
              className={`w-12 h-12 rounded-xl text-2xl font-serif transition-all relative ${
                selectedChar === idx
                  ? darkMode ? 'bg-amber-500 text-slate-900 scale-110' : 'bg-slate-800 text-white scale-110'
                  : darkMode ? 'bg-slate-800 text-slate-200 border border-slate-700' : 'bg-white text-slate-700 border'
              }`}
            >
              {char.kanji}
              {learned[char.kanji] && <span className="absolute -top-1 -right-1 text-xs">✓</span>}
            </button>
          ))}
        </div>

        <div className="text-center mb-4">
          <span className={`text-2xl font-bold ${darkMode ? 'text-amber-400' : 'text-slate-700'}`}>
            {currentChar.korean}
          </span>
        </div>

        <FlipCard
          char={currentChar}
          isFlipped={isFlipped}
          onTap={() => setIsFlipped(!isFlipped)}
          darkMode={darkMode}
        />

        <div className="mt-4 flex justify-center">
          <button
            onClick={() => toggleLearned(currentChar.kanji)}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              learned[currentChar.kanji]
                ? 'bg-green-500 text-white'
                : darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-200 text-slate-600'
            }`}
          >
            {learned[currentChar.kanji] ? '✓ 학습 완료' : '학습 완료로 표시'}
          </button>
        </div>

        <div className="mt-3 text-center">
          <span className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            {isFlipped ? '탭: 앞면' : '탭: 상세보기'}
          </span>
        </div>

        <div className="mt-4 flex justify-center items-center gap-2 flex-wrap">
          {currentGroup.characters.map((char, idx) => (
            <div
              key={idx}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === selectedChar 
                  ? darkMode ? 'bg-amber-500 w-4' : 'bg-slate-800 w-4'
                  : learned[char.kanji] ? 'bg-green-500' : darkMode ? 'bg-slate-700' : 'bg-slate-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
