import { ThemeProvider } from "@/components/theme-provider-custom";
import { Toaster } from "@/components/ui/sonner";
import { GlobalShortcutsProvider } from "@/components/global-shortcuts-provider";
import { useDB } from "@/hooks/use-db";
import HomePage from "@/pages/Home";
import KanaPage from "@/pages/Kana";
import PhrasesPage from "@/pages/Phrases";
import WordsPage from "@/pages/Words";
import StudyPlansPage from "@/pages/StudyPlans";
import BadgesPage from "@/pages/Badges";
import PlanLearnPage from "@/pages/PlanLearn";
import { Route, Routes } from "react-router-dom";

function App() {
  const { isReady, error } = useDB();

  if (error) {
    console.error("Database initialization error:", error);
  }

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <ThemeProvider defaultTheme="system" storageKey="kana-theme">
      <GlobalShortcutsProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/kana" element={<KanaPage />} />
          <Route path="/words" element={<WordsPage />} />
          <Route path="/phrases" element={<PhrasesPage />} />
          <Route path="/study-plans" element={<StudyPlansPage />} />
          <Route
            path="/study-plans/:planId/learn"
            element={<PlanLearnPage />}
          />
          <Route path="/badges" element={<BadgesPage />} />
        </Routes>
        <Toaster />
      </GlobalShortcutsProvider>
    </ThemeProvider>
  );
}

export default App;
