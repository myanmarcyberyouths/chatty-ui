import { Outlet } from 'react-router'

export default function AuthLayout() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-background">
        <Outlet />
    </main>
  )
}