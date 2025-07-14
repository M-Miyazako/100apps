import { AppProvider } from './context/AppContext'
import { Header } from './components/Header'
import { SearchBar } from './components/SearchBar'
import { CategoryFilter } from './components/CategoryFilter'
import { AppGrid } from './components/AppGrid'
import { Stats } from './components/Stats'
import './App.css'

function App() {
  return (
    <AppProvider>
      <div className="app">
        <Header />
        <div className="container">
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
