'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X, Instagram, Mail } from 'lucide-react'
import WhatsAppIcon from './WhatsAppIcon'

interface Props {
  contact: {
    whatsapp_link: string
    instagram_link: string
    email: string
  }
}

export default function Navbar({ contact }: Props) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 60)
          ticking = false
        })
        ticking = true
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const closeMenu = () => {
    setMenuOpen(false)
    document.body.style.overflow = ''
  }

  const openMenu = () => {
    setMenuOpen(true)
    document.body.style.overflow = 'hidden'
  }

  const isActive = (href: string) => pathname === href

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-blue-900/95 backdrop-blur-xl shadow-xl'
            : 'bg-transparent'
        }`}
        id="navbar"
        style={
          scrolled
            ? { borderBottom: '1px solid rgba(16,46,102,0.25)' }
            : undefined
        }
      >
        <div className="container flex items-center justify-between h-[70px]">
          {/* Logo */}
          <Link href="/" className="flex items-center" onClick={closeMenu}>
            <Image
              src="/images/logo.png"
              alt="GC2 Entrenamiento"
              width={706}
              height={309}
              sizes="92px"
              priority
              style={{ height: '40px', width: 'auto' }}
            />
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className={`font-body font-semibold text-[13px] uppercase tracking-[1.2px] transition-colors duration-200 relative
                after:absolute after:bottom-[-2px] after:left-0 after:w-0 after:h-[2px] after:bg-accent
                after:transition-all after:duration-300 hover:after:w-full hover:text-accent
                ${isActive('/') ? 'text-accent after:w-full' : 'text-white/60'}`}
            >
              Inicio
            </Link>
            <Link
              href="/planes"
              className={`font-body font-semibold text-[13px] uppercase tracking-[1.2px] transition-colors duration-200 relative
                after:absolute after:bottom-[-2px] after:left-0 after:w-0 after:h-[2px] after:bg-accent
                after:transition-all after:duration-300 hover:after:w-full hover:text-accent
                ${isActive('/planes') ? 'text-accent after:w-full' : 'text-white/60'}`}
            >
              Planes
            </Link>
            <Link
              href="/blog"
              className={`font-body font-semibold text-[13px] uppercase tracking-[1.2px] transition-colors duration-200 relative
                after:absolute after:bottom-[-2px] after:left-0 after:w-0 after:h-[2px] after:bg-accent
                after:transition-all after:duration-300 hover:after:w-full hover:text-accent
                ${isActive('/blog') ? 'text-accent after:w-full' : 'text-white/60'}`}
            >
              Blog
            </Link>
            <Link
              href="/contacto"
              className={`font-body font-semibold text-[13px] uppercase tracking-[1.2px] transition-colors duration-200 relative
                after:absolute after:bottom-[-2px] after:left-0 after:w-0 after:h-[2px] after:bg-accent
                after:transition-all after:duration-300 hover:after:w-full hover:text-accent
                ${isActive('/contacto') ? 'text-accent after:w-full' : 'text-white/60'}`}
            >
              Contacto
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-white p-2"
            onClick={openMenu}
            aria-label="Abrir menú"
          >
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 z-[100] flex flex-col justify-center items-center gap-8
          bg-blue-900/98 backdrop-blur-xl transition-transform duration-500
          ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        id="mobileMenu"
      >
        <button
          className="absolute top-5 right-5 text-white p-2"
          onClick={closeMenu}
          aria-label="Cerrar menú"
        >
          <X size={28} />
        </button>

        <Link
          href="/"
          onClick={closeMenu}
          className={`font-heading font-bold text-4xl uppercase tracking-wider
            ${isActive('/') ? 'gradient-text' : 'text-white hover:text-accent'} transition-colors`}
        >
          Inicio
        </Link>
        <Link
          href="/planes"
          onClick={closeMenu}
          className={`font-heading font-bold text-4xl uppercase tracking-wider
            ${isActive('/planes') ? 'gradient-text' : 'text-white hover:text-accent'} transition-colors`}
        >
          Planes
        </Link>
        <Link
          href="/blog"
          onClick={closeMenu}
          className={`font-heading font-bold text-4xl uppercase tracking-wider
            ${isActive('/blog') ? 'gradient-text' : 'text-white hover:text-accent'} transition-colors`}
        >
          Blog
        </Link>
        <Link
          href="/contacto"
          onClick={closeMenu}
          className={`font-heading font-bold text-4xl uppercase tracking-wider
            ${isActive('/contacto') ? 'gradient-text' : 'text-white hover:text-accent'} transition-colors`}
        >
          Contacto
        </Link>

        {/* Mobile socials */}
        <div className="flex items-center gap-6 mt-4">
          <a
            href={contact.instagram_link}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="text-white/70 hover:text-accent transition-colors"
          >
            <Instagram size={24} />
          </a>
          <a
            href={contact.whatsapp_link}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="text-white/70 hover:text-success transition-colors"
          >
            <WhatsAppIcon size={24} />
          </a>
          <a
            href={`mailto:${contact.email}`}
            aria-label="Email"
            className="text-white/70 hover:text-accent transition-colors"
          >
            <Mail size={24} />
          </a>
        </div>
      </div>
    </>
  )
}
