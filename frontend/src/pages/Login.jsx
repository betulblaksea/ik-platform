"use client"
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion"
import { Mail, Lock, User, Shield, ArrowRight, Cpu, Activity, CheckCircle2 } from "lucide-react"

const AURORA_FLOW = [
  "linear-gradient(45deg, rgba(99, 102, 241, 0.2) 0%, transparent 50%, rgba(34, 211, 238, 0.15) 100%)",
  "linear-gradient(135deg, rgba(168, 85, 247, 0.18) 0%, transparent 50%, rgba(20, 184, 166, 0.15) 100%)",
  "linear-gradient(225deg, rgba(79, 70, 229, 0.2) 0%, transparent 50%, rgba(6, 182, 212, 0.18) 100%)",
  "linear-gradient(315deg, rgba(139, 92, 246, 0.18) 0%, transparent 50%, rgba(13, 148, 136, 0.15) 100%)",
  "linear-gradient(45deg, rgba(99, 102, 241, 0.2) 0%, transparent 50%, rgba(34, 211, 238, 0.15) 100%)",
]

function AuroraMeshGradient() {
  return (
    <div className="absolute inset-0 overflow-hidden z-0">
      <div className="login-aurora__base absolute inset-0" />
      <motion.div
        className="login-aurora__blob login-aurora__blob--1"
        animate={{ x: [0, 200, 100, 0], y: [0, 150, 250, 0], scale: [1, 1.3, 0.9, 1] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="login-aurora__blob login-aurora__blob--2"
        animate={{ x: [0, -150, -80, 0], y: [0, -100, -200, 0], scale: [1, 0.85, 1.2, 1] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="login-aurora__blob login-aurora__blob--3"
        animate={{ x: [0, 120, -60, 0], y: [0, 80, 150, 0], scale: [1, 1.1, 0.95, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="login-aurora__blob login-aurora__blob--4"
        animate={{ x: [0, -100, 50, 0], y: [0, -70, 100, 0], scale: [1, 1.2, 0.9, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="login-aurora__flow"
        animate={{ background: AURORA_FLOW }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  )
}

function InteractiveNeuralNetwork({ mouseX, mouseY }) {
  const canvasRef = useRef(null)
  const particlesRef = useRef([])
  const animationRef = useRef(0)
  const mousePos = useRef({ x: 0.5, y: 0.5 })

  useEffect(() => {
    const particles = []
    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        vx: (Math.random() - 0.5) * 0.025,
        vy: (Math.random() - 0.5) * 0.025,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.2,
        hue: Math.random() * 60 + 180,
      })
    }
    particlesRef.current = particles
  }, [])

  useEffect(() => {
    const unsubX = mouseX.on("change", (v) => { mousePos.current.x = v })
    const unsubY = mouseY.on("change", (v) => { mousePos.current.y = v })
    return () => { unsubX(); unsubY() }
  }, [mouseX, mouseY])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener("resize", resize)

    const animate = () => {
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const particles = particlesRef.current
      const { x: mx, y: my } = mousePos.current

      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i]
        const p1x = (p1.x / 100) * canvas.width
        const p1y = (p1.y / 100) * canvas.height

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const p2x = (p2.x / 100) * canvas.width
          const p2y = (p2.y / 100) * canvas.height
          const dx = p1x - p2x
          const dy = p1y - p2y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 100) {
            const opacity = (1 - dist / 100) * 0.2
            const midX = (p1.x + p2.x) / 200
            const midY = (p1.y + p2.y) / 200
            const mouseDist = Math.sqrt(Math.pow(mx - midX, 2) + Math.pow(my - midY, 2))
            const mouseBoost = mouseDist < 0.2 ? (0.2 - mouseDist) * 1.5 : 0

            ctx.beginPath()
            ctx.moveTo(p1x, p1y)
            ctx.lineTo(p2x, p2y)
            const gradient = ctx.createLinearGradient(p1x, p1y, p2x, p2y)
            gradient.addColorStop(0, `hsla(${p1.hue}, 75%, 55%, ${opacity + mouseBoost})`)
            gradient.addColorStop(1, `hsla(${p2.hue}, 75%, 55%, ${opacity + mouseBoost})`)
            ctx.strokeStyle = gradient
            ctx.lineWidth = 0.4 + mouseBoost * 1.5
            ctx.stroke()
          }
        }
      }

      for (const p of particles) {
        const nodePosX = p.x / 100
        const nodePosY = p.y / 100
        const dx = mx - nodePosX
        const dy = my - nodePosY
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < 0.25) {
          const force = (0.25 - dist) * 0.006
          p.vx += dx * force * 0.3
          p.vy += dy * force * 0.3
        }

        p.vx *= 0.99
        p.vy *= 0.99
        p.x += p.vx
        p.y += p.vy

        if (p.x < -5) p.x = 105
        if (p.x > 105) p.x = -5
        if (p.y < -5) p.y = 105
        if (p.y > 105) p.y = -5

        const screenX = (p.x / 100) * canvas.width
        const screenY = (p.y / 100) * canvas.height
        const glowBoost = dist < 0.2 ? (0.2 - dist) * 2.5 : 0

        const gradient = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, p.size * 3)
        gradient.addColorStop(0, `hsla(${p.hue}, 80%, 65%, ${(p.opacity + glowBoost) * 0.35})`)
        gradient.addColorStop(1, `hsla(${p.hue}, 80%, 55%, 0)`)
        ctx.beginPath()
        ctx.arc(screenX, screenY, p.size * 3, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()

        ctx.beginPath()
        ctx.arc(screenX, screenY, p.size * (1 + glowBoost * 0.4), 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${p.hue}, 85%, 70%, ${p.opacity + glowBoost * 0.4})`
        ctx.fill()
      }

      animationRef.current = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(animationRef.current)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="login-geo-wrap absolute inset-0 pointer-events-none z-0"
    />
  )
}

function FloatingGeometrics({ mouseX, mouseY }) {
  const springConfig = { damping: 30, stiffness: 50 }
  const x1 = useSpring(useTransform(mouseX, [0, 1], [-30, 30]), springConfig)
  const y1 = useSpring(useTransform(mouseY, [0, 1], [-30, 30]), springConfig)
  const x2 = useSpring(useTransform(mouseX, [0, 1], [20, -20]), springConfig)
  const y2 = useSpring(useTransform(mouseY, [0, 1], [20, -20]), springConfig)
  const x3 = useSpring(useTransform(mouseX, [0, 1], [-15, 15]), springConfig)
  const y3 = useSpring(useTransform(mouseY, [0, 1], [15, -15]), springConfig)
  const x4 = useSpring(useTransform(mouseX, [0, 1], [25, -25]), springConfig)
  const y4 = useSpring(useTransform(mouseY, [0, 1], [-25, 25]), springConfig)

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <motion.div className="absolute login-geo-pos--1" style={{ x: x1, y: y1 }}>
        <motion.div
          className="login-geo-ring"
          animate={{ rotateX: [0, 360], rotateY: [0, 180] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>
      <motion.div className="absolute login-geo-pos--2" style={{ x: x2, y: y2 }}>
        <motion.div
          className="login-geo-sphere"
          animate={{ scale: [1, 1.1, 1], rotateZ: [0, 360] }}
          transition={{
            scale: { duration: 8, repeat: Infinity, ease: "easeInOut" },
            rotateZ: { duration: 30, repeat: Infinity, ease: "linear" },
          }}
        />
      </motion.div>
      <motion.div className="absolute login-geo-pos--3" style={{ x: x3, y: y3 }}>
        <motion.div
          className="login-geo-torus"
          animate={{ rotateX: [60, 60], rotateZ: [0, 360] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>
      <motion.div className="absolute login-geo-pos--4" style={{ x: x4, y: y4 }}>
        <motion.div
          className="login-geo-diamond"
          animate={{ rotateY: [0, 360], rotateZ: [0, 180, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>
    </div>
  )
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.3 } },
}

const staggerItem = {
  hidden: { opacity: 0, y: 25, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 200, damping: 20 } },
}

const roleConfig = {
  employee: {
    accent: "var(--role-employee-accent)",
    glow: "var(--role-employee-glow)",
    gradient: "var(--role-employee-gradient)",
    hue: 200,
  },
  manager: {
    accent: "var(--role-manager-accent)",
    glow: "var(--role-manager-glow)",
    gradient: "var(--role-manager-gradient)",
    hue: 280,
  },
}

const BADGE_GLOW = [
  "0 0 20px rgba(34, 211, 238, 0.15), 0 0 40px rgba(34, 211, 238, 0.08)",
  "0 0 30px rgba(34, 211, 238, 0.3), 0 0 60px rgba(34, 211, 238, 0.15)",
  "0 0 20px rgba(34, 211, 238, 0.15), 0 0 40px rgba(34, 211, 238, 0.08)",
]

export function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [selectedRole, setSelectedRole] = useState("employee")
  const [authMode, setAuthMode] = useState("login")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [authError, setAuthError] = useState("")
  const [registerSuccessUser, setRegisterSuccessUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(false)
  const [isButtonHovered, setIsButtonHovered] = useState(false)
  const [hoveredRole, setHoveredRole] = useState(null)
  const containerRef = useRef(null)
  const buttonRef = useRef(null)

  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)
  const buttonX = useMotionValue(0)
  const buttonY = useMotionValue(0)
  const springButtonX = useSpring(buttonX, { damping: 15, stiffness: 150 })
  const springButtonY = useSpring(buttonY, { damping: 15, stiffness: 150 })

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        mouseX.set((e.clientX - rect.left) / rect.width)
        mouseY.set((e.clientY - rect.top) / rect.height)
      }
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [mouseX, mouseY])

  const handleButtonMouseMove = (e) => {
    if (!buttonRef.current) return
    const rect = buttonRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    buttonX.set((e.clientX - centerX) * 0.12)
    buttonY.set((e.clientY - centerY) * 0.12)
  }

  const handleButtonMouseLeave = () => {
    buttonX.set(0)
    buttonY.set(0)
    setIsButtonHovered(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setAuthError("")
    setRegisterSuccessUser(null)
    setAuthLoading(true)
    try {
      const path = authMode === "register" ? "/api/auth/register" : "/api/auth/login"
      const body =
        authMode === "register"
          ? { email, password, name, role: "manager" }
          : { email, password, role: selectedRole }
      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setAuthError(data.message || "Bir hata oluştu")
        return
      }
      if (data.token != null || data.user != null) {
        signIn({ token: data.token ?? null, user: data.user ?? null })
      }
      if (authMode === "register" && data.user) {
        setRegisterSuccessUser(data.user)
        return
      }
      navigate(data.user?.role === "manager" ? "/dashboard" : "/tasks")
    } catch {
      setAuthError("Sunucuya ulaşılamadı. API çalışıyor mu?")
    } finally {
      setAuthLoading(false)
    }
  }

  const effectiveRole = authMode === "register" ? "manager" : selectedRole
  const currentConfig = roleConfig[effectiveRole]
  const loginThemeVars = {
    "--login-glow": currentConfig.glow,
    "--login-gradient": currentConfig.gradient,
  }

  return (
    <div ref={containerRef} className="login-page">
      <AuroraMeshGradient />
      <InteractiveNeuralNetwork mouseX={mouseX} mouseY={mouseY} />
      <FloatingGeometrics mouseX={mouseX} mouseY={mouseY} />

      <div className="login-hero">
        <motion.div className="max-w-xl" initial="hidden" animate="visible" variants={staggerContainer}>
          <motion.h1 className="text-5xl xl:text-6xl font-bold leading-tight mb-6" variants={staggerItem}>
            <span className="relative inline-block">
              <span className="login-hero__glow absolute inset-0" />
              <motion.span
                className="relative bg-clip-text text-transparent login-hero__title-gradient"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                İnsan kaynaklarını
              </motion.span>
            </span>
            <br />
            <motion.span
              className="text-white inline-block"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              tek yerden yönetin
            </motion.span>
          </motion.h1>

          <motion.p className="text-lg text-gray-400 mb-10 max-w-md leading-relaxed" variants={staggerItem}>
            Görevler, çalışma saatleri ve kadro planlaması için sade bir yönetim paneli.
          </motion.p>

          <motion.div variants={staggerItem}>
            <motion.div
              className="login-hero__badge"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
                boxShadow: BADGE_GLOW,
              }}
              transition={{ opacity: { duration: 0.6, delay: 1 }, scale: { duration: 0.6, delay: 1, type: "spring" }, boxShadow: { duration: 2.5, repeat: Infinity } }}
            >
              <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ x: "-100%" }}
                animate={{ x: "200%" }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
              >
                <div className="login-hero__badge-shine h-full" />
              </motion.div>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }}>
                <Cpu className="w-4 h-4 text-cyan-400" />
              </motion.div>
              <motion.span
                className="text-sm font-semibold bg-clip-text text-transparent login-hero__badge-text"
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Yapay zeka destekli
              </motion.span>
              <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.2, repeat: Infinity }}>
                <Activity className="w-3.5 h-3.5 text-teal-400" />
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      <div className="login-card-wrap">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 100 }}
        >
          <motion.div
            className="login-card"
            style={loginThemeVars}
            animate={{
              boxShadow: `0 0 0 1px rgba(255, 255, 255, 0.06), 0 30px 80px -20px rgba(0, 0, 0, 0.65), 0 0 120px -30px var(--login-glow)`,
            }}
            transition={{ duration: 0.5 }}
          >
            <div className="login-card__inner-glow" />

            <motion.div variants={staggerContainer} initial="hidden" animate="visible">
              <motion.div className="relative mb-8" variants={staggerItem}>
                <h2 className="text-2xl font-semibold text-white">
                  {registerSuccessUser
                    ? "Kayıt tamam"
                    : authMode === "register"
                      ? "Yönetici Hesabı Oluştur"
                      : "Giriş yap"}
                </h2>
                <p className="text-gray-400 text-sm mt-1.5">
                  {registerSuccessUser
                    ? "Hesabınız oluşturuldu. Panele geçebilir veya yeni bir kayıt yapabilirsiniz."
                    : authMode === "register"
                      ? "Yönetici hesabı için bilgilerinizi girin."
                      : "Panonuza devam etmek için e-posta ve şifrenizi girin."}
                </p>
              </motion.div>

              {!registerSuccessUser && authMode === "login" ? (
              <motion.div className="mb-7" variants={staggerItem}>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 block">Rolünüzü seçin</label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: "employee", title: "Çalışan", description: "Görevler ve sabah girişi", Icon: User },
                    { id: "manager", title: "Yönetici", description: "Ekibinizi yönetin", Icon: Shield },
                  ].map((role) => {
                    const isSelected = selectedRole === role.id
                    const isHovered = hoveredRole === role.id
                    const config = roleConfig[role.id]
                    const roleVars = {
                      "--role-accent": config.accent,
                      "--role-glow": config.glow,
                      "--role-gradient": config.gradient,
                    }

                    return (
                      <motion.button
                        key={role.id}
                        type="button"
                        onClick={() => setSelectedRole(role.id)}
                        onMouseEnter={() => setHoveredRole(role.id)}
                        onMouseLeave={() => setHoveredRole(null)}
                        className={`login-role-card login-role-card--${role.id}${isSelected ? " login-role-card--selected" : ""}`}
                        style={roleVars}
                        animate={{
                          scale: isHovered ? 1.03 : 1,
                          boxShadow:
                            isSelected || isHovered
                              ? `0 0 30px var(--role-glow), 0 0 50px color-mix(in srgb, var(--role-glow) 43%, transparent), inset 0 1px 0 rgba(255,255,255,0.08)`
                              : "0 0 0px transparent, inset 0 1px 0 rgba(255,255,255,0.04)",
                        }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      >
                        <motion.div
                          className="absolute inset-0 rounded-2xl pointer-events-none"
                          animate={{
                            boxShadow: isSelected
                              ? "inset 0 0 0 2px var(--role-accent)"
                              : isHovered
                              ? "inset 0 0 0 1px rgba(var(--role-rgb), 0.5)"
                              : "inset 0 0 0 1px rgba(100, 100, 120, 0.25)",
                          }}
                          transition={{ duration: 0.3 }}
                        />

                        <AnimatePresence>
                          {isSelected && (
                            <motion.div
                              className="login-role-card__pulse"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: [0.2, 0.35, 0.2] }}
                              exit={{ opacity: 0 }}
                              transition={{ opacity: { duration: 2, repeat: Infinity } }}
                            />
                          )}
                        </AnimatePresence>

                        <div className="relative">
                          <motion.div
                            className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                            animate={{
                              background: isSelected ? "var(--role-gradient)" : "rgba(30, 30, 50, 0.8)",
                              boxShadow: isSelected ? "0 4px 20px var(--role-glow)" : "none",
                            }}
                            transition={{ duration: 0.3 }}
                          >
                            <role.Icon className={`w-5 h-5 transition-colors duration-300 ${isSelected ? "text-white" : "text-gray-400"}`} />
                          </motion.div>
                          <h3 className={`font-semibold text-sm transition-colors duration-300 ${isSelected ? "text-white" : "text-gray-400"}`}>
                            {role.title}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">{role.description}</p>
                        </div>

                        <div className={`login-role-card__check${isSelected ? " login-role-card__check--on" : ""}`}>
                          <AnimatePresence>
                            {isSelected && (
                              <motion.svg
                                className="w-3 h-3 text-white"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ duration: 0.2, type: "spring", stiffness: 300 }}
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </motion.svg>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              </motion.div>
              ) : null}

              <form onSubmit={handleSubmit} className="space-y-5">
                {registerSuccessUser ? (
                  <motion.div variants={staggerItem} className="login-success space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" aria-hidden />
                      <p className="font-semibold text-emerald-100">
                        Kayıt tamam — {registerSuccessUser.email}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        type="button"
                        className="login-btn-panel"
                        style={loginThemeVars}
                        onClick={() => navigate("/dashboard")}
                      >
                        Panele git
                      </button>
                      <button
                        type="button"
                        className="login-btn-secondary"
                        onClick={() => {
                          setRegisterSuccessUser(null)
                          setPassword("")
                          setAuthError("")
                        }}
                      >
                        Yeni kayıt
                      </button>
                    </div>
                  </motion.div>
                ) : null}

                {authError ? (
                  <motion.div variants={staggerItem} className="alert-error">
                    {authError}
                  </motion.div>
                ) : null}

                {!registerSuccessUser ? (
                <>
                <motion.div className="space-y-2" variants={staggerItem}>
                  <label htmlFor="email" className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    E-posta
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ornek@sirket.com"
                      className="login-input placeholder:text-gray-500 focus:outline-none transition-all duration-300"
                      required
                    />
                  </div>
                </motion.div>

                {authMode === "register" ? (
                  <motion.div className="space-y-2" variants={staggerItem}>
                    <label htmlFor="name" className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ad soyad
                    </label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="login-input placeholder:text-gray-500 focus:outline-none transition-all duration-300"
                        required={authMode === "register"}
                      />
                    </div>
                  </motion.div>
                ) : null}

                <motion.div className="space-y-2" variants={staggerItem}>
                  <label htmlFor="password" className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Şifre
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Şifrenizi girin"
                      className="login-input placeholder:text-gray-500 focus:outline-none transition-all duration-300"
                      required
                    />
                  </div>
                </motion.div>

                <motion.div className="flex justify-end" variants={staggerItem}>
                  <button type="button" className="text-sm text-gray-500 hover:text-cyan-400 transition-colors">
                    Şifremi unuttum
                  </button>
                </motion.div>

                <motion.div variants={staggerItem}>
                  <motion.button
                    ref={buttonRef}
                    type="submit"
                    disabled={authLoading}
                    className="login-submit disabled:opacity-60 disabled:pointer-events-none"
                    style={{ ...loginThemeVars, x: springButtonX, y: springButtonY }}
                    onMouseMove={handleButtonMouseMove}
                    onMouseEnter={() => setIsButtonHovered(true)}
                    onMouseLeave={handleButtonMouseLeave}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    animate={{
                      boxShadow: isButtonHovered
                        ? "0 15px 50px -12px var(--login-glow), 0 0 30px var(--login-glow)"
                        : "0 8px 30px -8px var(--login-glow)",
                    }}
                  >
                    <motion.div
                      className="login-submit__shimmer login-submit__shimmer--1"
                      initial={{ x: "-100%", opacity: 0 }}
                      animate={isButtonHovered ? { x: "100%", opacity: 1 } : { x: "-100%", opacity: 0 }}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                    />
                    <motion.div
                      className="login-submit__shimmer login-submit__shimmer--2"
                      initial={{ x: "-100%" }}
                      animate={isButtonHovered ? { x: "100%" } : { x: "-100%" }}
                      transition={{ duration: 0.6, ease: "easeInOut", delay: 0.1 }}
                    />
                    <span className="relative flex items-center justify-center gap-2 text-base">
                      {authLoading ? "Lütfen bekleyin…" : authMode === "register" ? "Hesap oluştur" : "Giriş yap"}
                      <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                        <ArrowRight className="w-5 h-5" />
                      </motion.span>
                    </span>
                  </motion.button>
                </motion.div>
                </>
                ) : null}

                <motion.p className="text-center text-sm text-gray-500 mt-8" variants={staggerItem}>
                  {authMode === "login" ? (
                    <>
                      Yönetici misiniz?{" "}
                      <button
                        type="button"
                        className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
                        onClick={() => {
                          setAuthMode("register")
                          setSelectedRole("manager")
                          setAuthError("")
                          setRegisterSuccessUser(null)
                        }}
                      >
                        Hesap oluştur
                      </button>
                    </>
                  ) : (
                    <>
                      Zaten hesabınız var mı?{" "}
                      <button
                        type="button"
                        className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                        onClick={() => {
                          setAuthMode("login")
                          setAuthError("")
                          setRegisterSuccessUser(null)
                        }}
                      >
                        Giriş yap
                      </button>
                    </>
                  )}
                </motion.p>
              </form>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
export default LoginPage;
