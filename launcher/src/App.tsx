import { AppProvider } from './context/AppContext'
import { Header } from './components/Header'
import { SearchBar } from './components/SearchBar'
import { CategoryFilter } from './components/CategoryFilter'
import { AppGrid } from './components/AppGrid'
import { Stats } from './components/Stats'
import { useBreakpoint } from './hooks/useWindowSize'
import './App.css'

function App() {
  const { isMobile } = useBreakpoint();

  return (
    <AppProvider>
      <div className={`app ${isMobile ? 'mobile' : ''}`}>
        <Header />
        <div className={`container ${isMobile ? 'mobile-container' : ''}`}>
          <SearchBar />
          <CategoryFilter />
          <Stats />
          <AppGrid />
        </div>
      </div>
    </AppProvider>
  )
}

export default App
