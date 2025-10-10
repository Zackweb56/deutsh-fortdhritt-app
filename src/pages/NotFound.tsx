import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-100 dark:bg-neutral-950 transition-colors duration-300">
      <div className="text-center px-6 py-10 bg-white dark:bg-neutral-900 shadow-lg rounded-2xl border border-neutral-200 dark:border-neutral-800 max-w-md w-full">
        <h1 className="text-6xl font-extrabold text-neutral-900 dark:text-neutral-100 mb-4">
          404
        </h1>
        <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 mb-8">
          عذراً! الصفحة التي تبحث عنها غير موجودة
        </p>
        <a
          href="/"
          className="
            inline-flex items-center justify-center gap-2
            px-5 py-2.5 rounded-lg
            bg-neutral-900 text-neutral-100
            dark:bg-neutral-100 dark:text-neutral-900
            font-medium transition-all duration-300
            hover:scale-105 hover:shadow-md hover:bg-neutral-800
            dark:hover:bg-neutral-200
          "
        >
          <ArrowLeft className="h-4 w-4" />
          العودة إلى الصفحة الرئيسية
        </a>

        <div className="mt-6 text-sm text-neutral-500 dark:text-neutral-500">
          المسار الذي حاولت الوصول إليه:
          <span className="block mt-1 font-mono text-xs break-all text-neutral-700 dark:text-neutral-400">
            {location.pathname}
          </span>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
