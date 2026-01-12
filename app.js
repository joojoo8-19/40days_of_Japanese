// app.js
(() => {
  /*********************************************************
   * 0. 설정
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

  /*********************************************************
   * 1. hiragana / katakana data
   *********************************************************/
  const HIRAGANA = [
    { "char": "あ", "romaji": "a", "hangul": "아", "keyword": "아기", "explanation": "둥근 고리 부분과 위에 얹힌 획이 아기가 웅크린 채 머리를 숙인 모습을 닮았습니다." },
    { "char": "い", "romaji": "i", "hangul": "이", "keyword": "이빨", "explanation": "곧게 위로 뻗은 두 개의 획이 두 개의 이빨 모양처럼 보입니다." },
    { "char": "う", "romaji": "u", "hangul": "우", "keyword": "우산", "explanation": "글자의 마지막 휜 곡선이 우산 손잡이 모양과 비슷합니다." },
    { "char": "え", "romaji": "e", "hangul": "에", "keyword": "엘리펀트(elephant)", "explanation": "글자의 곡선 부분이 코끼리의 코처럼 길게 휘어져 내려오는 것을 연상해 보세요." },
    { "char": "お", "romaji": "o", "hangul": "오", "keyword": "오리", "explanation": "오리의 둥근 몸통 위에 짧은 획이 부리처럼 살짝 얹혀있는 모습입니다." },
    { "char": "か", "romaji": "ka", "hangul": "카", "keyword": "카드 1", "explanation": "글자의 각진 형태가 카드 모서리를 닮았고, 오른쪽 위 작은 점은 카드에 표기된 숫자 1처럼 보입니다." },
    { "char": "き", "romaji": "ki", "hangul": "키", "keyword": "키(key)", "explanation": "세 개의 획과 마지막 곡선이 열쇠 머리와 톱니 모양을 연상시킵니다." },
    { "char": "く", "romaji": "ku", "hangul": "쿠", "keyword": "쿠션", "explanation": "옆으로 뉘어진 삼각 쿠션 모양을 닮았습니다." },
    { "char": "け", "romaji": "ke", "hangul": "케", "keyword": "케이블", "explanation": "왼쪽의 긴 세로 획은 케이블이고, 오른쪽 획은 케이블을 걸어 둔 고리 모양처럼 보입니다." },
    { "char": "こ", "romaji": "ko", "hangul": "코", "keyword": "코끼리", "explanation": "나란한 두 개의 선이 튼튼한 코끼리 다리 두 개를 연상시킵니다." },
    { "char": "さ", "romaji": "sa", "hangul": "사", "keyword": "선비 사", "explanation": "위쪽 획이 갓을 쓴 모양이고 아래가 선비의 얼굴 모양처럼 보입니다." },
    { "char": "し", "romaji": "shi", "hangul": "시", "keyword": "시작선", "explanation": "웅크린 자세로 달리기 시작선에 준비하고 있는 주자의 옆모습을 닮았습니다." },
    { "char": "す", "romaji": "su", "hangul": "스", "keyword": "스트로우(straw)", "explanation": "둥글게 말린 빨대(스트로우) 모양과 아래로 내려온 획을 연결해 보세요." },
    { "char": "せ", "romaji": "se", "hangul": "세", "keyword": "세상 세", "explanation": "한자 '世(세상 세)'의 형태와 매우 유사하다는 점을 활용해 기억하세요." },
    { "char": "そ", "romaji": "so", "hangul": "소", "keyword": "소용돌이", "explanation": "글자의 끝 부분이 힘차게 안쪽으로 말리는 모양이 소용돌이를 연상시킵니다." },
    { "char": "た", "romaji": "ta", "hangul": "타", "keyword": "타이어", "explanation": "위쪽은 오토바이의 몸체, 아래 곡선은 두 개의 타이어를 옆에서 본 모습처럼 보입니다." },
    { "char": "ち", "romaji": "chi", "hangul": "치", "keyword": "치타", "explanation": "오른쪽으로 솟아오른 곡선이 달리는 치타의 엉덩이와 꼬리를 연상시킵니다." },
    { "char": "つ", "romaji": "tsu", "hangul": "츠/쯔(가까운 소리)", "keyword": "추(무게추)", "explanation": "위에서 끈에 매달려 아래로 쏠린 금속 추(무게추)의 단면처럼 보입니다." },
    { "char": "て", "romaji": "te", "hangul": "테", "keyword": "테이블", "explanation": "옆으로 길게 뻗은 수평선이 테이블 상판을 옆에서 본 모습처럼 보입니다." },
    { "char": "と", "romaji": "to", "hangul": "토", "keyword": "토끼", "explanation": "상단의 짧은 두 획이 토끼의 쫑긋한 두 귀처럼 보입니다." },
    { "char": "な", "romaji": "na", "hangul": "나", "keyword": "나무", "explanation": "나무의 줄기와 복잡하게 엉킨 잎이나 가지의 모습을 연상시킵니다." },
    { "char": "に", "romaji": "ni", "hangul": "니", "keyword": "니은(ㄴ)", "explanation": "두 개의 획이 마치 한국어 자음 'ㄴ(니은)'의 변형된 모양처럼 보입니다." },
    { "char": "ぬ", "romaji": "nu", "hangul": "누", "keyword": "누들(noodle)", "explanation": "젓가락으로 구불거리는 면발(누들)을 잡고 들어 올린 모양을 연상시킵니다." },
    { "char": "ね", "romaji": "ne", "hangul": "네", "keyword": "네코(neko)", "explanation": "아래로 둥글게 감아 올린 마지막 획이 네코(고양이)의 꼬리 모양을 연상시킵니다." },
    { "char": "の", "romaji": "no", "hangul": "노", "keyword": "노(no) 표지판", "explanation": "둥글게 말린 형태가 마치 'No(금지)' 표지판의 원형을 연상시킵니다." },
    { "char": "は", "romaji": "ha", "hangul": "하", "keyword": "하마", "explanation": "중앙의 긴 수직 획과 좌우의 획이 하마의 크고 두꺼운 실루엣을 나타냅니다." },
    { "char": "ひ", "romaji": "hi", "hangul": "히", "keyword": "히히", "explanation": "글자 모양이 히히 하고 옆으로 길게 웃는 입 모양을 닮았습니다." },
    { "char": "ふ", "romaji": "fu", "hangul": "후", "keyword": "후드티", "explanation": "좌우의 짧은 획은 주머니에 넣은 손, 중앙의 큰 획은 후드티를 입은 사람의 형태를 연상시킵니다." },
    { "char": "へ", "romaji": "he", "hangul": "헤", "keyword": "헤드폰", "explanation": "좌우로 대칭되는 모양이 머리 위에 쓴 헤드폰 밴드를 닮았습니다." },
    { "char": "ほ", "romaji": "ho", "hangul": "호", "keyword": "호스", "explanation": "위쪽의 두 획은 수도꼭지, 아래로 이어진 획은 호스를 연상시킵니다." },
    { "char": "ま", "romaji": "ma", "hangul": "마", "keyword": "마라톤", "explanation": "아래쪽 곡선이 마라톤 선수가 달릴 때 앞으로 뻗은 다리를 연상시킵니다." },
    { "char": "み", "romaji": "mi", "hangul": "미", "keyword": "미역", "explanation": "세 개의 획이 미역 줄기가 물속에서 흔들리는 모양처럼 보입니다." },
    { "char": "む", "romaji": "mu", "hangul": "무", "keyword": "무(채소)", "explanation": "둥근 머리 부분과 아래쪽으로 꼬인 획이 무의 형태를 닮았습니다." },
    { "char": "め", "romaji": "me", "hangul": "메", "keyword": "메달", "explanation": "글자의 모양이 갈고리에 리본이 달린 메달을 걸어 놓은 것처럼 보입니다." },
    { "char": "も", "romaji": "mo", "hangul": "모", "keyword": "모자", "explanation": "위쪽 획은 모자의 정수리 버튼이나 장식, 아래 획은 모자의 챙을 연상시킵니다." },
    { "char": "や", "romaji": "ya", "hangul": "야", "keyword": "야자수", "explanation": "세로 기둥과 위쪽의 갈라진 획이 야자수 나무와 잎 실루엣을 연상시킵니다." },
    { "char": "ゆ", "romaji": "yu", "hangul": "유", "keyword": "유모차", "explanation": "둥근 틀과 손잡이가 바퀴 달린 유모차의 구조를 닮았습니다." },
    { "char": "よ", "romaji": "yo", "hangul": "요", "keyword": "요요", "explanation": "두 개의 동그란 획이 요요처럼 위아래로 나란히 있는 모양을 연상시킵니다." },
    { "char": "ら", "romaji": "ra", "hangul": "라", "keyword": "라이터", "explanation": "위쪽의 작은 획은 라이터 불꽃, 아래의 둥근 부분은 라이터 몸통을 연상시킵니다." },
    { "char": "り", "romaji": "ri", "hangul": "리", "keyword": "리본", "explanation": "두 개의 획이 나란히 늘어진 리본 끈처럼 보입니다." },
    { "char": "る", "romaji": "ru", "hangul": "루", "keyword": "캥거루", "explanation": "둥글게 말린 아래쪽이 캥거루의 주머니와 다리를 연상시킵니다." },
    { "char": "れ", "romaji": "re", "hangul": "레", "keyword": "레일", "explanation": "중간은 길게 뻗어있고, 아래쪽 곡선이 여러 갈래로 나뉜 철도 레일처럼 보입니다." },
    { "char": "ろ", "romaji": "ro", "hangul": "로", "keyword": "로프", "explanation": "둥글게 말린 형태가 밧줄(로프)이 꼬여 있는 모양과 비슷합니다." },
    { "char": "わ", "romaji": "wa", "hangul": "와", "keyword": "와(감탄사)", "explanation": "글자의 형태가 놀라거나 감탄하며 입을 크게 벌린 모양을 형상화합니다." },
    { "char": "を", "romaji": "wo", "hangul": "오/워", "keyword": "오리발", "explanation": "퍼진 형태가 물갈퀴 달린 오리발 모양을 연상시킵니다." },
    { "char": "ん", "romaji": "n", "hangul": "응/ㄴ", "keyword": "응~", "explanation": "글자의 곡선이 '응~' 하고 대답할 때의 물결치는 듯한 느낌을 표현합니다." }
  ];

  const KATAKANA = [
    { "char": "ア", "romaji": "a", "hangul": "아", "keyword": "아이스크림", "explanation": "수직선 위에 짧은 획들이 얹힌 모양이 아이스크림 막대 위에 크림이 솟아오른 것을 연상시킵니다." },
    { "char": "イ", "romaji": "i", "hangul": "이", "keyword": "이쑤시개", "explanation": "두 개의 획이 이쑤시개와 비스듬한 치아를 연상시키는 모습입니다." },
    { "char": "ウ", "romaji": "u", "hangul": "우", "keyword": "우산", "explanation": "윗부분이 뾰족하고 아래로 내려오는 모양이 우산 손잡이처럼 휘어져 있습니다." },
    { "char": "エ", "romaji": "e", "hangul": "에", "keyword": "엘리베이터", "explanation": "수직선과 두 개의 꺾인 획이 닫힌 엘리베이터 문의 각진 형태처럼 보입니다." },
    { "char": "オ", "romaji": "o", "hangul": "오", "keyword": "오리배", "explanation": "넓고 각진 아래 구조가 물 위에 둥둥 떠 있는 오리배의 실루엣을 닮았습니다." },
    { "char": "カ", "romaji": "ka", "hangul": "카", "keyword": "카메라", "explanation": "각진 외형과 작은 획이 카메라 본체를 단순화한 것처럼 보입니다." },
    { "char": "キ", "romaji": "ki", "hangul": "키", "keyword": "키(key)", "explanation": "세 개의 평행선과 이를 가로지르는 획이 열쇠(key) 모양을 연상시킵니다." },
    { "char": "ク", "romaji": "ku", "hangul": "쿠", "keyword": "쿠션", "explanation": "꺾여 있는 하나의 획이 눌린 사각 쿠션의 모서리처럼 보입니다." },
    { "char": "ケ", "romaji": "ke", "hangul": "케", "keyword": "케이크", "explanation": "케이크 상단 단면 아래로 생크림이 길게 흘러내리는 듯한 모양을 연상하게 합니다." },
    { "char": "コ", "romaji": "ko", "hangul": "코", "keyword": "코너(corner)", "explanation": "오른쪽이 막힌 'ㄷ'자 형태로, 방의 코너나 상자의 윗부분처럼 보입니다." },
    { "char": "サ", "romaji": "sa", "hangul": "사", "keyword": "사다리", "explanation": "세 줄의 획이 사다리의 발판(단)과 이를 지지하는 기둥을 연상시킵니다." },
    { "char": "シ", "romaji": "shi", "hangul": "시", "keyword": "시계바늘", "explanation": "세 개의 짧은 획이 시계바늘처럼 아래에서 위로 방사형으로 뻗어 올라가는 모양입니다." },
    { "char": "ス", "romaji": "su", "hangul": "스", "keyword": "스탠드", "explanation": "수직 기둥과 이를 가로지르는 획이 세워놓은 스탠드 조명 기둥과 받침 구조를 연상시킵니다." },
    { "char": "セ", "romaji": "se", "hangul": "세", "keyword": "가늘 세", "explanation": "세 개의 수평선과 수직선이 한글 자음 'ㄱ'과 'ㄴ'이 합쳐진 듯한 형태를 가집니다." },
    { "char": "ソ", "romaji": "so", "hangul": "소", "keyword": "소나기", "explanation": "두 개의 대각선 획이 비가 사선으로 쏟아지는 소나기의 모습을 연상하게 합니다." },
    { "char": "タ", "romaji": "ta", "hangul": "타", "keyword": "타워", "explanation": "윗부분의 획과 아래의 수직선이 단순한 타워 건물의 구조를 닮았습니다." },
    { "char": "チ", "romaji": "chi", "hangul": "치", "keyword": "치즈", "explanation": "각진 모양이 모서리가 잘린 치즈 조각의 단면을 연상시킵니다." },
    { "char": "ツ", "romaji": "tsu", "hangul": "츠/쯔", "keyword": "츠나미(쓰나미)", "explanation": "세 개의 짧은 획이 물결이 튀는 듯한 방향성을 나타내며 쓰나미를 연상시킵니다." },
    { "char": "テ", "romaji": "te", "hangul": "테", "keyword": "테이블", "explanation": "수평선과 수직선이 테이블의 상판과 다리를 닮았습니다." },
    { "char": "ト", "romaji": "to", "hangul": "토", "keyword": "토치(torch)", "explanation": "길쭉한 수직 본체와 오른쪽의 짧은 획이 토치(torch)의 점화 버튼처럼 보입니다." },
    { "char": "ナ", "romaji": "na", "hangul": "나", "keyword": "나무", "explanation": "세로줄과 가로줄이 나무 가지가 갈라지는 모습과 비슷합니다." },
    { "char": "ニ", "romaji": "ni", "hangul": "니", "keyword": "니트", "explanation": "두 개의 평행한 수평선이 니트 짜임의 줄무늬를 떠올리게 합니다. 한자 '이(二)'와 같습니다." },
    { "char": "ヌ", "romaji": "nu", "hangul": "누", "keyword": "누텔라 뚜껑", "explanation": "꺾이는 획이 누텔라 뚜껑 모양에 초콜릿 소스가 묻어 흘러내리는 모습을 연상하게 합니다." },
    { "char": "ネ", "romaji": "ne", "hangul": "네", "keyword": "네잎클로버", "explanation": "곡선과 짧은 점들이 네잎클로버의 잎맥이나 복잡한 줄기처럼 연결된 모습을 연상시킵니다." },
    { "char": "ノ", "romaji": "no", "hangul": "노", "keyword": "노즈(nose)", "explanation": "대각선 하나의 획이 사람의 코(nose) 옆모습처럼 길게 뻗어 있습니다." },
    { "char": "ハ", "romaji": "ha", "hangul": "하", "keyword": "하프", "explanation": "두 개의 사선이 현악기 하프의 옆모습처럼 대칭되는 모양입니다." },
    { "char": "ヒ", "romaji": "hi", "hangul": "히", "keyword": "히터", "explanation": "세로로 꺾인 두 개의 획이 히터 기둥이나 발열체의 모양과 가깝습니다." },
    { "char": "フ", "romaji": "fu", "hangul": "후", "keyword": "후드티 주머니", "explanation": "아래가 넓게 벌어진 모양이 후드티의 아래자락이나 주머니 입구를 닮았습니다." },
    { "char": "ヘ", "romaji": "he", "hangul": "헤", "keyword": "헤드셋", "explanation": "약간 올라간 하나의 획이 머리 위에 쓴 헤드셋 밴드를 단순화한 모습입니다." },
    { "char": "ホ", "romaji": "ho", "hangul": "호", "keyword": "호수", "explanation": "세로선과 점 두 개가 호수 위에 떠 있는 물방울이나 작은 섬처럼 보입니다." },
    { "char": "マ", "romaji": "ma", "hangul": "마", "keyword": "마술봉", "explanation": "두 개의 꺾인 획이 마술봉의 머리 부분을 닮은 마름모꼴을 연상시킵니다." },
    { "char": "ミ", "romaji": "mi", "hangul": "미", "keyword": "미로", "explanation": "세 개의 짧은 선이 복잡한 미로의 길처럼 나란히 이어져 있습니다." },
    { "char": "ム", "romaji": "mu", "hangul": "무", "keyword": "무등산", "explanation": "오른쪽으로 꺾이는 획이 산의 봉우리를 연상하게 합니다." },
    { "char": "メ", "romaji": "me", "hangul": "메", "keyword": "메모", "explanation": "두 개의 사선이 교차하는 'X' 모양이 중요 표시나 메모의 구석을 연상시킵니다." },
    { "char": "モ", "romaji": "mo", "hangul": "모", "keyword": "모자", "explanation": "세 개의 획이 모자의 챙, 몸체, 윗부분 단면을 연상시키는 구조입니다." },
    { "char": "ヤ", "romaji": "ya", "hangul": "야", "keyword": "야자나무", "explanation": "사선들이 갈라져 올라가는 모습이 야자나무의 잎과 줄기를 닮았습니다." },
    { "char": "ユ", "romaji": "yu", "hangul": "유", "keyword": "깨진 유리컵", "explanation": "사각 형태에서 한 획이 비어있어 모서리가 깨진 유리컵의 실루엣처럼 보입니다." },
    { "char": "ヨ", "romaji": "yo", "hangul": "요", "keyword": "요트", "explanation": "세 개의 평행한 수평선이 요트 갑판의 층 구조를 닮았습니다." },
    { "char": "ラ", "romaji": "ra", "hangul": "라", "keyword": "라디오", "explanation": "두 획이 고전 라디오의 안테나와 몸통을 연상시키는 단순한 모양입니다." },
    { "char": "リ", "romaji": "ri", "hangul": "리", "keyword": "리본", "explanation": "두 개의 짧은 수직선이 리본의 끝 부분이 나란히 늘어진 것처럼 보입니다." },
    { "char": "ル", "romaji": "ru", "hangul": "루", "keyword": "루돌프", "explanation": "아래로 길게 꺾이는 획이 열심히 달리는 루돌프 사슴의 두 다리를 연상시킵니다." },
    { "char": "レ", "romaji": "re", "hangul": "레", "keyword": "레몬", "explanation": "오른쪽 아래로 꺾이는 하나의 획이 레몬을 자른 단면처럼 보입니다." },
    { "char": "ロ", "romaji": "ro", "hangul": "로", "keyword": "로고", "explanation": "네모난 형태가 단순한 로고 프레임이나 상자를 연상시킵니다." },
    { "char": "ワ", "romaji": "wa", "hangul": "와", "keyword": "와인잔", "explanation": "윗부분과 아래로 꺾이는 획이 와인잔의 컵 부분을 연상시키는 모양입니다." },
    { "char": "ヲ", "romaji": "wo", "hangul": "오/워", "keyword": "오뚜기 또는 오키", "explanation": "위는 넓고 아래는 좁은 구조와 가운데 교차하는 획이 오뚜기 인형 실루엣과 닮았습니다. 오(wo) 모양은 자음 ㅋ을 닯았다는 의미에서 오키로 외울 수 있습니다." },
    { "char": "ン", "romaji": "n", "hangul": "응/ㄴ", "keyword": "응원", "explanation": "오른쪽 아래로 길게 뻗는 한 획이 응원할 때 사용하는 효과나 방향성을 나타내는 듯합니다." }
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

  function renderCard() {
    const card = getCurrentCard();
    if (!card) { flashcard.hidden = true; emptyState.hidden = false; return; }

    console.log(`render card state:`)
    console.log(state.progress.selectedBox)


    flashcard.hidden = false; emptyState.hidden = true;
    frontEl.hidden = false; backEl.hidden = true;
    frontHangul.textContent = card.data.hangul || card.data.romaji;
    hintKeyword.textContent = card.data.keyword || '';
    hintExplanation.textContent = card.data.explanation || '';
    hintArea.hidden = true;
    backChar.textContent = card.data.char;
    backRomaji.textContent = card.data.romaji;
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
  const dayTitles = [
    "저는 ~입니다", "~에 ~가 있습니다", "나형용사", "이형용사", "~합니다(동사의 ます형)", "조사", "~하러 가다/~하고싶다", "동사의 て형과 た형", "동사 て형의 활용", "유용한 동사 활용 표현들", "동사 た형의 활용", "부정형 정중체", "단위 표현과 함께 숫자 세기", "~하면(가정법)", "가정법 심화", "~할 수 있다(동사 가능형)", "~라고 합니다/~인 것 같습니다", "계획/의지를 나타내는 표현", "한자를 읽는 두가지 방법", "복습 (1)", "복습 (2)", "복습 (3)", "복습 (4)", "복습 (5)", "복습 (6)", "복습 (7)", "복습 (8)", "복습 (9)"
  ]

  function populateDaySelect(element) {
    if (element.options.length === 0) {
      for (let d = 1; d <= 28; d++) {
        const opt = document.createElement('option');
        opt.value = d;
        opt.textContent = `${d}. ${dayTitles[d-1]}`;
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
  }

  normalizeProgress();
  initUI();

})();
