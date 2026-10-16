
import LoginForm from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            PayPay<span className="text-blue-600">YourRoll</span>
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Sign in to access your account
          </p>
        </div>

        <LoginForm />

        <p className="mt-6 text-center text-sm text-slate-500">
          Don&apos;t have an account?{" "}
          <a
            href="/register"
            className="font-semibold text-blue-600 hover:underline"
          >
            Create an account
          </a>
        </p>
      </div>
    </main>
  );
}
