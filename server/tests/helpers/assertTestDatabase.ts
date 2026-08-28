const ALLOWED_TEST_DATABASE_NAMES = ["movie_ticket_test"];

// NODE_ENV=test 여부와 파싱한 DB 이름이 허용 목록에 있는지 검증
export function assertTestDatabaseUrl(url: string) {
  if (process.env.NODE_ENV !== "test") {
    throw new Error("NODE_ENV=test가 아니면 테스트 DB 초기화를 실행할 수 없습니다.");
  }

  let databaseName: string;
  try {
    databaseName = new URL(url).pathname.replace(/^\//, "");
  } catch {
    throw new Error(`DATABASE_URL을 해석할 수 없습니다: ${url}`);
  }

  if (!ALLOWED_TEST_DATABASE_NAMES.includes(databaseName)) {
    throw new Error(
      `테스트는 허용된 테스트 DB(${ALLOWED_TEST_DATABASE_NAMES.join(", ")})에서만 실행합니다. ` +
        `현재 DATABASE_URL의 DB 이름: "${databaseName}"`
    );
  }
}
