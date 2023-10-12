import { Route, Routes } from 'react-router-dom'
import { routes } from './routes';

export const AppRouter = () => {
  return (
    <>
      <Routes>
        {routes.map(route => {
          return <Route path={ route.path } element={ <route.element/> } key={ route.path } />
        })}
      </Routes>
    </>
  )
}
