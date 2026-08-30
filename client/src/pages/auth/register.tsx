import { FormEvent, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { registerSchema } from "../../schemas/auth";
import { register } from "../../apis/auth/auth";
import { useAuth } from "../../context/auth";
import { getErrorMessage } from "../../utils/errorMessage";

function RegisterPage() {
  const { loginSuccess } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const registerMutation = useMutation({
    mutationFn: register,
    onSuccess: (res) => {
      loginSuccess(res.user, res.accessToken);
      navigate("/", { replace: true });
    },
  });

  const handleSubmit = (e: FormEvent) => {
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
    registerMutation.mutate(parsed.data);
  };

  const inputClass =
    "rounded-lg border border-border bg-surface2 px-4 py-3 text-base outline-none focus:border-primary";

  return (
    <div className="mx-auto max-w-[480px] px-2 py-10">
      <h2 className="mb-8 text-2xl font-bold">회원가입</h2>
      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-2 text-sm text-muted">
          이름
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            className={inputClass}
          />
          {errors.name && <span className="text-sm text-primary">{errors.name}</span>}
        </label>
        <label className="flex flex-col gap-2 text-sm text-muted">
          이메일
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            className={inputClass}
          />
          {errors.email && <span className="text-sm text-primary">{errors.email}</span>}
        </label>
        <label className="flex flex-col gap-2 text-sm text-muted">
          비밀번호
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            className={inputClass}
          />
          {errors.password && <span className="text-sm text-primary">{errors.password}</span>}
        </label>
        {registerMutation.isError && (
          <p className="text-sm text-primary">
            {getErrorMessage(registerMutation.error, "회원가입에 실패했습니다.")}
          </p>
        )}
        <button
          type="submit"
          disabled={registerMutation.isPending}
          className="rounded-lg bg-primary py-3 mt-10 text-base font-semibold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {registerMutation.isPending ? "가입 중..." : "회원가입"}
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-muted">
        이미 계정이 있으신가요?{" "}
        <Link to="/login" className="font-semibold text-primary">
          로그인
        </Link>
      </p>
    </div>
  );
}

export default RegisterPage;
