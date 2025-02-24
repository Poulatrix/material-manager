
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import LowStock from "./pages/LowStock";
import Withdrawals from "./pages/Withdrawals";
import Archives from "./pages/Archives";
import PriceCalculator from "./pages/PriceCalculator";
import FuturePurchases from "./pages/FuturePurchases";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/low-stock" element={<LowStock />} />
          <Route path="/withdrawals" element={<Withdrawals />} />
          <Route path="/archives" element={<Archives />} />
          <Route path="/price-calculator" element={<PriceCalculator />} />
          <Route path="/future-purchases" element={<FuturePurchases />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
