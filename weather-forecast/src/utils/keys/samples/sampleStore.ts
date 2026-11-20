// WDE: reducer 초기 상태를 위한 최소 sampleStore.
// (원본 macOS-react는 이 파일을 .gitignore로 제외 — 우리가 최소 상태로 채움)
// WDE 셸은 날씨 데모 대신 실제 GTK 창 스트리밍을 쓸 것이므로 최소 필드만 정의.

export default {
  // 날씨 데모 (WDE에선 사용 안 함, 순수 shape 유지)
  weather: {
    current: {},
    forecast: [],
  },
  loading: false,
  query: "",
  selected: undefined,
  section: "none",
  failed: false,

  // dock / 데스크톱
  dockItem: undefined,
  booting: true,
  date: "",
  soundPlayed: false,

  // 설정
  settings: {
    open: false,
    color: "blue",
    airdrop: false,
    animations: true,
    notch: true,
    wallpaper: {
      open: false,
      preview: "",
      src: "",
      name: "Ventura",
      surname: "ventura",
    },
  },

  onTop: [],
};