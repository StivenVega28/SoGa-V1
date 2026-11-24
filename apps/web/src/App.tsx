import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SiteHeader } from '@/components/landing/SiteHeader';
import { Hero } from '@/components/landing/Hero';
import { CatalogSection } from '@/components/landing/CatalogSection';
import { FeaturedProduct } from '@/components/landing/FeaturedProduct';
import { AboutSection } from '@/components/landing/AboutSection';
import { QuoteSection } from '@/components/landing/QuoteSection';
import { SiteFooter } from '@/components/landing/SiteFooter';
import { LoginPage } from '@/pages/LoginPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  },
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <Hero />
        <CatalogSection />
        <FeaturedProduct />
        <AboutSection />
        <QuoteSection />
      </main>
      <SiteFooter />
    </div>
  );
}

export default function App() {
  const isLogin = window.location.pathname === '/login';

  return (
    <QueryClientProvider client={queryClient}>
      {isLogin ? <LoginPage /> : <Landing />}
    </QueryClientProvider>
  );
}
