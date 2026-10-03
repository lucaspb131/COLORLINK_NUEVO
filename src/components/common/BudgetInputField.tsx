import React, { useState, useEffect } from 'react';
import { DollarSign, X, RotateCcw, Sparkles } from 'lucide-react';

export type CurrencyType = 'USD' | 'COP';

interface BudgetInputFieldProps {
  value: number | null | undefined;
  onChange: (val: number) => void;
  label?: string;
  currency?: CurrencyType | string;
  onCurrencyChange?: (curr: CurrencyType) => void;
  className?: string;
  helperText?: string;
  allowNull?: boolean;
}

/**
 * Formateador financiero con soporte para COP y USD
 */
function formatCurrencyNumber(val: number, curr: string): string {
  if (val === 0) return '0';
  if (curr === 'COP') {
    // En Colombia se usa separador de miles con punto
    return new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(val);
  }
  // USD usa coma como separador de miles
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(val);
}

export const BudgetInputField: React.FC<BudgetInputFieldProps> = ({
  value,
  onChange,
  label = 'Presupuesto Estimado',
  currency = 'USD',
  onCurrencyChange,
  className = '',
  helperText,
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyType>(
    currency === 'COP' ? 'COP' : 'USD'
  );

  // Mantener estado en string para permitir vaciado total con Backspace
  const [displayValue, setDisplayValue] = useState<string>(() => {
    if (value === null || value === undefined || isNaN(value)) return '';
    return value === 0 ? '' : formatCurrencyNumber(value, currency);
  });

  const [isFocused, setIsFocused] = useState(false);

  // Sincronizar moneda externa
  useEffect(() => {
    if (currency === 'COP' || currency === 'USD') {
      setSelectedCurrency(currency as CurrencyType);
    }
  }, [currency]);

  // Sincronizar si el valor externo cambia cuando el usuario NO está interactuando
  useEffect(() => {
    if (!isFocused) {
      if (value === null || value === undefined || isNaN(value) || value === 0) {
        setDisplayValue(value === 0 && displayValue === '0' ? '0' : (value ? formatCurrencyNumber(value, selectedCurrency) : ''));
      } else {
        setDisplayValue(formatCurrencyNumber(value, selectedCurrency));
      }
    }
  }, [value, isFocused, selectedCurrency]);

  // Manejador del cambio de moneda
  const handleCurrencyToggle = (newCurr: CurrencyType) => {
    setSelectedCurrency(newCurr);
    if (onCurrencyChange) {
      onCurrencyChange(newCurr);
    }
    const cleanNumbers = displayValue.replace(/[^0-9]/g, '');
    if (cleanNumbers) {
      const num = parseInt(cleanNumbers, 10);
      setDisplayValue(formatCurrencyNumber(num, newCurr));
    }
  };

  // Manejo de Backspace y tipeo numérico en tiempo real
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    // Si el usuario borró todo con Backspace o Delete
    if (raw === '' || raw.trim() === '') {
      setDisplayValue('');
      onChange(0);
      return;
    }

    // Filtrar solo dígitos
    const cleanDigits = raw.replace(/[^0-9]/g, '');

    if (cleanDigits === '') {
      setDisplayValue('');
      onChange(0);
      return;
    }

    const numericValue = parseInt(cleanDigits, 10);

    if (!isNaN(numericValue)) {
      // Formatear inmediatamente según la moneda activa
      setDisplayValue(formatCurrencyNumber(numericValue, selectedCurrency));
      onChange(numericValue);
    }
  };

  // Botón Limpiar total (Vacía completamente el input sin bloquear el formulario)
  const handleClear = () => {
    setDisplayValue('');
    onChange(0);
  };

  // Botón Restablecer a 0
  const handleResetToZero = () => {
    setDisplayValue('');
    onChange(0);
  };

  // Botones de montos sugeridos rápidos adaptados a la moneda
  const handleQuickSet = (amount: number) => {
    if (amount === 0) {
      setDisplayValue('');
      onChange(0);
    } else {
      setDisplayValue(formatCurrencyNumber(amount, selectedCurrency));
      onChange(amount);
    }
  };

  const numericCurrent = parseInt(displayValue.replace(/[^0-9]/g, ''), 10) || 0;

  // Sugerencias según moneda
  const quickAmounts = selectedCurrency === 'COP'
    ? [15000000, 50000000, 100000000, 250000000]
    : [10000, 25000, 50000, 100000];

  const formatQuickLabel = (amt: number) => {
    if (selectedCurrency === 'COP') {
      return `$${(amt / 1000000).toFixed(0)}M COP`;
    }
    return `$${(amt / 1000).toFixed(0)}k USD`;
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Header con Label y selector de Moneda COP / USD */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700">
          {label}
        </label>
        
        <div className="flex items-center space-x-1.5">
          {/* Selector de moneda COP / USD */}
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-[10px] font-bold">
            <button
              type="button"
              onClick={() => handleCurrencyToggle('USD')}
              className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                selectedCurrency === 'USD'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              USD ($)
            </button>
            <button
              type="button"
              onClick={() => handleCurrencyToggle('COP')}
              className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                selectedCurrency === 'COP'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              COP (COL$)
            </button>
          </div>

          {/* Badge de valor financiero formateado */}
          {displayValue !== '' && numericCurrent > 0 && (
            <span className="text-[10px] text-emerald-700 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              ${formatCurrencyNumber(numericCurrent, selectedCurrency)} {selectedCurrency}
            </span>
          )}
        </div>
      </div>

      {/* Input monetario con Icono y Botón de Limpiar (X) */}
      <div className="relative flex items-center">
        {/* Símbolo de Moneda */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <DollarSign className="w-4 h-4 text-slate-500" />
        </div>

        {/* Input monetario controlado con soporte móvil y Backspace */}
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={displayValue}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            if (numericCurrent > 0) {
              setDisplayValue(formatCurrencyNumber(numericCurrent, selectedCurrency));
            }
          }}
          placeholder="0 (Sin presupuesto / A cotizar)"
          className="w-full pl-9 pr-20 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-2xs"
        />

        {/* Botón Limpiar (X) y Moneda activa */}
        <div className="absolute inset-y-0 right-0 pr-2 flex items-center space-x-1.5">
          {displayValue !== '' && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Limpiar y vaciar campo completamente (Backspace total)"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <span className="text-[10px] font-bold text-slate-400 pr-1 select-none font-mono">
            {selectedCurrency}
          </span>
        </div>
      </div>

      {/* Sugerencias Rápidas y Botón Vaciar */}
      <div className="flex items-center flex-wrap gap-1.5 pt-0.5">
        <span className="text-[10px] text-slate-400 font-medium mr-1 flex items-center">
          <Sparkles className="w-3 h-3 text-blue-500 mr-0.5 inline" />
          Rápido:
        </span>
        {quickAmounts.map((amt) => (
          <button
            key={amt}
            type="button"
            onClick={() => handleQuickSet(amt)}
            className={`text-[10px] px-2 py-0.5 rounded-lg border font-mono transition-all cursor-pointer ${
              numericCurrent === amt
                ? 'bg-blue-600 text-white border-blue-600 font-bold'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {formatQuickLabel(amt)}
          </button>
        ))}

        <button
          type="button"
          onClick={handleResetToZero}
          className="text-[10px] px-2 py-0.5 rounded-lg border border-dashed border-slate-300 text-slate-500 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50/50 transition-colors flex items-center space-x-1 cursor-pointer ml-auto"
          title="Restablecer presupuesto a cero o vacío"
        >
          <RotateCcw className="w-2.5 h-2.5" />
          <span>Vaciar</span>
        </button>
      </div>

      {helperText && (
        <p className="text-[11px] text-slate-400 mt-1 leading-tight">
          {helperText}
        </p>
      )}
    </div>
  );
};
