import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { loginSchema } from "../../schemas/auth";
import { login } from "../../apis/auth/auth";
import { useAuth } from "../../context/auth";
import { getErrorMessage } from "../../utils/errorMessage";

function LoginPage() {
  const { loginSuccess } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        fieldErrors[String(issue.path[0])] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitError("");
    setSubmitting(true);
    try {
      const res = await login(parsed.data);
      loginSuccess(res.user, res.accessToken);

      const from = (location.state as { from?: Location })?.from?.pathname ?? "/";
      navigate(from, { replace: true });
    } catch (error) {
      setSubmitError(getErrorMessage(error, "로그인에 실패했습니다."));
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "rounded-lg border border-border bg-surface2 px-4 py-3 text-base outline-none focus:border-primary";

  return (
    <div className="mx-auto max-w-[480px] px-2 py-10">
      <h2 className="mb-8 text-2xl font-bold">로그인</h2>
      <form className="flex flex-col gap-7" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-2 text-m text-muted">
          이메일
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
          {errors.email && <span className="text-m text-primary">{errors.email}</span>}
        </label>
        <label className="flex flex-col gap-2 text-m text-muted">
          비밀번호
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
          {errors.password && <span className="text-m text-primary">{errors.password}</span>}
        </label>
        {submitError && <p className="text-m text-primary">{submitError}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-primary py-3 mt-10 text-base font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "로그인 중..." : "로그인"}
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-muted">
        계정이 없으신가요?{" "}
        <Link to="/register" className="font-semibold text-primary">
          회원가입
        </Link>
      </p>
    </div>
  );
}

export default LoginPage;
