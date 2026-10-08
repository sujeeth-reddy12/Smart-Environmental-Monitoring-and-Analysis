import { RouterProvider } from 'react-router-dom'
import router from './router'
import { AuthProvider } from './context/AuthContext'
import { CityProvider } from './context/CityContext'

function App() {
  return (
    <AuthProvider>
      <CityProvider>
        <RouterProvider router={router} />
      </CityProvider>
    </AuthProvider>
  )
}

export default App
