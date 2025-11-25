import { ThemeProvider } from "@/components/theme-provider-custom";
import { Toaster } from "@/components/ui/sonner";
import HomePage from "@/pages/Home";
import KanaPage from "@/pages/Kana";
import PhrasesPage from "@/pages/Phrases";
import WordsPage from "@/pages/Words";
import { Route, Routes } from "react-router-dom";

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="kana-theme">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/kana" element={<KanaPage />} />
        <Route path="/words" element={<WordsPage />} />
        <Route path="/phrases" element={<PhrasesPage />} />
      </Routes>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
