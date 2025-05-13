import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ConfigProvider } from 'antd'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {App as AntdApp} from 'antd'
import './App.css'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Analysis from './pages/Analysis'
import AppFooter from './components/AppFooter'
import ChatbotWidget from './components/Chatbot/ChatbotWidget'
import FindSchool from './pages/FindSchool'
import { useEffect } from 'react';


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      gcTime: 1000 * 60 * 5,
    },
  },
})

const TableauPreloader = () => {
  useEffect(() => {
    const iframe = document.createElement('iframe');
    iframe.src = 'https://public.tableau.com/views/Unipath/Chung?:embed=true';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    iframe.style.position = 'absolute';
    iframe.style.left = '-9999px';
    iframe.loading = 'eager';
    document.body.appendChild(iframe);

    return () => {
      document.body.removeChild(iframe);
    };
  }, []);

  return null; // không render gì
};

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
                <TableauPreloader />
                <Navbar />
              </header>

              <main>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/analytics" element={<Analysis />} />
                  <Route path="/find_school" element={<FindSchool/>} />
                </Routes>
                <ChatbotWidget />
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
