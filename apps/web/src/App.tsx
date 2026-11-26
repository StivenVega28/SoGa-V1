import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { SiteHeader } from '@/components/landing/SiteHeader';
import { Hero } from '@/components/landing/Hero';
import { CatalogSection } from '@/components/landing/CatalogSection';
import { FeaturedProduct } from '@/components/landing/FeaturedProduct';
import { AboutSection } from '@/components/landing/AboutSection';
import { QuoteSection } from '@/components/landing/QuoteSection';
import { SiteFooter } from '@/components/landing/SiteFooter';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { RutaProtegida } from '@/components/admin/RutaProtegida';
import { LoginPage } from '@/pages/LoginPage';
import { AdminInicioPage } from '@/pages/AdminInicioPage';
import { AdminProductosPage } from '@/pages/AdminProductosPage';
import { AdminProveedoresPage } from '@/pages/AdminProveedoresPage';
import { AdminClientesPage } from '@/pages/AdminClientesPage';
import { AdminUsuariosPage } from '@/pages/AdminUsuariosPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      retry: false,
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
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<LoginPage />} />

          <Route element={<RutaProtegida />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminInicioPage />} />
              <Route path="productos" element={<AdminProductosPage />} />
              <Route path="proveedores" element={<AdminProveedoresPage />} />
              <Route path="clientes" element={<AdminClientesPage />} />
              <Route path="usuarios" element={<AdminUsuariosPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
