// app.js
import { HIRAGANA } from "./data/char/hiragana.js";
import { KATAKANA } from "./data/char/katakana.js";
(() => {
  /*********************************************************
   * 1. 설정
   *********************************************************/
  const SENTENCE_JSON_PATH_TEMPLATE = 'data/curriculum/day{N}/data{N}.json';
  const LECTURE_VIDEO_PATH_TEMPLATE = 'data/curriculum/day{N}/lecture{N}.mp4';
  const LECTURE_PDF_PATH_TEMPLATE = 'data/curriculum/day{N}/study{N}.pdf';
  // fallback sample sentences (used if fetch fails)
  const SAMPLE_SENTENCES = [
    {
      "id": 1,
      "korean": "저는 한국 사람입니다.",
      "english": "I am Korean.",
      "japanese": "私は韓国人です。",
      "pronounce_r": "Watashi wa Kankokujin desu.",
      "pronounce_h": "わたし は かんこくじん です。",
      "words": [
        { "korean": "저/나", "japanese": "私", "pronounce_h": "わたし" },
        { "korean": "한국 사람", "japanese": "韓国人", "pronounce_h": "かんこくじん" }
      ]
    },
    {
      "id": 2,
      "korean": "이것은 무엇입니까?",
      "english": "What is this?",
      "japanese": "これは何ですか？",
      "pronounce_r": "Kore wa nan desu ka?",
      "pronounce_h": "これ は なん です か？",
      "words": [
        { "korean": "이것", "japanese": "これ", "pronounce_h": "これ" },
        { "korean": "무엇", "japanese": "何", "pronounce_h": "なん" }
      ]
    }
  ];
  const DAY_TITLE = {
    "1": "저는 ~입니다",
    "2": "~에 ~가 있습니다",
    "3": "나형용사",
    "4": "이형용사",
    "5": "~합니다(동사의 ます형)",
    "6": "조사",
    "7": "~하러 가다/~하고싶다",
    "8": "동사의 て형과 た형",
    "9": "동사 て형의 활용",
    "10": "유용한 동사 활용 표현들",
    "11": "동사 た형의 활용",
    "12": "부정형 정중체",
    "13": "단위 표현과 함께 숫자 세기",
    "14": "~하면(가정법)",
    "15": "가정법 심화",
    "16": "~할 수 있다(동사 가능형)",
    "17": "~라고 합니다/~인 것 같습니다",
    "18": "계획/의지를 나타내는 표현",
    "19": "한자를 읽는 두가지 방법",
    "20": "복습 (1)",
    "21": "복습 (2)",
    "22": "복습 (3)",
    "23": "복습 (4)",
    "24": "복습 (5)",
    "25": "복습 (6)",
    "26": "복습 (7)",
    "27": "복습 (8)",
    "28": "복습 (9)"
  };
  const ROADMAP_GROUPS = [
    { category: "💎 명사", days: [1, 2] },
    { category: "🎨 형용사", days: [3, 4] },
    { category: "🏃 동사 기초", days: [5] },
    { category: "🔗 조사", days: [6] },
    { category: "⚙️ 동사의 활용", days: [7, 8, 9, 10, 11] },
    { category: "🚫 부정과 수량", days: [12, 13] },
    { category: "❓ 가정과 가능", days: [14, 15, 16] },
    { category: "🗣️ 추측과 의지", days: [17, 18] },
    { category: "📚 한자", days: [19] },
    { category: "🔄 패턴 복습", days: [20, 21, 22, 23, 24, 25, 26, 27, 28] }
  ];


  /*********************************************************
   * 2. Storage keys & default progress builders
   *********************************************************/
  const STORAGE_KEY = 'jlpt-letters-progress-v1';
  // sentence progress stored per day key: e.g. jlpt-sentences-day-1
  function sentenceStorageKey(day) { return `jlpt-sentences-day-${day}-v1`; }

  function defaultProgress() {
    return {
      kanaType: 'hiragana',
      boxes: {
        hiragana: [Array.from({ length: HIRAGANA.length }, (_, i) => i), [], [], [], []],
        katakana: [Array.from({ length: KATAKANA.length }, (_, i) => i), [], [], [], []]
      },
      selectedBox: 1
    };
  }

  function defaultSentenceProgressFor(length) {
    return {
      boxes: [Array.from({ length: length }, (_, i) => i), [], [], [], []],
      selectedBox: 1
    };
  }

  function loadProgress() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultProgress();
      progress = JSON.parse(raw)
      // fix selected box value to 1, always 
      progress.selectedBox = 1
      return progress
    } catch (e) {
      console.warn('progress load fail', e);
      return defaultProgress();
    }
  }
  function saveProgress(p) { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); }

  // state
  const state = {
    progress: loadProgress(),
    currentIndexInBox: 0,
    // sentences state:
    sentences: [], // currently loaded day's sentences
    sentenceProgress: null, // per-day progress object (boxes + selectedBox)
    sentenceDay: 1,
    sentenceIndexInBox: 0
  };

  /*********************************************************
   * 3. DOM refs
   *********************************************************/
  const menuBtns = document.querySelectorAll('.menu-button');
  const panels = {
    letters: document.getElementById('letters-panel'),
    grammar: document.getElementById('grammar-panel'),
    sentences: document.getElementById('sentences-panel')
  };
  const initialStateEl = document.getElementById('initial-state');

  // letters UI
  const radioKana = document.getElementsByName('kana');
  const boxBtns = document.querySelectorAll('.box-btn');
  const resetBtn = document.getElementById('reset-progress');
  const boxCountEls = document.querySelectorAll('[data-count]');

  const flashcard = document.getElementById('flashcard');
  const frontEl = flashcard.querySelector('.card-front');
  const backEl = flashcard.querySelector('.card-back');
  const frontHangul = document.getElementById('front-hangul');
  const hintBtn = document.getElementById('hint-btn');
  const flipBtn = document.getElementById('flip-btn');
  const hintArea = document.getElementById('hint-area');
  const hintKeyword = document.getElementById('hint-keyword');
  const hintExplanation = document.getElementById('hint-explanation');
  const backChar = document.getElementById('back-char');
  const backRomaji = document.getElementById('back-romaji');
  const correctBtn = document.getElementById('correct-btn');
  const wrongBtn = document.getElementById('wrong-btn');
  const kanaSvgContainer = document.getElementById("kana-svg-container");
  const replayBtn = document.getElementById("replay-btn");
  const emptyState = document.getElementById('empty-state');

  // lectures UI
  const lectureVideo = document.getElementById('lecture-video')
  const lecturePdf = document.getElementById('lecture-pdf')
  const lectureSource = document.getElementById('lecture-source')
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  // sentences UI
  const daySelect = document.getElementById('day-select-s');
  const daySelectG = document.getElementById('day-select-g');
  const sentenceBoxBtns = document.querySelectorAll('.sentence-box-btn');
  const sCountEls = document.querySelectorAll('[data-scount]');
  const resetSentencesBtn = document.getElementById('reset-sentences');

  const sentenceCard = document.getElementById('sentence-card');
  const sFrontEl = sentenceCard.querySelector('.card-front')
  const sBackEl = sentenceCard.querySelector('.card-back')
  const sFrontKr = document.getElementById('s-front-kr');
  const sHints = document.getElementById('s-hints');
  const sHintBtn = document.getElementById('s-hint-btn');
  const sFlipBtn = document.getElementById('s-flip-btn');
  const sHintArea = document.getElementById('s-hint-area');
  const sHintExplain = document.getElementById('s-hint-explain');
  const sBackKr = document.getElementById('s-back-kr');
  const sBackJp = document.getElementById('s-back-jp');
  const sBackSoundBtn = document.getElementById('s-back-sound');
  const sBackPron = document.getElementById('s-back-pron');
  const sCorrectBtn = document.getElementById('s-correct-btn');
  const sWrongBtn = document.getElementById('s-wrong-btn');
  const sEmpty = document.getElementById('sentence-empty');

  const jpAudio = new Audio();
  jpAudio.preload = "auto";

  /*********************************************************
   * 4. Helper functions (letters)
   *********************************************************/
  function currentKanaArray() { return state.progress.kanaType === 'hiragana' ? HIRAGANA : KATAKANA; }
  function getBoxArray(n) { return state.progress.boxes[state.progress.kanaType][n - 1]; }
  function setBoxArray(n, arr) { state.progress.boxes[state.progress.kanaType][n - 1] = arr; saveProgress(state.progress); renderCounts(); }
  function renderCounts() {
    const type = state.progress.kanaType;
    for (let i = 1; i <= 5; i++) {
      const cnt = state.progress.boxes[type][i - 1].length;
      const el = document.querySelector(`[data-count="${i}"]`);
      if (el) el.textContent = cnt;
    }
  }
  function setActiveBoxBtn(n) {
    boxBtns.forEach(b => b.classList.toggle('active', Number(b.dataset.box) === n));
    ;
  }

  function getCurrentCard() {
    console.log(`get current card state:`)
    console.log(state.progress.selectedBox)

    const arr = getBoxArray(state.progress.selectedBox);
    if (!arr || arr.length === 0) return null;

    console.log(arr)

    if (state.currentIndexInBox >= arr.length) state.currentIndexInBox = 0;
    const idx = arr[state.currentIndexInBox];
    return { boxLength: arr.length, itemIdx: idx, data: currentKanaArray()[idx] };
  }

  function createKanaSVG(kana) {
    if (!kana.svg) return null;

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", kana.svg.viewBox);
    svg.classList.add("kana-svg");

    kana.svg.strokes.forEach((d, i) => {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", d);
      path.style.animationDelay = `${i * 0.8}s`;
      svg.appendChild(path);
    });

    return svg;
  }

  function replaySVG(svg) {
    if (!svg) return;

    svg.querySelectorAll("path").forEach(p => {
      p.style.animation = "none";
      p.getBoundingClientRect(); // force reflow
      p.style.animation = "";
    });
  }

  function renderCard() {
    const card = getCurrentCard();
    if (!card) {
      flashcard.hidden = true;
      emptyState.hidden = false;
      return;
    }

    flashcard.hidden = false;
    emptyState.hidden = true;

    frontEl.hidden = false;
    backEl.hidden = true;

    // front
    frontHangul.textContent = card.data.hangul || card.data.romaji;
    hintKeyword.textContent = card.data.keyword || '';
    hintExplanation.textContent = card.data.explanation || '';
    hintArea.hidden = true;

    // // back (텍스트)
    // backChar.textContent = card.data.char;
    // backRomaji.textContent = card.data.romaji;

    // 🔹 SVG 처리
    kanaSvgContainer.innerHTML = ""; // 이전 SVG 제거
    const svg = createKanaSVG(card.data);
    if (svg) {
      kanaSvgContainer.appendChild(svg);
      replayBtn.onclick = () => replaySVG(svg);
      replayBtn.hidden = false;
    } else {
      replayBtn.hidden = true;
    }
  }

  function moveCard(itemIdx, fromBox, toBox) {
    const arrFrom = getBoxArray(fromBox);
    const pos = arrFrom.indexOf(itemIdx);
    if (pos !== -1) arrFrom.splice(pos, 1);
    const arrTo = getBoxArray(toBox);
    arrTo.push(itemIdx);
    saveProgress(state.progress);
    if (state.currentIndexInBox >= arrFrom.length) state.currentIndexInBox = 0;
    renderCounts();
  }
  function handleCorrect() {
    const card = getCurrentCard();
    if (!card) return;
    const curr = state.progress.selectedBox;
    const next = Math.min(5, curr + 1);

    const isLastCard = card.boxLength - 1 == state.currentIndexInBox
    if (isLastCard) alert("🎉 해당 박스의 모든 카드를 학습했습니다.")

    moveCard(card.itemIdx, curr, next);
    renderCard();
  }

  function handleWrong() {
    const card = getCurrentCard();
    if (!card) return;

    const isLastCard = card.boxLength - 1 == state.currentIndexInBox
    if (isLastCard) alert("🎉 해당 박스의 모든 카드를 학습했습니다.")

    moveCard(card.itemIdx, state.progress.selectedBox, 1);
    renderCard();
  }

  /*********************************************************
   * 5. Sentence data loader & progress (per day)
   *********************************************************/
  function keyForDay(day) { return sentenceStorageKey(day); }

  async function loadSentencesForDay(day) {
    state.sentenceDay = day;
    // attempt fetch
    const path = SENTENCE_JSON_PATH_TEMPLATE.replace(/{N}/g, String(day));
    try {
      const res = await fetch(path, { cache: "no-cache" });
      if (!res.ok) throw new Error('fetch fail');
      const json = await res.json();
      if (!Array.isArray(json) || json.length === 0) throw new Error('bad json');
      state.sentences = json;
    } catch (e) {
      console.warn('sentence fetch failed, using fallback sample', e);
      state.sentences = SAMPLE_SENTENCES.slice(); // fallback
    }
    // load or init sentence progress for this day
    const raw = localStorage.getItem(keyForDay(day));
    if (!raw) {
      state.sentenceProgress = defaultSentenceProgressFor(state.sentences.length);
      localStorage.setItem(keyForDay(day), JSON.stringify(state.sentenceProgress));
    } else {
      try {
        const parsed = JSON.parse(raw);
        // to set selected box to 1 always
        parsed.selectedBox = 1;

        // if mismatch in total count, reset to default
        const totalCount = (parsed.boxes || []).reduce((a, b) => a + (b?.length || 0), 0);
        if (totalCount !== state.sentences.length) {
          state.sentenceProgress = defaultSentenceProgressFor(state.sentences.length);
          localStorage.setItem(keyForDay(day), JSON.stringify(state.sentenceProgress));
        } else {
          state.sentenceProgress = parsed;
        }
      } catch {
        state.sentenceProgress = defaultSentenceProgressFor(state.sentences.length);
        localStorage.setItem(keyForDay(day), JSON.stringify(state.sentenceProgress));
      }
    }
    state.sentenceIndexInBox = 0;
    renderSentenceCounts();
    renderSentenceCard();
  }

  function saveSentenceProgress() {
    localStorage.setItem(keyForDay(state.sentenceDay), JSON.stringify(state.sentenceProgress));
  }

  function getSentenceBoxArray(n) {
    return state.sentenceProgress.boxes[n - 1];
  }

  function renderSentenceCounts() {
    for (let i = 1; i <= 5; i++) {
      const cnt = getSentenceBoxArray(i).length;
      const el = document.querySelector(`[data-scount="${i}"]`);
      if (el) el.textContent = cnt;
    }
  }

  function setActiveSentenceBoxBtn(n) {
    sentenceBoxBtns.forEach(b => b.classList.toggle('active', Number(b.dataset.box) === n));
  }

  function getCurrentSentence() {
    const selected = state.sentenceProgress.selectedBox;
    const arr = getSentenceBoxArray(selected);
    if (!arr || arr.length === 0) return null;
    if (state.sentenceIndexInBox >= arr.length) state.sentenceIndexInBox = 0;
    const itemIdx = arr[state.sentenceIndexInBox];
    return { boxLength: arr.length, itemIdx, data: state.sentences[itemIdx] };
  }

  function renderSentenceCard() {
    const cur = getCurrentSentence();
    if (!cur) {
      sentenceCard.hidden = true;
      sEmpty.hidden = false;
      return;
    }

    console.log(state)

    sentenceCard.hidden = false;
    sEmpty.hidden = true;
    // show front
    sFrontEl.hidden = false;
    sBackEl.hidden = true;
    const d = cur.data;
    sFrontKr.textContent = d.korean;

    // populate hints list: words
    sHints.innerHTML = '';
    if (Array.isArray(d.words)) {
      d.words.forEach(w => {
        const li = document.createElement('li');
        li.textContent = `${w.korean}: ${w.japanese}(${w.pronounce_h || ''})`;
        sHints.appendChild(li);
      });

      if (d.words.length == 0) {
        const p = document.createElement('p');
        p.textContent = `❗️ 제공할 힌트 단어가 없습니다.`
        sHints.appendChild(p);
      }
    }
    sHintArea.hidden = true;
    // back
    sBackKr.textContent = d.korean;
    sBackJp.textContent = d.japanese;
    sBackPron.textContent = d.pronounce_h || d.pronounce_r || '';
  }

  function moveSentence(itemIdx, fromBox, toBox) {
    const fromArr = state.sentenceProgress.boxes[fromBox - 1];
    const pos = fromArr.indexOf(itemIdx);
    if (pos !== -1) fromArr.splice(pos, 1);
    const toArr = state.sentenceProgress.boxes[toBox - 1];
    toArr.push(itemIdx);
    saveSentenceProgress();
    if (state.sentenceIndexInBox >= fromArr.length) state.sentenceIndexInBox = 0;
    renderSentenceCounts();
  }

  function handleSentenceCorrect() {
    const cur = getCurrentSentence();
    if (!cur) return;
    const curr = state.sentenceProgress.selectedBox;
    const next = Math.min(5, curr + 1);

    const isLastCard = cur.boxLength - 1 == state.sentenceIndexInBox
    if (isLastCard) alert("🎉 해당 박스의 모든 카드를 학습했습니다.")

    moveSentence(cur.itemIdx, curr, next);
    renderSentenceCard();
  }

  function handleSentenceWrong() {
    const cur = getCurrentSentence();
    if (!cur) return;

    const isLastCard = cur.boxLength - 1 == state.sentenceIndexInBox
    if (isLastCard) alert("🎉 해당 박스의 모든 카드를 학습했습니다.")

    moveSentence(cur.itemIdx, state.sentenceProgress.selectedBox, 1);
    renderSentenceCard();
  }

  async function loadLectureForDay(day) {
    const pdfPath = LECTURE_PDF_PATH_TEMPLATE.replace(/{N}/g, String(day));
    const videoPath = LECTURE_VIDEO_PATH_TEMPLATE.replace(/{N}/g, String(day));

    try {
      // check if pdf is existed
      const pdfResponse = await fetch(pdfPath, { method: "HEAD" });
      if (!pdfResponse.ok) {
        throw new Error("PDF not found");
      }
      lecturePdf.href = pdfPath;
      lecturePdf.innerText = `Day ${day} pdf 강의자료 다운로드`;
      // check if video is existed
      const response = await fetch(videoPath, { method: "HEAD" });
      if (!response.ok) {
        throw new Error("Video not found");
      }
      lectureSource.src = videoPath;
      lectureVideo.load();
    } catch (e) {
      console.log(e);
      window.alert(`🙇🏻‍♀️ Day ${day}(은)는 학습자료만 이용 가능합니다.`);
    }
  }

  /*********************************************************
   * 6. Events binding
   *********************************************************/
  // top menu
  menuBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // first:  set selected box to 1 when navigate menus
      setActiveBoxBtn(1)
      state.progress.selectedBox = 1
      if (state.sentenceProgress) {
        state.sentenceProgress.selectedBox = 1
      }
      saveProgress(state)

      // and then: render cards
      const panel = btn.dataset.menu;
      if (initialStateEl) initialStateEl.classList.add('hidden');
      Object.keys(panels).forEach(key => {
        panels[key].classList.toggle('hidden', key !== panel);
      });
      menuBtns.forEach(b => b.classList.toggle('active', b === btn));
      if (panel === 'letters') {
        renderCounts();
        renderCard();
      }
      if (panel === 'sentences') {
        // ensure day select populated then load current day
        populateDaySelect(daySelect);
        loadSentencesForDay(state.sentenceDay);
      }
      if (panel === 'grammar') {
        populateDaySelect(daySelectG)
        loadLectureForDay(1)
      }
    });
  });

  // letters controls
  radioKana.forEach(r => r.addEventListener('change', e => {
    if (e.target.checked) {
      state.progress.kanaType = e.target.value;
      saveProgress(state.progress);
      renderCounts();
      renderCard();
    }
  }));
  boxBtns.forEach(b => b.addEventListener('click', () => {
    const n = Number(b.dataset.box);
    state.progress.selectedBox = n;
    state.currentIndexInBox = 0;
    setActiveBoxBtn(n);
    renderCard();
  }));
  hintBtn.addEventListener('click', () => hintArea.hidden = !hintArea.hidden);
  flipBtn.addEventListener('click', () => { backEl.hidden = !backEl.hidden; frontEl.hidden = !frontEl.hidden; });
  correctBtn.addEventListener('click', handleCorrect);
  wrongBtn.addEventListener('click', handleWrong);
  resetBtn.addEventListener('click', () => {
    if (!confirm(`❗️ 글자 학습 진행을 초기화하시겠습니까? \n (모든 카드가 box1으로 이동)`)) return;
    state.progress = defaultProgress();
    saveProgress(state.progress);
    state.currentIndexInBox = 0;
    radioKana.forEach(r => r.checked = (r.value === state.progress.kanaType));
    setActiveBoxBtn(1);
    renderCounts();
    renderCard();
  });

  // keyboard for letters
  document.addEventListener('keydown', (e) => {
    if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) return;
    if (e.code === 'Space') { e.preventDefault(); flipBtn.click(); }
    if (e.key === 'ArrowRight') { const arr = getBoxArray(state.progress.selectedBox); if (arr && arr.length > 0) { state.currentIndexInBox = (state.currentIndexInBox + 1) % arr.length; renderCard(); } }
    if (e.key === 'ArrowLeft') { const arr = getBoxArray(state.progress.selectedBox); if (arr && arr.length > 0) { state.currentIndexInBox = (state.currentIndexInBox - 1 + arr.length) % arr.length; renderCard(); } }
  });

  // sentences controls
  function populateDaySelect(element) {
    if (element.options.length === 0) {
      for (let d = 1; d <= 28; d++) {
        const opt = document.createElement('option');
        opt.value = d;
        opt.textContent = `${d}. ${DAY_TITLE[d]}`;
        element.appendChild(opt);
      }
      element.value = String(state.sentenceDay || 1);
    }
  }
  daySelect.addEventListener('change', (e) => {
    const d = Number(e.target.value);
    setActiveSentenceBoxBtn(1);
    state.sentenceProgress.selectedBox = 1;
    state.sentenceDay = d;
    loadSentencesForDay(d);
  });

  daySelectG.addEventListener('change', (e) => {
    const d = Number(e.target.value);
    loadLectureForDay(d);
  });

  sentenceBoxBtns.forEach(b => {
    b.addEventListener('click', () => {
      const n = Number(b.dataset.box);
      state.sentenceProgress.selectedBox = n;
      state.sentenceIndexInBox = 0;
      setActiveSentenceBoxBtn(n);
      renderSentenceCard();
    });
  });

  // japanese sentence sounds
  function playJapaneseTTS(sentenceId, day) {

    jpAudio.pause();
    jpAudio.currentTime = 0;

    jpAudio.src = `data/curriculum/day${day}/tts_jp/jp_${sentenceId}.wav`;
    jpAudio.play().catch(err => {
      console.error("Audio play failed:", err);
    });
  }

  sBackSoundBtn.addEventListener('click', () => {
    const cur = getCurrentSentence()
    if (!cur) return;

    const curDay = state.sentenceDay
    const curId = cur.data.id
    playJapaneseTTS(curId, curDay)
  })


  sHintBtn.addEventListener('click', () => sHintArea.hidden = !sHintArea.hidden);
  sFlipBtn.addEventListener('click', () => { const front = sentenceCard.querySelector('.card-front'); const back = sentenceCard.querySelector('.card-back'); back.hidden = !back.hidden; front.hidden = !front.hidden; });
  sCorrectBtn.addEventListener('click', handleSentenceCorrect);
  sWrongBtn.addEventListener('click', handleSentenceWrong);

  resetSentencesBtn.addEventListener('click', () => {
    if (!confirm(`❗️ 이 Day의 문장 학습 진행을 초기화하시겠습니까? \n (모든 카드가 box1으로 이동)`)) return;
    state.sentenceProgress = defaultSentenceProgressFor(state.sentences.length);
    saveSentenceProgress();
    state.sentenceIndexInBox = 0;
    setActiveSentenceBoxBtn(1);
    renderSentenceCounts();
    renderSentenceCard();
  });

  // keyboard for sentences
  document.addEventListener('keydown', (e) => {
    if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) return;
    // when sentences panel visible and focused:
    const sentencesVisible = !panels.sentences.classList.contains('hidden');
    if (!sentencesVisible) return;
    if (e.code === 'Space') { e.preventDefault(); sFlipBtn.click(); }
    if (e.key === 'ArrowRight') { const arr = getSentenceBoxArray(state.sentenceProgress.selectedBox); if (arr && arr.length > 0) { state.sentenceIndexInBox = (state.sentenceIndexInBox + 1) % arr.length; renderSentenceCard(); } }
    if (e.key === 'ArrowLeft') { const arr = getSentenceBoxArray(state.sentenceProgress.selectedBox); if (arr && arr.length > 0) { state.sentenceIndexInBox = (state.sentenceIndexInBox - 1 + arr.length) % arr.length; renderSentenceCard(); } }
  });

  // set thumbnails
  lectureVideo.addEventListener("loadeddata", () => {
    canvas.width = lectureVideo.videoWidth;
    canvas.height = lectureVideo.videoHeight;

    ctx.drawImage(lectureVideo, 0, 0, canvas.width, canvas.height);
    const thumbnail = canvas.toDataURL("image/png");

    lectureVideo.setAttribute("poster", thumbnail);
  });

  // initial page - roadmap

  function renderRoadmap() {
    // 1. 카드 만들기
    const list = document.getElementById('milestones-list');
    if (!list) return;

    list.innerHTML = ''; // 초기화

    ROADMAP_GROUPS.forEach(group => {
      // 그룹 제목 추가
      const groupTitle = document.createElement('div');
      groupTitle.className = 'group-category-title';
      groupTitle.innerText = group.category;
      list.appendChild(groupTitle);

      // 해당 그룹 내의 Day 카드들 생성
      group.days.forEach(dayNum => {
        const card = document.createElement('div');
        card.className = 'milestone-card';
        card.innerHTML = `
                <span class="day-badge">DAY ${dayNum}</span>
                <span class="day-title">${DAY_TITLE[dayNum]}</span>
            `;

        // 기존 클릭 이벤트 로직
        card.onclick = () => {
          const dayStr = String(dayNum);
            document.querySelector('[data-menu="grammar"]').click();
            const selectL = document.getElementById('day-select-g');
            if (selectL) { selectL.value = dayStr; selectL.dispatchEvent(new Event('change')); }
        };
        list.appendChild(card);
      });
    });
  }

  /*********************************************************
   * 7. Initialization
   *********************************************************/
  function normalizeProgress() {
    const p = state.progress;
    if (!p.boxes || !p.boxes.hiragana || !p.boxes.katakana) {
      state.progress = defaultProgress();
      saveProgress(state.progress);
    } else {
      const sumH = p.boxes.hiragana.reduce((a, b) => a + b.length, 0);
      if (sumH !== HIRAGANA.length) p.boxes.hiragana = [Array.from({ length: HIRAGANA.length }, (_, i) => i), [], [], [], []];
      const sumK = p.boxes.katakana.reduce((a, b) => a + b.length, 0);
      if (sumK !== KATAKANA.length) p.boxes.katakana = [Array.from({ length: KATAKANA.length }, (_, i) => i), [], [], [], []];
      saveProgress(state.progress);
    }
  }

  function initUI() {
    if (initialStateEl) initialStateEl.classList.remove('hidden');
    radioKana.forEach(r => r.checked = (r.value === state.progress.kanaType));
    setActiveBoxBtn(state.progress.selectedBox);
    populateDaySelect(daySelect);
    populateDaySelect(daySelectG)
    renderRoadmap()
  }

  normalizeProgress();
  initUI();

})();
