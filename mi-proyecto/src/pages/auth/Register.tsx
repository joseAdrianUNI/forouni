import { useState } from "react";
import type { FormEvent } from "react";
import {
  User,
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
} from "lucide-react";
import uniLogo from "../../assets/uni.webp";
import { register } from "../../lib/api";

interface RegisterFormState {
  fullName: string;
  studentId: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface RegisterProps {
  onLogin: () => void;
}

export default function Register({ onLogin }: RegisterProps) {
  const [formData, setFormData] = useState<RegisterFormState>({
    fullName: "",
    studentId: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const { fullName, studentId, email, password, confirmPassword } =
      formData;

    if (
      !fullName.trim() ||
      !studentId.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      setError("Por favor completa todos los campos.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      setIsSubmitting(true);

      await register({ fullName, studentId, email, password });
      onLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo completar el registro.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-4 py-10"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      <div className="w-full max-w-md">
        {/* Encabezado / Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-36 h-25 rounded-2xl mb-4 shadow-lg"
            style={{ backgroundColor: "white" }}
          >
            <img
              src={uniLogo}
              alt="Logo UNI"
              className="w-25 h-22 object-contain"
            />
          </div>
          <h1
            className="text-2xl sm:text-3xl mb-1"
            style={{
              fontFamily: "Montserrat-Bold, sans-serif",
              color: "var(--color-primary)",
            }}
          >
            Foro UNI
          </h1>
          <p
            className="text-sm"
            style={{
              fontFamily: "Poppins-Regular, sans-serif",
              color: "var(--color-secondary)",
            }}
          >
            Crea tu cuenta para participar
          </p>
        </div>

        {/* Tarjeta del formulario */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 border border-white/50">
          <form onSubmit={handleSubmit} noValidate>
            {/* Campo: Nombre Completo */}
            <div className="mb-5">
              <label
                htmlFor="fullName"
                className="block text-sm mb-1.5 font-medium"
                style={{
                  fontFamily: "Poppins-Regular, sans-serif",
                  color: "var(--color-primary-dark)",
                }}
              >
                Nombre Completo
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <User
                    className="w-5 h-5"
                    style={{ color: "var(--color-secondary)" }}
                  />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  placeholder="Ej. María Fernanda López"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm text-[color:var(--color-primary-dark)] placeholder:text-gray-400 outline-none transition focus:border-[color:var(--color-primary)] focus:bg-white focus:ring-2 focus:ring-[color:var(--color-primary-light)]/40"
                />
              </div>
            </div>

            {/* Campo: Matrícula / Carné */}
            <div className="mb-5">
              <label
                htmlFor="studentId"
                className="block text-sm mb-1.5 font-medium"
                style={{
                  fontFamily: "Poppins-Regular, sans-serif",
                  color: "var(--color-primary-dark)",
                }}
              >
                Matrícula / Carné
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <GraduationCap
                    className="w-5 h-5"
                    style={{ color: "var(--color-secondary)" }}
                  />
                </div>
                <input
                  id="studentId"
                  name="studentId"
                  type="text"
                  autoComplete="off"
                  placeholder="A00123456"
                  value={formData.studentId}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm text-[color:var(--color-primary-dark)] placeholder:text-gray-400 outline-none transition focus:border-[color:var(--color-primary)] focus:bg-white focus:ring-2 focus:ring-[color:var(--color-primary-light)]/40"
                />
              </div>
            </div>

            {/* Campo: Correo Electrónico */}
            <div className="mb-5">
              <label
                htmlFor="email"
                className="block text-sm mb-1.5 font-medium"
                style={{
                  fontFamily: "Poppins-Regular, sans-serif",
                  color: "var(--color-primary-dark)",
                }}
              >
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Mail
                    className="w-5 h-5"
                    style={{ color: "var(--color-secondary)" }}
                  />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="correo@std.uni.edu.ni"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm text-[color:var(--color-primary-dark)] placeholder:text-gray-400 outline-none transition focus:border-[color:var(--color-primary)] focus:bg-white focus:ring-2 focus:ring-[color:var(--color-primary-light)]/40"
                />
              </div>
            </div>

            {/* Campo: Contraseña */}
            <div className="mb-5">
              <label
                htmlFor="password"
                className="block text-sm mb-1.5 font-medium"
                style={{
                  fontFamily: "Poppins-Regular, sans-serif",
                  color: "var(--color-primary-dark)",
                }}
              >
                Contraseña
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Lock
                    className="w-5 h-5"
                    style={{ color: "var(--color-secondary)" }}
                  />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-11 text-sm text-[color:var(--color-primary-dark)] placeholder:text-gray-400 outline-none transition focus:border-[color:var(--color-primary)] focus:bg-white focus:ring-2 focus:ring-[color:var(--color-primary-light)]/40"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 transition hover:text-[color:var(--color-primary)]"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Campo: Confirmar Contraseña */}
            <div className="mb-2">
              <label
                htmlFor="confirmPassword"
                className="block text-sm mb-1.5 font-medium"
                style={{
                  fontFamily: "Poppins-Regular, sans-serif",
                  color: "var(--color-primary-dark)",
                }}
              >
                Confirmar Contraseña
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Lock
                    className="w-5 h-5"
                    style={{ color: "var(--color-secondary)" }}
                  />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-11 text-sm text-[color:var(--color-primary-dark)] placeholder:text-gray-400 outline-none transition focus:border-[color:var(--color-primary)] focus:bg-white focus:ring-2 focus:ring-[color:var(--color-primary-light)]/40"
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  aria-label={
                    showConfirmPassword
                      ? "Ocultar confirmación de contraseña"
                      : "Mostrar confirmación de contraseña"
                  }
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 transition hover:text-[color:var(--color-primary)]"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Mensaje de error */}
            {error && (
              <div className="mt-3 mb-4 rounded-lg bg-red-50 border border-red-200 px-3.5 py-2.5 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Botón de envío */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-3 w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white shadow-md transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                backgroundColor: "var(--color-primary)",
                fontFamily: "Montserrat-Bold, sans-serif",
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting)
                  e.currentTarget.style.backgroundColor =
                    "var(--color-primary-dark)";
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting)
                  e.currentTarget.style.backgroundColor =
                    "var(--color-primary)";
              }}
            >
              {isSubmitting ? (
                "Creando cuenta..."
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Registrarse
                </>
              )}
            </button>
          </form>

          {/* Separador */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs text-gray-400">o</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <p
            className="text-center text-sm"
            style={{ color: "var(--color-secondary)" }}
          >
            ¿Ya tienes cuenta?{" "}
            <button
              type="button"
              onClick={onLogin}
              className="font-semibold transition hover:underline"
              style={{ color: "var(--color-primary)" }}
            >
              Inicia sesión aquí
            </button>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-[color:var(--color-primary-dark)]/60">
          © {new Date().getFullYear()} Foro UNI. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
