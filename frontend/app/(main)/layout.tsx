import React from 'react'
import { AppSidebar } from './_components/sidebar'

interface MainLayoutProps {
    children: React.ReactNode
}
const MainLayout = ({children}:MainLayoutProps) => {
  return (
    <div className='flex h-screen w-screen'>
        <AppSidebar />
        {children}
    </div>
  )
}

export default MainLayout