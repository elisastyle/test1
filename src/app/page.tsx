"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MatchCard, { AuthModal } from "./component";

type Match = {
  id: string;
  home: string;
  away: string;
  spectators: number;
  start: number;
};

type ToastType = "success" | "error" | "info";

type ToastState = {
  message: string;
  type: ToastType;
} | null;

type UserPredictions = {
  [matchId: string]: {
    prediction: string;
    timestamp: number;
  };
};

const INITIAL_MATCHES: Match[] = [
  {
    id: "1",
    home: "استقلال",
    away: "پرسپولیس",
    spectators: 15000,
    start: Date.now(),
  },
  {
    id: "2",
    home: "رئال مادرید",
    away: "بارسلونا",
    spectators: 80000,
    start: Date.now() - 300000,
  },
];

function MatchSkeleton() {
  return (
    <div className="p-5 rounded-2xl border border-dashed border-gray-300 animate-pulse bg-gray-200/50">
      <div className="flex justify-between mb-4">
        <div className="h-5 w-24 bg-zinc-700 rounded"></div>
        <div className="h-5 w-10 bg-zinc-700 rounded"></div>
        <div className="h-5 w-24 bg-zinc-700 rounded"></div>
      </div>

      <div className="flex justify-between items-end">
        <div>
          <div className="h-4 w-40 bg-zinc-700 rounded mb-2"></div>
          <div className="h-4 w-32 bg-zinc-700 rounded"></div>
        </div>

        <div className="h-9 w-24 bg-zinc-700 rounded-xl"></div>
      </div>
    </div>
  );
}

