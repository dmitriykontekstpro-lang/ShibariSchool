import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { UserProfile, ShibariRole, ExperienceLevel, SystemRole } from '../types';
import { Loader2, ArrowRight, User, MapPin, Mail, Lock, Heart, Star, AlertCircle, X, CheckCircle } from 'lucide-react';
import BehaviorTracker from '../utils/BehaviorTracker';

interface AuthOverlayProps {
  onLoginSuccess: () => void;
  onClose?: () => void;
}

const AuthOverlay: React.FC<AuthOverlayProps> = ({ onLoginSuccess, onClose }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Check for errors in URL hash (e.g. from email confirmation link)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('error_description')) {
        const params = new URLSearchParams(hash.substring(1));
        const errorDesc = params.get('error_description');
        const errorCode = params.get('error_code');
        
        if (errorDesc) {
            let msg = decodeURIComponent(errorDesc.replace(/\+/g, ' '));
            if (errorCode === 'otp_expired') {
                msg = "Ссылка подтверждения истекла. Попробуйте войти с паролем.";
            }
            setError(msg);
            window.history.replaceState(null, '', window.location.pathname);
        }
    }
  }, []);

  // Registration Form State
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    country: '',
    city: '',
    shibariRole: 'unknown' as ShibariRole,
    experienceLevel: 'newbie' as ExperienceLevel
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (!supabase) throw new Error("Supabase client not initialized");

      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;
      
      if (data.user) {
          BehaviorTracker.identify(data.user.id);
      }
      onLoginSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Ошибка входа. Проверьте данные.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!supabase) throw new Error("Supabase client not initialized");

      const systemRole: SystemRole = formData.email.includes('admin') ? 'admin' : 'user';
      const metadata = {
        full_name: formData.fullName,
        country: formData.country,
        city: formData.city,
        shibari_role: formData.shibariRole,
        experience_level: formData.experienceLevel,
        system_role: systemRole
      };

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { data: metadata }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Не удалось создать пользователя.");

      if (authData.session) {
          const newProfile: Partial<UserProfile> = {
            id: authData.user.id,
            email: formData.email,
            ...metadata
          };
          
          await supabase.from('user_shibari').insert([newProfile]);
          BehaviorTracker.identify(authData.user.id);
          onLoginSuccess();
      } else {
          setSuccessMessage("Аккаунт создан! Проверьте почту для подтверждения.");
          setIsLoginMode(true);
          setStep(1);
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Ошибка регистрации.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1_Auth = () => (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-300">
        <h3 className="text-xl font-bold text-white mb-2">Данные для входа</h3>
        <div className="space-y-2">
            <label className="text-xs text-neutral-500 uppercase font-bold flex items-center gap-2">
                <Mail className="w-3 h-3" /> Почта
            </label>
            <input 
                type="email" 
                value={formData.email}
                onChange={e => handleInputChange('email', e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:border-red-600 outline-none"
                placeholder="example@mail.com"
            />
        </div>
        <div className="space-y-2">
            <label className="text-xs text-neutral-500 uppercase font-bold flex items-center gap-2">
                <Lock className="w-3 h-3" /> Пароль
            </label>
            <input 
                type="password" 
                value={formData.password}
                onChange={e => handleInputChange('password', e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:border-red-600 outline-none"
                placeholder="••••••••"
            />
        </div>
        <button 
            onClick={() => {
                if(formData.email && formData.password.length >= 6) setStep(2);
                else setError("Введите почту и пароль (минимум 6 символов)");
            }}
            className="w-full bg-neutral-800 hover:bg-neutral-700 text-white py-3 rounded-lg font-bold mt-4 flex items-center justify-center gap-2 transition-colors"
        >
            Далее <ArrowRight className="w-4 h-4" />
        </button>
    </div>
  );

  const renderStep2_Personal = () => (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-300">
        <h3 className="text-xl font-bold text-white mb-2">О себе</h3>
        <div className="space-y-2">
            <label className="text-xs text-neutral-500 uppercase font-bold flex items-center gap-2">
                <User className="w-3 h-3" /> Имя пользователя
            </label>
            <input 
                value={formData.fullName}
                onChange={e => handleInputChange('fullName', e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:border-red-600 outline-none"
                placeholder="Как к вам обращаться?"
            />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <label className="text-xs text-neutral-500 uppercase font-bold flex items-center gap-2">
                    <MapPin className="w-3 h-3" /> Страна
                </label>
                <input 
                    value={formData.country}
                    onChange={e => handleInputChange('country', e.target.value)}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:border-red-600 outline-none"
                    placeholder="РФ"
                />
            </div>
            <div className="space-y-2">
                <label className="text-xs text-neutral-500 uppercase font-bold flex items-center gap-2">
                    <MapPin className="w-3 h-3" /> Город
                </label>
                <input 
                    value={formData.city}
                    onChange={e => handleInputChange('city', e.target.value)}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:border-red-600 outline-none"
                    placeholder="Москва"
                />
            </div>
        </div>
        <div className="flex gap-2 mt-4">
             <button onClick={() => setStep(1)} className="flex-1 py-3 bg-transparent border border-neutral-700 text-neutral-400 rounded-lg hover:text-white">Назад</button>
             <button 
                onClick={() => {
                    if(formData.fullName) setStep(3);
                    else setError("Представьтесь, пожалуйста");
                }} 
                className="flex-[2] bg-neutral-800 hover:bg-neutral-700 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2"
            >
                Далее <ArrowRight className="w-4 h-4" />
            </button>
        </div>
    </div>
  );

  const renderStep3_Shibari = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300">
        <h3 className="text-xl font-bold text-white mb-2">Ваш путь в Шибари</h3>
        
        <div className="space-y-3">
            <label className="text-xs text-neutral-500 uppercase font-bold flex items-center gap-2">
                <Heart className="w-3 h-3" /> Ваша роль
            </label>
            <div className="grid grid-cols-2 gap-2">
                {['rigger', 'model', 'switch', 'unknown'].map((role) => (
                    <button
                        key={role}
                        onClick={() => handleInputChange('shibariRole', role)}
                        className={`p-2 rounded-lg text-sm border transition-all ${
                            formData.shibariRole === role 
                            ? 'bg-red-900/40 border-red-600 text-white' 
                            : 'bg-neutral-800 border-neutral-800 text-neutral-400 hover:bg-neutral-700'
                        }`}
                    >
                        {role === 'rigger' && 'Риггер'}
                        {role === 'model' && 'Модель'}
                        {role === 'switch' && 'Все вместе'}
                        {role === 'unknown' && 'Не знаю'}
                    </button>
                ))}
            </div>
        </div>

        <div className="space-y-3">
            <label className="text-xs text-neutral-500 uppercase font-bold flex items-center gap-2">
                <Star className="w-3 h-3" /> Уровень опыта
            </label>
            <div className="grid grid-cols-2 gap-2">
                {['newbie', 'beginner', 'experienced', 'expert'].map((lvl) => (
                    <button
                        key={lvl}
                        onClick={() => handleInputChange('experienceLevel', lvl)}
                        className={`p-2 rounded-lg text-sm border transition-all ${
                            formData.experienceLevel === lvl 
                            ? 'bg-red-900/40 border-red-600 text-white' 
                            : 'bg-neutral-800 border-neutral-800 text-neutral-400 hover:bg-neutral-700'
                        }`}
                    >
                        {lvl === 'newbie' && 'Новичок (0)'}
                        {lvl === 'beginner' && 'Начинающий'}
                        {lvl === 'experienced' && 'Опытный'}
                        {lvl === 'expert' && 'Эксперт'}
                    </button>
                ))}
            </div>
        </div>

        <div className="flex gap-2 mt-6">
             <button onClick={() => setStep(2)} className="flex-1 py-3 bg-transparent border border-neutral-700 text-neutral-400 rounded-lg hover:text-white">Назад</button>
             <button 
                onClick={handleRegister} 
                className="flex-[2] bg-red-700 hover:bg-red-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-900/20"
            >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Зарегистрироваться'}
            </button>
        </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
        <div className="w-full max-w-md bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-6 pb-2 flex justify-between items-start">
                 <div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                        {isLoginMode ? 'Вход' : 'Регистрация'}
                    </h2>
                    <p className="text-sm text-neutral-400">
                        {isLoginMode 
                            ? 'Рады видеть вас снова.' 
                            : 'Создайте аккаунт для полного доступа.'}
                    </p>
                 </div>
                 {onClose && (
                     <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors p-2 bg-neutral-900 rounded-full hover:bg-red-900/20">
                         <X className="w-5 h-5" />
                     </button>
                 )}
            </div>

            {/* Scrollable Content */}
            <div className="p-6 pt-4 overflow-y-auto">
                {error && (
                    <div className="mb-4 bg-red-900/20 border border-red-900/50 p-3 rounded-lg flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-red-200">{error}</p>
                    </div>
                )}

                {successMessage && (
                     <div className="mb-6 bg-green-900/20 border border-green-900/50 p-4 rounded-lg flex flex-col items-center text-center gap-2">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                        <p className="text-sm text-green-200">{successMessage}</p>
                    </div>
                )}

                {isLoginMode ? (
                    <form onSubmit={handleLogin} className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-300">
                        <div className="space-y-2">
                            <label className="text-xs text-neutral-500 uppercase font-bold flex items-center gap-2">
                                <Mail className="w-3 h-3" /> Почта
                            </label>
                            <input 
                                type="email" 
                                value={formData.email}
                                onChange={e => handleInputChange('email', e.target.value)}
                                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:border-red-600 outline-none transition-colors"
                                placeholder="example@mail.com"
                            />
                        </div>
                        <div className="space-y-2">
                             <div className="flex justify-between">
                                <label className="text-xs text-neutral-500 uppercase font-bold flex items-center gap-2">
                                    <Lock className="w-3 h-3" /> Пароль
                                </label>
                             </div>
                            <input 
                                type="password" 
                                value={formData.password}
                                onChange={e => handleInputChange('password', e.target.value)}
                                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:border-red-600 outline-none transition-colors"
                                placeholder="••••••••"
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full bg-red-700 hover:bg-red-600 text-white py-3 rounded-lg font-bold mt-4 flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-900/20"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Войти'}
                        </button>
                    </form>
                ) : (
                    <>
                        {step === 1 && renderStep1_Auth()}
                        {step === 2 && renderStep2_Personal()}
                        {step === 3 && renderStep3_Shibari()}
                    </>
                )}

                <div className="mt-6 pt-6 border-t border-neutral-800 text-center">
                    <p className="text-sm text-neutral-500">
                        {isLoginMode ? 'Еще нет аккаунта?' : 'Уже есть аккаунт?'}
                        <button 
                            onClick={() => { setIsLoginMode(!isLoginMode); setStep(1); setError(null); }}
                            className="ml-2 text-white font-bold hover:text-red-500 transition-colors"
                        >
                            {isLoginMode ? 'Зарегистрироваться' : 'Войти'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    </div>
  );
}

export default AuthOverlay;
