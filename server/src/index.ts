import "dotenv/config";
import { createApp } from "./app";

const app = createApp();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

app.listen(PORT, () => {
  // eslint-disable-next-line no-console -- 서버 기동 알림용 의도된 로그
  console.log(`Server is running on http://localhost:${PORT}`);
});