export default function Footballino() {
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);
  const [coins, setCoins] = useState(0);
  const [toast, setToast] = useState<ToastState>(null);

  const [prediction, setPrediction] = useState("");
  const [matches, setMatches] = useState<Match[]>(INITIAL_MATCHES);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  const [theme, setTheme] = useState("dark");
  const [authMode, setAuthMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);

  const [userPredictions, setUserPredictions] = useState<UserPredictions>({});
  const [favoriteTeams, setFavoriteTeams] = useState<string[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");

  const [user, setUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSec, setCurrentSec] = useState(0);

  const isDark = theme === "dark";

  const showToast = (message: string, type: ToastType = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!user) return;

    const savedCoins = localStorage.getItem(`coins_${user}`);
    if (savedCoins) {
      setCoins(Number(savedCoins));
    } else {
      setCoins(0);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    localStorage.setItem(`coins_${user}`, String(coins));
  }, [coins, user]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme);
    document.documentElement.classList.toggle("dark", savedTheme === "dark");
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(savedUser);

    const savedPredictions = localStorage.getItem(`userPredictions_${user}`);


    const savedFavs = localStorage.getItem("favoriteTeams");
    if (savedFavs) {
      setFavoriteTeams(JSON.parse(savedFavs));
    }
  }, []);

  useEffect(() => {
    if (user) {
  localStorage.setItem(`userPredictions_${user}`, JSON.stringify(userPredictions));
}

  }, [userPredictions]);

  useEffect(() => {
    localStorage.setItem("favoriteTeams", JSON.stringify(favoriteTeams));
  }, [favoriteTeams]);

 useEffect(() => {
  const t = setInterval(() => {
    setCurrentSec((prev) => {

      // ✅ اگر زمان راند تمام شده
      if (prev >= 59) {

        // ✅ محاسبه اختلاف و دادن کوین
        if (user) {

          Object.keys(userPredictions).forEach((matchId) => {

            const pred = userPredictions[matchId]?.prediction;
            const match = matches.find((m) => m.id === matchId);

            if (!match || !pred) return;

            const predictedValue = parseInt(pred, 10);
            const diff = Math.abs(match.spectators - predictedValue);

            let coinsEarned = 0;

            if (diff === 0) coinsEarned = 10;
            else if (diff <= 10) coinsEarned = 8;
            else if (diff <= 30) coinsEarned = 5;
            else if (diff <= 100) coinsEarned = 3;

            setCoins((prevCoins) => prevCoins + coinsEarned);

          });

        }

        // ✅ پاک کردن پیش‌بینی‌ها
        setUserPredictions({});

        if (user) {
          localStorage.removeItem(`userPredictions_${user}`);
        }

        // ✅ ساخت راند جدید (ID جدید برای مسابقات)
        setMatches((oldMatches) =>
          oldMatches.map((m) => ({
            ...m,
            id: crypto.randomUUID(),
            start: Date.now(),
          }))
        );

        return 0; // ریست تایمر
      }

      return prev + 1;
    });
  }, 1000);

  return () => clearInterval(t);
}, [user, userPredictions, matches]);



  useEffect(() => {
    const t = setInterval(() => {
      setCurrentSec((prev) => (prev >= 59 ? 0 : prev + 1));
    }, 1000);

    return () => clearInterval(t);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const toggleFavoriteTeam = (team: string) => {
    setFavoriteTeams((prev) =>
      prev.includes(team) ? prev.filter((t) => t !== team) : [...prev, team]
    );
  };

  const handleAuthSubmit = () => {
    if (!authEmail || !authPassword) {
      showToast("ایمیل و رمز عبور را وارد کنید", "error");
      return;
    }

    const getUsers = () => {
      return JSON.parse(localStorage.getItem("users") || "[]");
    };

    const users = getUsers();
    const existing = users.find((u: any) => u.email === authEmail);

    if (authMode === "login") {
      if (!existing || existing.password !== authPassword) {
        showToast("ایمیل یا رمز اشتباه است", "error");
        return;
      }

      localStorage.setItem("user", authEmail);
      setUser(authEmail);
      setShowAuthModal(false);
      showToast("با موفقیت وارد شدید", "success");
    }

    if (authMode === "register") {
      if (existing) {
        showToast("این ایمیل قبلاً ثبت شده", "error");
        return;
      }

      const newUser = {
        email: authEmail,
        password: authPassword,
        coins: 0,
      };

      const newUsers = [...users, newUser];
      localStorage.setItem("users", JSON.stringify(newUsers));
      localStorage.setItem("user", authEmail);

      setUser(authEmail);
      setShowAuthModal(false);
      showToast("ثبت‌نام با موفقیت انجام شد", "success");
    }

    setAuthEmail("");
    setAuthPassword("");
    setAuthName("");
  };
  const handlePredict = () => {
    if (!prediction || !selectedMatch) return;

    if (currentSec >= 55) {
      showToast("زمان پیش‌بینی یا ویرایش به پایان رسیده است.", "error");
      setSelectedMatch(null);
      setPrediction("");
      return;
    }

    const existingPrediction = userPredictions[selectedMatch.id];
    const isEditing = !!existingPrediction && currentSec <= 55;

    
  setUserPredictions((prev) => ({
  ...prev,
  [selectedMatch.id]: { prediction, timestamp: Date.now() },
}));

showToast("پیش‌بینی ثبت شد ✅", "success");

setSelectedMatch(null);
setPrediction("");
};

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark ? "bg-zinc-950 text-white" : "bg-gray-50 text-zinc-900"
      }`}
    >
      <header
        className={`flex flex-wrap justify-between items-center w-full gap-2 py-3 px-3 sm:px-4 lg:px-6 border-b transition-colors duration-300 ${
          isDark
            ? "border-zinc-800 bg-zinc-950/50"
            : "border-gray-200 bg-white/80 shadow-sm"
        }`}
      >
        <h1
          className={`text-xl sm:text-2xl lg:text-3xl font-black ${
            isDark ? "text-yellow-500" : "text-yellow-600"
          }`}
        >
          فوتبالینو ⚽
        </h1>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 justify-end flex-grow">
          <button
            onClick={toggleTheme}
            className={`px-2 py-1 sm:px-3 sm:py-2 rounded-lg text-sm transition-colors ${
              isDark
                ? "bg-zinc-800 text-yellow-400 hover:bg-zinc-700"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {isDark ? "☀️" : "🌙"}
          </button>

          {user ? (
            <div
              className={`flex items-center gap-1 sm:gap-2 px-2 py-1 sm:px-3 sm:py-2 rounded-lg border transition-colors ${
                isDark
                  ? "border-zinc-700 bg-zinc-800"
                  : "border-gray-300 bg-white shadow-sm"
              }`}
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-xs sm:text-sm font-bold text-white">
                {user.charAt(0).toUpperCase()}
              </div>
              <span
                className={`text-xs sm:text-sm truncate max-w-[80px] sm:max-w-none hidden sm:inline ${
                  isDark ? "text-zinc-200" : "text-zinc-700"
                }`}
              >
                {user}
              </span>
              <button
                onClick={() => {
                  localStorage.removeItem("user");
                  setUser(null);
                }}
                className="bg-red-500 hover:bg-red-600 p-1.5 rounded-md text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm transition-all shadow-md"
            >
              ورود / ثبت‌نام
            </button>
          )}

          {user && (
            <button
              onClick={() => setShowFavoritesModal(true)}
              className="text-red-500 hover:scale-110 transition-transform text-lg"
            >
              ❤️
            </button>
          )}

          <div
            className={`px-2 py-1 sm:px-3 sm:py-2 rounded-full border flex items-center gap-1 ${
              isDark
                ? "bg-zinc-800 border-yellow-600/50"
                : "bg-yellow-50 border-yellow-200 shadow-sm"
            }`}
          >
            <span>💰</span>
            {user && (
              <span
                className={`font-bold text-xs sm:text-sm ${
                  isDark ? "text-yellow-500" : "text-yellow-700"
                }`}
              >
                {coins}
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 max-w-4xl mx-auto px-4">
        {loading
    ? Array.from({ length: 3 }).map((_, i) => <MatchSkeleton key={i} />)
    : matches.map((match) => (
        <MatchCard
          key={match.id}
          match={match}
          theme={theme}
          currentSec={currentSec}
          userPredictions={user ? userPredictions : {}}
          user={user}
          isTeamFavorite={(team) => favoriteTeams.includes(team)}
          toggleFavoriteTeam={toggleFavoriteTeam}
          onPredict={(selected) => {
            if (!user) {
              showToast("برای پیش‌بینی باید وارد شوید", "error");
              setShowAuthModal(true);
              return;
            }
            setSelectedMatch(selected);
          }}
        />
      ))}
</div>

      <AuthModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={(email: string) => setUser(email)}
        showToast={showToast}
        theme={theme}
        authMode={authMode}
        setAuthMode={setAuthMode}
        authName={authName}
        setAuthName={setAuthName}
        authEmail={authEmail}
        setAuthEmail={setAuthEmail}
        authPassword={authPassword}
        setAuthPassword={setAuthPassword}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        onSubmit={handleAuthSubmit}
      />

      {selectedMatch && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div
            className={`w-full max-w-md p-8 rounded-3xl shadow-2xl transform transition-all ${
              isDark
                ? "bg-zinc-900 border border-zinc-700 text-white"
                : "bg-white border border-gray-100 text-zinc-900"
            }`}
          >
            <h2 className="text-xl font-bold mb-2">ثبت پیش‌بینی</h2>
            <p className={`text-sm mb-6 ${isDark ? "text-zinc-400" : "text-gray-500"}`}>
              فکر می‌کنی تعداد تماشاگران بازی {selectedMatch.home} چقدر است؟
            </p>

            <input
              type="number"
              value={prediction}
              onChange={(e) => setPrediction(e.target.value)}
              placeholder="مثلاً 15200"
              className={`w-full p-4 rounded-xl mb-6 text-center text-2xl outline-none transition-all border-2 ${
                isDark
                  ? "bg-zinc-800 border-zinc-700 text-white focus:border-yellow-500"
                  : "bg-gray-50 border-gray-200 text-zinc-900 focus:border-yellow-500"
              }`}
            />

            <div className="flex gap-3">
              <button
                onClick={handlePredict}
                className="flex-[2] bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 rounded-xl transition-transform active:scale-95"
              >
                ثبت و دریافت کوین
              </button>
              <button
                onClick={() => setSelectedMatch(null)}
                className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                  isDark ? "bg-zinc-700 hover:bg-zinc-600" : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                لغو
              </button>
            </div>
          </div>
        </div>
      )}

      {showFavoritesModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div
            className={`w-full max-w-md p-6 rounded-2xl shadow-xl ${
              isDark ? "bg-zinc-900 text-white" : "bg-white text-zinc-900"
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">❤️ علاقه‌مندی‌ها</h2>

              <button
                onClick={() => setShowFavoritesModal(false)}
                className="text-red-500 text-xl"
              >
                ✖
              </button>
            </div>

            {favoriteTeams.length === 0 ? (
              <p className="text-sm text-gray-400">هیچ تیمی ذخیره نشده 😢</p>
            ) : (
              <div className="flex flex-col gap-2">
                {favoriteTeams.map((team) => (
                  <div
                    key={team}
                    className={`p-3 rounded-lg border ${
                      isDark ? "border-zinc-700" : "border-gray-200"
                    }`}
                  >
                    {team}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 40, x: "-50%" }}
            className={`fixed bottom-6 left-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border transition-colors duration-300 ${
              isDark
                ? "bg-zinc-900/90 text-zinc-100 border-zinc-700/50 backdrop-blur-md"
                : "bg-white/90 text-zinc-900 border-gray-200/50 backdrop-blur-md"
            } ${
              toast.type === "success"
                ? isDark
                  ? "border-emerald-500/50 text-emerald-400"
                  : "border-emerald-200 text-emerald-600"
                : toast.type === "error"
                ? isDark
                  ? "border-red-500/50 text-red-400"
                  : "border-red-200 text-red-600"
                : ""
            }`}
          >
            <span className="text-lg">
              {toast.type === "success" && "✅"}
              {toast.type === "error" && "❌"}
              {toast.type === "info" && "ℹ️"}
            </span>
            <span className="font-medium text-sm sm:text-base">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
