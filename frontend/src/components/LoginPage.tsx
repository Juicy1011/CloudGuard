'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, User as UserIcon, AlertCircle, KeyRound, CheckCircle2, ArrowLeft } from 'lucide-react';
import { cn } from "@/lib/utils";
import { loginUser, registerUser, requestPasswordReset, confirmPasswordReset } from '@/lib/api';

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  );
}

interface LoginPageProps {
  onLoginSuccess: (user: { id?: number; username: string; email: string; access_token?: string; is_protected?: boolean }, rememberMe: boolean) => void;
}

type AuthMode = 'login' | 'signup' | 'forgot' | 'reset';

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [, setMousePosition] = useState({ x: 0, y: 0 });

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [10, -10]);
  const rotateY = useTransform(mouseX, [-300, 300], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const resetMessages = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    resetMessages();

    try {
      if (mode === 'signup') {
        const user = await registerUser(username || email.split('@')[0], email, password);
        onLoginSuccess({ id: user.id, username: user.username, email: user.email, access_token: user.access_token, is_protected: user.is_protected }, rememberMe);
      } else if (mode === 'login') {
        const user = await loginUser(email, password);
        onLoginSuccess({ id: user.id, username: user.username, email: user.email, access_token: user.access_token, is_protected: user.is_protected }, rememberMe);
      } else if (mode === 'forgot') {
        const res = await requestPasswordReset(email);
        setSuccessMessage(res.message || "Verification OTP code sent to your email!");
        setMode('reset');
      } else if (mode === 'reset') {
        if (newPassword !== confirmPassword) {
          throw new Error("Passwords do not match");
        }
        const res = await confirmPasswordReset(email, otp, newPassword);
        setSuccessMessage(res.message || "Password updated successfully! Please log in.");
        setMode('login');
        setPassword("");
        setOtp("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-slate-100 relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-blue-50/50 to-indigo-100/60" />
      
      <div 
        className="absolute inset-0 opacity-[0.4]" 
        style={{
          backgroundImage: `radial-gradient(#cbd5e1 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[120vh] h-[60vh] rounded-b-[50%] bg-blue-300/30 blur-[100px]" />
      <motion.div 
        className="absolute top-1/4 left-1/3 transform -translate-x-1/2 w-[80vh] h-[50vh] rounded-full bg-indigo-300/20 blur-[90px]"
        animate={{ 
          opacity: [0.3, 0.6, 0.3],
          scale: [0.95, 1.05, 0.95]
        }}
        transition={{ 
          duration: 8, 
          repeat: Infinity,
          repeatType: "mirror"
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md relative z-10 p-6"
      >
        <div className="relative">
          <div className="relative group">
            <motion.div 
              className="absolute -inset-[1px] rounded-3xl opacity-60 group-hover:opacity-100 transition-opacity duration-700"
              animate={{
                boxShadow: [
                  "0 10px 30px -5px rgba(59, 130, 246, 0.15)",
                  "0 15px 40px -5px rgba(99, 102, 241, 0.25)",
                  "0 10px 30px -5px rgba(59, 130, 246, 0.15)"
                ]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut", 
                repeatType: "mirror" 
              }}
            />

            <div className="absolute -inset-[1px] rounded-3xl overflow-hidden pointer-events-none">
              <motion.div 
                className="absolute top-0 left-0 h-[3px] w-[50%] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-80"
                animate={{ 
                  left: ["-50%", "100%"],
                }}
                transition={{ 
                  duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 
                }}
              />
              <motion.div 
                className="absolute bottom-0 right-0 h-[3px] w-[50%] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-80"
                animate={{ 
                  right: ["-50%", "100%"],
                }}
                transition={{ 
                  duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1, delay: 1.25 
                }}
              />
            </div>

            <div className="relative bg-white/90 backdrop-blur-2xl rounded-3xl p-8 border border-white/80 shadow-2xl shadow-slate-300/60 overflow-hidden">
              <div className="text-center space-y-2 mb-6">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", duration: 0.8 }}
                  className="mx-auto w-14 h-14 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25 relative overflow-hidden"
                >
                  <span className="text-2xl font-black text-white">CG</span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl font-bold text-slate-900 tracking-tight"
                >
                  {mode === 'signup' && 'Create Operator Account'}
                  {mode === 'login' && 'Welcome Back'}
                  {mode === 'forgot' && 'Reset Password'}
                  {mode === 'reset' && 'Verify OTP & Set Password'}
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-slate-500 text-sm"
                >
                  {mode === 'signup' && 'Sign up to access CloudGuard Fleet Manager'}
                  {mode === 'login' && 'Sign in to continue to CloudGuard Dashboard'}
                  {mode === 'forgot' && 'Enter your registered email to receive a 6-digit OTP code'}
                  {mode === 'reset' && `Enter the OTP sent to ${email || 'your email'} and choose a new password`}
                </motion.p>
              </div>

              {errorMessage && (
                <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-3.5">
                  {mode === 'signup' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className={`relative ${focusedInput === "username" ? 'z-10' : ''}`}
                    >
                      <div className="relative flex items-center overflow-hidden rounded-xl">
                        <UserIcon className={`absolute left-3.5 w-4 h-4 transition-all duration-300 ${
                          focusedInput === "username" ? 'text-blue-600' : 'text-slate-400'
                        }`} />
                        <Input
                          type="text"
                          placeholder="Username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          onFocus={() => setFocusedInput("username")}
                          onBlur={() => setFocusedInput(null)}
                          className="w-full bg-slate-50 border-slate-200 focus:border-blue-500 text-slate-900 placeholder:text-slate-400 h-11 transition-all duration-300 pl-10 pr-3 focus:bg-white text-sm"
                          required
                        />
                      </div>
                    </motion.div>
                  )}

                  {(mode === 'login' || mode === 'signup' || mode === 'forgot') && (
                    <motion.div 
                      className={`relative ${focusedInput === "email" ? 'z-10' : ''}`}
                    >
                      <div className="relative flex items-center overflow-hidden rounded-xl">
                        <Mail className={`absolute left-3.5 w-4 h-4 transition-all duration-300 ${
                          focusedInput === "email" ? 'text-blue-600' : 'text-slate-400'
                        }`} />
                        <Input
                          type="email"
                          placeholder="Email address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onFocus={() => setFocusedInput("email")}
                          onBlur={() => setFocusedInput(null)}
                          className="w-full bg-slate-50 border-slate-200 focus:border-blue-500 text-slate-900 placeholder:text-slate-400 h-11 transition-all duration-300 pl-10 pr-3 focus:bg-white text-sm"
                          required
                        />
                      </div>
                    </motion.div>
                  )}

                  {mode === 'reset' && (
                    <>
                      <motion.div className={`relative ${focusedInput === "otp" ? 'z-10' : ''}`}>
                        <div className="relative flex items-center overflow-hidden rounded-xl">
                          <KeyRound className={`absolute left-3.5 w-4 h-4 transition-all duration-300 ${
                            focusedInput === "otp" ? 'text-blue-600' : 'text-slate-400'
                          }`} />
                          <Input
                            type="text"
                            placeholder="6-Digit Verification Code (OTP)"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            onFocus={() => setFocusedInput("otp")}
                            onBlur={() => setFocusedInput(null)}
                            className="w-full bg-slate-50 border-slate-200 focus:border-blue-500 text-slate-900 placeholder:text-slate-400 h-11 transition-all duration-300 pl-10 pr-3 focus:bg-white text-sm font-mono tracking-wider"
                            required
                          />
                        </div>
                      </motion.div>

                      <motion.div className={`relative ${focusedInput === "newPassword" ? 'z-10' : ''}`}>
                        <div className="relative flex items-center overflow-hidden rounded-xl">
                          <Lock className={`absolute left-3.5 w-4 h-4 transition-all duration-300 ${
                            focusedInput === "newPassword" ? 'text-blue-600' : 'text-slate-400'
                          }`} />
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            onFocus={() => setFocusedInput("newPassword")}
                            onBlur={() => setFocusedInput(null)}
                            className="w-full bg-slate-50 border-slate-200 focus:border-blue-500 text-slate-900 placeholder:text-slate-400 h-11 transition-all duration-300 pl-10 pr-10 focus:bg-white text-sm"
                            required
                          />
                          <div 
                            onClick={() => setShowPassword(!showPassword)} 
                            className="absolute right-3.5 cursor-pointer"
                          >
                            {showPassword ? <Eye className="w-4 h-4 text-slate-400" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                          </div>
                        </div>
                      </motion.div>

                      <motion.div className={`relative ${focusedInput === "confirmPassword" ? 'z-10' : ''}`}>
                        <div className="relative flex items-center overflow-hidden rounded-xl">
                          <Lock className={`absolute left-3.5 w-4 h-4 transition-all duration-300 ${
                            focusedInput === "confirmPassword" ? 'text-blue-600' : 'text-slate-400'
                          }`} />
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Confirm New Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            onFocus={() => setFocusedInput("confirmPassword")}
                            onBlur={() => setFocusedInput(null)}
                            className="w-full bg-slate-50 border-slate-200 focus:border-blue-500 text-slate-900 placeholder:text-slate-400 h-11 transition-all duration-300 pl-10 pr-10 focus:bg-white text-sm"
                            required
                          />
                        </div>
                      </motion.div>
                    </>
                  )}

                  {(mode === 'login' || mode === 'signup') && (
                    <motion.div 
                      className={`relative ${focusedInput === "password" ? 'z-10' : ''}`}
                    >
                      <div className="relative flex items-center overflow-hidden rounded-xl">
                        <Lock className={`absolute left-3.5 w-4 h-4 transition-all duration-300 ${
                          focusedInput === "password" ? 'text-blue-600' : 'text-slate-400'
                        }`} />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onFocus={() => setFocusedInput("password")}
                          onBlur={() => setFocusedInput(null)}
                          className="w-full bg-slate-50 border-slate-200 focus:border-blue-500 text-slate-900 placeholder:text-slate-400 h-11 transition-all duration-300 pl-10 pr-10 focus:bg-white text-sm"
                          required
                        />
                        
                        <div 
                          onClick={() => setShowPassword(!showPassword)} 
                          className="absolute right-3.5 cursor-pointer"
                        >
                          {showPassword ? (
                            <Eye className="w-4 h-4 text-slate-400 hover:text-slate-700 transition-colors duration-300" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-slate-400 hover:text-slate-700 transition-colors duration-300" />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {mode === 'login' && (
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center space-x-2">
                      <input
                        id="remember-me"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={() => setRememberMe(!rememberMe)}
                        className="h-4 w-4 rounded border-slate-300 bg-slate-100 text-blue-600 focus:ring-blue-500/20"
                      />
                      <label htmlFor="remember-me" className="text-xs text-slate-600 hover:text-slate-800 cursor-pointer">
                        Remember me
                      </label>
                    </div>
                    
                    <button 
                      type="button" 
                      onClick={() => { setMode('forgot'); resetMessages(); }}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full relative group/button mt-6"
                >
                  <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white font-medium h-11 rounded-xl transition-all duration-300 flex items-center justify-center shadow-lg shadow-blue-600/25 hover:shadow-blue-600/35">
                    <AnimatePresence mode="wait">
                      {isLoading ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center justify-center"
                        >
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        </motion.div>
                      ) : (
                        <motion.span
                          key="button-text"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center justify-center gap-2 text-sm font-semibold tracking-wide"
                        >
                          {mode === 'signup' && 'Create Account'}
                          {mode === 'login' && 'Sign In'}
                          {mode === 'forgot' && 'Send Verification Code'}
                          {mode === 'reset' && 'Update Password'}
                          <ArrowRight className="w-4 h-4 group-hover/button:translate-x-1 transition-transform duration-300" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.button>

                {mode !== 'login' && mode !== 'signup' && (
                  <button 
                    type="button"
                    onClick={() => { setMode('login'); resetMessages(); }}
                    className="w-full flex items-center justify-center gap-2 text-xs text-slate-500 hover:text-slate-800 font-medium pt-2 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                  </button>
                )}

                {(mode === 'login' || mode === 'signup') && (
                  <p className="text-center text-xs text-slate-500 mt-5">
                    {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
                    <button 
                      type="button"
                      onClick={() => {
                        setMode(mode === 'signup' ? 'login' : 'signup');
                        resetMessages();
                      }}
                      className="text-blue-600 hover:text-blue-700 font-semibold underline underline-offset-2 ml-1"
                    >
                      {mode === 'signup' ? 'Sign In' : 'Sign Up'}
                    </button>
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
