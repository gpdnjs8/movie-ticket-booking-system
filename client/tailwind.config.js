/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "sans-serif",
        ],
      },
      colors: {
        bg: "#ffffff",
        surface: "#ffffff",
        surface2: "#f4f5f7",
        border: "#e2e5ea",
        ink: "#1a1d23",
        primary: {
          DEFAULT: "#e63950",
          hover: "#ff4d63",
        },
        muted: "#6b7280",
        // 헤더는 밝은 배경과 대비되도록 기존 다크 팔레트를 그대로 유지
        header: "#171a21",
        headerBorder: "#2a2f3a",
        headerSurface2: "#1f232c",
        headerMuted: "#9aa1ac",
      },
    },
  },
  plugins: [],
};
