import { Route, Routes } from 'react-router-dom'
import './App.css'
import { Home, Report } from './pages'

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Home></Home>} />
        <Route path="/report" element={<Report></Report>} />
        {/* <Route path="*" element={<NotFound />} /> */}
      </Routes>
    </>
  )
}

export default App
