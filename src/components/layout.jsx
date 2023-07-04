import Navbar from './navbar'
import Footer from './footer'
import React from 'react'

export default function Layout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  )
}