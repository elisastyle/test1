"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
type Mode = "login" | "register" | "forgot";


interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onLogin: (email: string) => void;
 showToast: (msg: string, type?: string) => void; // type رو اضافه کردیم
   theme: "light" | "dark";
   
}

type Match = {
  id: string;
  home: string;
  away: string;
  spectators: number;
  start: number;
};

type Props = {
  match: Match;
  currentSec: number;
  onPredict: (match: Match) => void;
  theme: "light" | "dark";

  userPredictions?: Record<string, any>;
  user?: any;
  isTeamFavorite?: (team: string) => boolean;
  toggleFavoriteTeam?: (team: string) => void;
};

export default function MatchCard({
  match,
  currentSec,
  onPredict,
  userPredictions, // props جدید
  user,           // props جدید
  isTeamFavorite, // props جدید
  toggleFavoriteTeam ,// props جدید
  theme
}: Props) {
  const isDark = theme === "dark";

  const isHeartRed = user && isTeamFavorite(match.home); // چک کردن وضعیت قلب برای تیم home
const isAwayHeartRed = user && isTeamFavorite(match.away); // چک کردن وضعیت قلب برای تیم away

// 1. ابتدا داده‌های مربوط به این مسابقه را می‌گیریم
// --- بخش اصلاح شده در MatchCard ---

// 1. استخراج داده‌های این مسابقه خاص با استفاده از ID منحصر به فرد آن
const prediction = userPredictions?.[match.id];
const hasPrediction = !!prediction?.prediction;

const predictionTimeLimit = 55;
const isLocked = currentSec >= predictionTimeLimit;

// تعیین متن دکمه با اولویت‌بندی درست
let buttonText = "پیش‌بینی";
let buttonClassName = "bg-blue-600 hover:bg-blue-500";


if (!user) {
  buttonText = "وارد شوید";
} else if (isLocked) {
  buttonText = "زمان تمام شد";
} else if (hasPrediction) {
  buttonText = "ویرایش پیش‌بینی";
}

// ...
  return (
     <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className={`p-5 rounded-2xl border transition-all duration-300 ${
        isDark
          ? "bg-zinc-800 border-zinc-700 hover:border-blue-500"
          : "bg-white border-gray-200 shadow-sm hover:shadow-md hover:border-blue-400"
      }`}
    >
      <div className="flex justify-between mb-4 text-lg font-bold">
        <span className={`flex items-center gap-1 ${isDark ? "text-white" : "text-zinc-900"}`}>
          {match.home}
          {user && (
            <button onClick={() => toggleFavoriteTeam(match.home)} className="p-1 rounded-full focus:outline-none">
              <span className="text-xl cursor-pointer">{isHeartRed ? "❤️" : "🤍"}</span>
            </button>
          )}
        </span>
        <span className="text-zinc-500">VS</span>
        <span className={`flex items-center gap-1 ${isDark ? "text-white" : "text-zinc-900"}`}>
          {match.away}
          {user && (
            <button onClick={() => toggleFavoriteTeam(match.away)} className="p-1 rounded-full focus:outline-none">
              <span className="text-xl cursor-pointer">{isAwayHeartRed ? "❤️" : "🤍"}</span>
            </button>
          )}
        </span>
      </div>

      <div className="flex items-end justify-between gap-3">
        <div className={`text-sm ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
          <p>
            تماشاگران فعلی:{" "}
            <span className={isDark ? "text-white" : "text-zinc-900"}>
              {match.spectators.toLocaleString()}
            </span>
          </p>

          <p
            className={`mt-1 ${
              currentSec >= 50 ? "text-red-500 font-bold animate-pulse" : ""
            }`}
          >
            زمان تا آپدیت بعدی: {60 - currentSec} ثانیه
          </p>
        </div>

        <button
      onClick={() => onPredict(match)}
      className={`rounded-xl px-4 py-2 text-sm font-bold text-white transition-colors duration-300 sm:px-6 ${buttonClassName}`}
      disabled={!user || isLocked} // دکمه نباید غیرفعال باشد مگر اینکه کاربر وارد نشده باشد یا زمان قفل باشد
    >
      {buttonText}
    </button>

      </div>
    </motion.div>
  );
}
export function AuthModal({
 open,
  onClose,
  onLogin,
  showToast,
  theme
}: AuthModalProps) {
   const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // تابع کمکی برای تم‌ها جهت جلوگیری از شلوغی کد
  const isDark = theme === "dark";

  const resetFields = () => {
    setEmail("");
    setPassword("");
    setNewPassword("");
    setShowPassword(false);
  };

  const handleSubmit = () => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const existingIndex = users.findIndex((u: any) => u.email === email);

    if (!email) {
      showToast("ایمیل را وارد کنید");
      return;
    }

    if (mode === "login") {
      if (!password) {
        showToast("رمز عبور را وارد کنید");
        return;
      }
      if (existingIndex === -1 || users[existingIndex].password !== password) {
        showToast("ایمیل یا رمز اشتباه است");
        return;
      }
      localStorage.setItem("user", email);
      onLogin(email);
      resetFields();
      onClose();
    }

    if (mode === "register") {
      if (!password) {
        showToast("رمز عبور را وارد کنید");
        return;
      }
      if (existingIndex !== -1) {
        showToast("این ایمیل قبلاً ثبت شده");
        return;
      }
      const newUsers = [...users, { email, password, coins: 0 }];
      localStorage.setItem("users", JSON.stringify(newUsers));
      localStorage.setItem("user", email);
      onLogin(email);
      resetFields();
      onClose();
    }

    if (mode === "forgot") {
      if (existingIndex === -1) {
        showToast("کاربری با این ایمیل پیدا نشد");
        return;
      }
      if (!newPassword) {
        showToast("رمز جدید را وارد کنید");
        return;
      }
      users[existingIndex].password = newPassword;
      localStorage.setItem("users", JSON.stringify(users));
      showToast("رمز با موفقیت تغییر کرد ✅");
      resetFields();
      setMode("login");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop - تغییر رنگ بک‌دراپ بر اساس تم */}
          <div
            className={`absolute inset-0 backdrop-blur-md transition-colors duration-300 ${
              isDark ? "bg-black/70" : "bg-gray-500/30"
            }`}
            onClick={onClose}
          />

          {/* Modal Body */}
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={`relative w-full max-w-md overflow-hidden rounded-[2rem] border shadow-2xl transition-colors duration-300 ${
              isDark 
                ? "border-white/10 bg-zinc-950 text-white" 
                : "border-gray-200 bg-white text-zinc-900"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative top glow */}
            <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-cyan-400 to-yellow-400" />

            <div className="p-5 sm:p-8">
              {/* Close button */}
              <button
                onClick={onClose}
                className={`absolute left-4 top-4 rounded-full p-2 transition hover:scale-110 ${
                  isDark ? "bg-white/5 text-zinc-400 hover:text-white" : "bg-gray-100 text-gray-500 hover:text-gray-800"
                }`}
              >
                ✕
              </button>

              {/* Header */}
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-400 shadow-lg shadow-blue-500/30">
                  <span className="text-2xl">⚽</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black">
                  {mode === "login" && "ورود به فوتبالینو"}
                  {mode === "register" && "ساخت حساب جدید"}
                  {mode === "forgot" && "بازیابی رمز عبور"}
                </h2>

                <p className={`mt-2 text-sm ${isDark ? "text-zinc-400" : "text-gray-500"}`}>
                  {mode === "login" && "با حساب خود وارد شوید"}
                  {mode === "register" && "چند ثانیه‌ای حساب بسازید"}
                  {mode === "forgot" && "رمز جدید را تنظیم کنید"}
                </p>
              </div>

              {/* Tabs */}
              <div className={`mb-6 grid grid-cols-3 gap-2 rounded-2xl p-2 transition-colors ${
                isDark ? "bg-white/5" : "bg-gray-100"
              }`}>
                {(["login", "register", "forgot"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    className={`rounded-xl py-2 text-sm font-bold transition ${
                      mode === m
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                        : isDark ? "text-zinc-400 hover:text-white" : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    {m === "login" ? "ورود" : m === "register" ? "ثبت‌نام" : "فراموشی"}
                  </button>
                ))}
              </div>

              {/* Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
                className="space-y-4"
              >
                {/* Email */}
                <div>
                  <label className={`mb-2 block text-sm ${isDark ? "text-zinc-400" : "text-gray-600"}`}>
                    ایمیل
                  </label>
                  <input
                    type="email"
                    placeholder="example@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full rounded-2xl border px-4 py-3 outline-none transition placeholder:text-zinc-500 focus:border-blue-500 ${
                      isDark 
                        ? "border-white/10 bg-white/5 text-white focus:bg-white/10" 
                        : "border-gray-300 bg-gray-50 text-zinc-900 focus:bg-white"
                    }`}
                  />
                </div>

                {/* Password */}
                {(mode === "login" || mode === "register") && (
                  <div>
                    <label className={`mb-2 block text-sm ${isDark ? "text-zinc-400" : "text-gray-600"}`}>
                      رمز عبور
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="رمز عبور را وارد کنید"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`w-full rounded-2xl border px-4 py-3 pl-12 outline-none transition placeholder:text-zinc-500 focus:border-blue-500 ${
                          isDark 
                            ? "border-white/10 bg-white/5 text-white focus:bg-white/10" 
                            : "border-gray-300 bg-gray-50 text-zinc-900 focus:bg-white"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className={`absolute left-3 top-1/2 -translate-y-1/2 transition ${
                          isDark ? "text-zinc-400 hover:text-white" : "text-gray-400 hover:text-gray-600"
                        }`}
                      >
                        {showPassword ? "🙈" : "👁"}
                      </button>
                    </div>
                  </div>
                )}

                {/* New Password */}
                {mode === "forgot" && (
                  <div>
                    <label className={`mb-2 block text-sm ${isDark ? "text-zinc-400" : "text-gray-600"}`}>
                      رمز جدید
                    </label>
                    <input
                      type="password"
                      placeholder="رمز جدید را وارد کنید"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={`w-full rounded-2xl border px-4 py-3 outline-none transition placeholder:text-zinc-500 focus:border-blue-500 ${
                        isDark 
                          ? "border-white/10 bg-white/5 text-white focus:bg-white/10" 
                          : "border-gray-300 bg-gray-50 text-zinc-900 focus:bg-white"
                      }`}
                    />
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3 font-bold text-white transition hover:scale-[1.01]"
                >
                  <span className="relative z-10">
                    {mode === "login" && "ورود"}
                    {mode === "register" && "ثبت‌نام"}
                    {mode === "forgot" && "تغییر رمز"}
                  </span>
                  <div className="absolute inset-0 bg-white/10 opacity-0 transition group-hover:opacity-100" />
                </button>
              </form>

              {/* Bottom links */}
              <div className={`mt-6 text-center text-sm ${isDark ? "text-zinc-400" : "text-gray-500"}`}>
                {mode === "login" && (
                  <p>
                    حساب ندارید؟{" "}
                    <button
                      onClick={() => setMode("register")}
                      className="font-bold text-blue-500 hover:underline"
                    >
                      ثبت‌نام کنید
                    </button>
                  </p>
                )}

                {mode === "register" && (
                  <p>
                    قبلاً حساب ساخته‌اید؟{" "}
                    <button
                      onClick={() => setMode("login")}
                      className="font-bold text-blue-500 hover:underline"
                    >
                      ورود
                    </button>
                  </p>
                )}

                {mode === "forgot" && (
                  <p>
                    یادتان آمد؟{" "}
                    <button
                      onClick={() => setMode("login")}
                      className="font-bold text-blue-500 hover:underline"
                    >
                      بازگشت به ورود
                    </button>
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}