import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AvitoBot — Парсер объявлений Авито",
  description: "Парсинг, анализ и статистика объявлений Авито",
};

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className="nav-link">
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
      <body>
        <nav style={{
          background: '#12121a',
          borderBottom: '1px solid #2a2a3a',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}>
          <div style={{
            maxWidth: 1280,
            margin: '0 auto',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 64,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36,
                height: 36,
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <svg width="20" height="20" fill="none" stroke="white" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <span style={{ fontSize: 20, fontWeight: 700, color: '#f0f0f5' }}>
                AvitoBot
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <NavLink href="/">Главная</NavLink>
              <NavLink href="/search">Поиск</NavLink>
              <NavLink href="/listings">Объявления</NavLink>
              <NavLink href="/analytics">Аналитика</NavLink>
              <NavLink href="/export">Экспорт</NavLink>
            </div>
          </div>
        </nav>

        <main style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '32px 24px',
        }}>
          {children}
        </main>
      </body>
    </html>
  );
}
