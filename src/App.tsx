import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import Index from './pages/Index';
import Archives from './pages/Archives';
import LowStock from './pages/LowStock';
import Withdrawals from './pages/Withdrawals';
import MaterialReferences from './pages/MaterialReferences';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/archives" element={<Archives />} />
        <Route path="/low-stock" element={<LowStock />} />
        <Route path="/withdrawals" element={<Withdrawals />} />
        <Route path="/references" element={<MaterialReferences />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;