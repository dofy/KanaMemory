import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@/components/theme-provider-custom'
import { Toaster } from '@/components/ui/sonner'
import HomePage from '@/pages/Home'
import KanaPage from '@/pages/Kana'
import WordsPage from '@/pages/Words'
import PhrasesPage from '@/pages/Phrases'

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="kana-theme">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/kana" element={<KanaPage />} />
        <Route path="/words" element={<WordsPage />} />
        <Route path="/phrases" element={<PhrasesPage />} />
      </Routes>
      <Toaster />
    </ThemeProvider>
  )
}

export default App

