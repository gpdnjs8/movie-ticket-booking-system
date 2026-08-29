import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerSchema } from "../../schemas/auth";
import { register } from "../../apis/auth/auth";
import { useAuth } from "../../context/auth";
import { ROUTES } from "../../routes/router";

function RegisterPage() {
  const { loginSuccess } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = registerSchema.safeParse(form);
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
    const res = await register(parsed.data);
    setSubmitting(false);
    loginSuccess(res.user, res.accessToken);
    navigate(ROUTES.movies, { replace: true });
  };

  const inputClass =
    "rounded-lg border border-border bg-surface2 px-3 py-2.5 text-sm outline-none focus:border-primary";

  return (
    <div className="mx-auto max-w-[420px] px-5 py-7">
      <h2 className="mb-6 text-xl font-bold">회원가입</h2>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-1.5 text-[13px] text-muted">
          이름
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            className={inputClass}
          />
          {errors.name && <span className="text-xs text-primary">{errors.name}</span>}
        </label>
        <label className="flex flex-col gap-1.5 text-[13px] text-muted">
          이메일
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            className={inputClass}
          />
          {errors.email && <span className="text-xs text-primary">{errors.email}</span>}
        </label>
        <label className="flex flex-col gap-1.5 text-[13px] text-muted">
          비밀번호
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            className={inputClass}
          />
          {errors.password && <span className="text-xs text-primary">{errors.password}</span>}
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "가입 중..." : "회원가입"}
        </button>
      </form>
      <p className="mt-4 text-center text-[13px] text-muted">
        이미 계정이 있으신가요?{" "}
        <Link to={ROUTES.login} className="font-semibold text-primary">
          로그인
        </Link>
      </p>
    </div>
  );
}

export default RegisterPage;
