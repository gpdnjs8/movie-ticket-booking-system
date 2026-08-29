import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { loginSchema } from "../../schemas/auth";
import { login } from "../../apis/auth/auth";
import { useAuth } from "../../context/auth";
import { ROUTES } from "../../routes/router";

function LoginPage() {
  const { loginSuccess } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
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
    setSubmitting(true);
    const res = await login(parsed.data);
    setSubmitting(false);
    loginSuccess(res.user, res.accessToken);

    const from = (location.state as { from?: Location })?.from?.pathname ?? ROUTES.movies;
    navigate(from, { replace: true });
  };

  const inputClass =
    "rounded-lg border border-border bg-surface2 px-3 py-2.5 text-sm outline-none focus:border-primary";

  return (
    <div className="mx-auto max-w-[420px] px-5 py-7">
      <h2 className="mb-6 text-xl font-bold">로그인</h2>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-1.5 text-[13px] text-muted">
          이메일
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
          {errors.email && <span className="text-xs text-primary">{errors.email}</span>}
        </label>
        <label className="flex flex-col gap-1.5 text-[13px] text-muted">
          비밀번호
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
          {errors.password && <span className="text-xs text-primary">{errors.password}</span>}
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "로그인 중..." : "로그인"}
        </button>
      </form>
      <p className="mt-4 text-center text-[13px] text-muted">
        계정이 없으신가요?{" "}
        <Link to={ROUTES.register} className="font-semibold text-primary">
          회원가입
        </Link>
      </p>
    </div>
  );
}

export default LoginPage;
