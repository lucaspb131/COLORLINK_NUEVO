import React, { useState } from 'react';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { apiService } from '../../services/apiService';

interface SetNewPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SetNewPasswordModal: React.FC<SetNewPasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 8) {
      setErrorMessage('La contraseña debe tener un mínimo de 8 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden. Por favor verifique.');
      return;
    }

    try {
      setIsLoading(true);
      await apiService.updateUserPassword(password);
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error al actualizar la contraseña en Supabase Auth.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in duration-200">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 ring-4 ring-blue-50/50">
          <Lock className="w-6 h-6" />
        </div>

        <h3 className="text-xl font-black text-slate-900 mb-1">
          Establecer Nueva Contraseña
        </h3>
        <p className="text-xs text-slate-500 mb-5 leading-relaxed">
          Ingrese y confirme su nueva contraseña segura para su cuenta corporativa COLORLINK.
        </p>

        {isSuccess ? (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-2">
            <div className="flex items-center space-x-2 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>¡Contraseña actualizada con éxito!</span>
            </div>
            <p className="text-[11px] leading-snug">
              Sus nuevas credenciales han sido verificadas en Supabase Auth. Redirigiendo a su sesión segura...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-snug">{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nueva Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  required
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Confirmar Nueva Contraseña
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita la nueva contraseña"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 space-y-1">
              <div className="flex items-center space-x-1.5 font-semibold text-slate-700">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Requisitos de Seguridad:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[10px] text-slate-500 pl-1">
                <li className={password.length >= 8 ? 'text-emerald-600 font-semibold' : ''}>Al menos 8 caracteres</li>
                <li className={/[A-Z]/.test(password) ? 'text-emerald-600 font-semibold' : ''}>Al menos una letra mayúscula</li>
                <li className={/[0-9]/.test(password) ? 'text-emerald-600 font-semibold' : ''}>Al menos un número</li>
              </ul>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#1E3A8A] hover:bg-blue-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md shadow-blue-900/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? 'Actualizando en Supabase...' : 'Guardar Nueva Contraseña'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
