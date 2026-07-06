import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AvitoBot — Парсер объявлений Авито",
  description: "Парсинг, анализ и статистика объявлений Авито",
};

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors"
    >
      {children}
    </a>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="bg-gray-100 min-h-screen">
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-gray-900">AvitoBot</span>
              </div>

              <div className="flex items-center gap-1">
                <NavLink href="/">Главная</NavLink>
                <NavLink href="/search">Поиск</NavLink>
                <NavLink href="/listings">Объявления</NavLink>
                <NavLink href="/analytics">Аналитика</NavLink>
                <NavLink href="/export">Экспорт</NavLink>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
