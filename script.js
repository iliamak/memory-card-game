document.addEventListener('DOMContentLoaded', () => {
  // Элементы DOM
  const gameGrid = document.getElementById('game-grid');
  const pairsCounter = document.getElementById('pairs');
  const totalPairsCounter = document.getElementById('total-pairs');
  const movesCounter = document.getElementById('moves');
  const timerDisplay = document.getElementById('timer');
  const resetBtn = document.getElementById('reset-btn');
  const gameCompleteElement = document.getElementById('game-complete');
  const finalMovesElement = document.getElementById('final-moves');
  const finalTimeElement = document.getElementById('final-time');
  const playAgainBtn = document.getElementById('play-again-btn');

  // Данные животных - пары эмодзи и названий
  const animals = [
    { id: 1, name: "Кошка", emoji: "🐱", color: "#FFD1DC" },
    { id: 2, name: "Собака", emoji: "🐶", color: "#BAFFC9" },
    { id: 3, name: "Слон", emoji: "🐘", color: "#BAE1FF" },
    { id: 4, name: "Лев", emoji: "🦁", color: "#FFE8BA" },
    { id: 5, name: "Лиса", emoji: "🦊", color: "#FFC8A2" },
    { id: 6, name: "Обезьяна", emoji: "🐵", color: "#E2BAFF" },
    { id: 7, name: "Зебра", emoji: "🦓", color: "#F0FFC9" },
    { id: 8, name: "Жираф", emoji: "🦒", color: "#FFCBC4" }
  ];

  // Игровые переменные
  let cards = [];
  let flippedCards = [];
  let matchedPairs = 0;
  let moves = 0;
  let gameComplete = false;
  let startTime = null;
  let endTime = null;
  let timerInterval = null;

  // Инициализация игры
  function initGame() {
    resetGameState();
    createCards();
    updateUI();
    startTimer();
  }

  // Сброс состояния игры
  function resetGameState() {
    cards = [];
    flippedCards = [];
    matchedPairs = 0;
    moves = 0;
    gameComplete = false;
    startTime = Date.now();
    endTime = null;
    gameGrid.innerHTML = '';
    gameCompleteElement.classList.add('hidden');
    
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  // Создание карточек
  function createCards() {
    // Создаем эмодзи-карточки
    const emojiCards = animals.map(animal => ({
      ...animal,
      content: animal.emoji,
      type: 'emoji',
      matchId: animal.id,
      flipped: false,
      matched: false
    }));
    
    // Создаем карточки с названиями
    const nameCards = animals.map(animal => ({
      ...animal,
      content: animal.name,
      type: 'name',
      matchId: animal.id,
      flipped: false,
      matched: false
    }));
    
    // Объединяем и перемешиваем карточки
    cards = [...emojiCards, ...nameCards];
    shuffleCards();
    
    // Создаем DOM элементы для карточек
    cards.forEach((card, index) => {
      const cardElement = document.createElement('div');
      cardElement.className = 'card';
      cardElement.dataset.index = index;
      
      const cardInner = document.createElement('div');
      cardInner.className = 'card-inner';
      
      const cardFront = document.createElement('div');
      cardFront.className = 'card-front';
      cardFront.textContent = '?';
      
      const cardBack = document.createElement('div');
      cardBack.className = card.type === 'emoji' ? 'card-back emoji' : 'card-back text';
      cardBack.textContent = card.content;
      cardBack.style.backgroundColor = card.color;
      cardBack.style.borderColor = card.color;
      
      cardInner.appendChild(cardFront);
      cardInner.appendChild(cardBack);
      cardElement.appendChild(cardInner);
      
      cardElement.addEventListener('click', () => handleCardClick(index));
      gameGrid.appendChild(cardElement);
    });
  }

  // Перемешивание карточек (алгоритм Фишера-Йейтса)
  function shuffleCards() {
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
  }

  // Обработка клика по карточке
  function handleCardClick(index) {
    // Проверяем условия, при которых клик игнорируется
    if (
      flippedCards.length === 2 || // Уже перевернуты две карточки
      cards[index].matched || // Карточка уже найдена
      flippedCards.includes(index) || // Карточка уже перевёрнута
      gameComplete // Игра завершена
    ) {
      return;
    }
    
    // Запускаем таймер при первом ходе
    if (moves === 0 && flippedCards.length === 0 && !timerInterval) {
      startTimer();
    }
    
    // Переворачиваем карточку
    flipCard(index, true);
    flippedCards.push(index);
    
    // Если перевёрнуты две карточки, проверяем совпадение
    if (flippedCards.length === 2) {
      moves++;
      updateUI();
      
      const [firstIndex, secondIndex] = flippedCards;
      
      // Проверяем совпадение
      if (cards[firstIndex].matchId === cards[secondIndex].matchId) {
        // Отмечаем карточки как найденные
        setTimeout(() => {
          markAsMatched(firstIndex, secondIndex);
          flippedCards = [];
          
          // Проверяем завершение игры
          if (matchedPairs === animals.length) {
            endGame();
          }
        }, 300);
      } else {
        // Если нет совпадения, переворачиваем карточки обратно
        setTimeout(() => {
          flipCard(firstIndex, false);
          flipCard(secondIndex, false);
          flippedCards = [];
        }, 1000);
      }
    }
  }

  // Переворот карточки
  function flipCard(index, isFlipped) {
    cards[index].flipped = isFlipped;
    const cardElement = gameGrid.querySelector(`[data-index="${index}"]`);
    
    if (isFlipped) {
      cardElement.classList.add('flipped');
    } else {
      cardElement.classList.remove('flipped');
    }
  }

  // Отметка карточек как найденных
  function markAsMatched(index1, index2) {
    cards[index1].matched = true;
    cards[index2].matched = true;
    
    const card1 = gameGrid.querySelector(`[data-index="${index1}"]`);
    const card2 = gameGrid.querySelector(`[data-index="${index2}"]`);
    
    card1.classList.add('matched');
    card2.classList.add('matched');
    
    // Анимация "праздника" при нахождении пары
    card1.classList.add('celebrate');
    card2.classList.add('celebrate');
    
    setTimeout(() => {
      card1.classList.remove('celebrate');
      card2.classList.remove('celebrate');
    }, 500);
    
    matchedPairs++;
    updateUI();
  }

  // Завершение игры
  function endGame() {
    gameComplete = true;
    endTime = Date.now();
    clearInterval(timerInterval);
    
    finalMovesElement.textContent = moves;
    finalTimeElement.textContent = formatTime(endTime - startTime);
    gameCompleteElement.classList.remove('hidden');
  }

  // Обновление интерфейса
  function updateUI() {
    pairsCounter.textContent = matchedPairs;
    totalPairsCounter.textContent = animals.length;
    movesCounter.textContent = moves;
  }

  // Запуск таймера
  function startTimer() {
    startTime = Date.now();
    
    timerInterval = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      timerDisplay.textContent = formatTime(elapsedTime);
    }, 1000);
  }

  // Форматирование времени
  function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  // Обработчики событий
  resetBtn.addEventListener('click', initGame);
  playAgainBtn.addEventListener('click', initGame);

  // Инициализация игры при загрузке страницы
  initGame();
});