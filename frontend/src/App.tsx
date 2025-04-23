import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ConfigProvider,theme } from 'antd'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {App as AntdApp} from 'antd'
import './App.css'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import AppFooter from './components/AppFooter'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      gcTime: 1000 * 60 * 5,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#1E894E',
            fontFamily: 'Inter, sans-serif',
          },
          components: {
            Menu: {
              itemSelectedColor: '#1E894E',
              itemHoverColor: '#1E894E',
            },
          },
        }}
      >
        <AntdApp>
          <Router>
            <div className="app-container">
              <header>
                <Navbar />
              </header>

              <main>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  {/* <Route path="/about" element={<AboutPage />} />
                  <Route path="/dashboard" element={<Dashboard />} /> */}
                  
                </Routes>
              </main>

              <footer>
                <AppFooter />
              </footer>
            </div>
          </Router>
        </AntdApp>
      </ConfigProvider>

      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App
