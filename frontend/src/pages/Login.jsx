"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion"
import { Mail, Lock, User, Shield, ArrowRight, Sparkles, Cpu, Activity } from "lucide-react"

// =============================================================================
// AURORA MESH GRADIENT BACKGROUND (z-index: 0)
// =============================================================================
function AuroraMeshGradient() {
  return (
    <div className="absolute inset-0 overflow-hidden z-0">
      {/* Base deep space gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 120% 120% at 50% 50%, #0a0a1a 0%, #050510 100%)",
        }}
      />

      {/* Aurora blob 1 - Deep indigo */}
      <motion.div
        className="absolute w-[1200px] h-[1200px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, rgba(79, 70, 229, 0.2) 40%, transparent 70%)",
          filter: "blur(80px)",
          left: "-20%",
          top: "-30%",
        }}
        animate={{
          x: [0, 200, 100, 0],
          y: [0, 150, 250, 0],
          scale: [1, 1.3, 0.9, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Aurora blob 2 - Cyan */}
      <motion.div
        className="absolute w-[1000px] h-[1000px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(34, 211, 238, 0.35) 0%, rgba(6, 182, 212, 0.15) 50%, transparent 70%)",
          filter: "blur(100px)",
          right: "-15%",
          bottom: "-20%",
        }}
        animate={{
          x: [0, -150, -80, 0],
          y: [0, -100, -200, 0],
          scale: [1, 0.85, 1.2, 1],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Aurora blob 3 - Purple */}
      <motion.div
        className="absolute w-[800px] h-[800px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, rgba(139, 92, 246, 0.15) 50%, transparent 70%)",
          filter: "blur(90px)",
          left: "30%",
          top: "10%",
        }}
        animate={{
          x: [0, 120, -60, 0],
          y: [0, 80, 150, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Aurora blob 4 - Teal */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(20, 184, 166, 0.25) 0%, rgba(13, 148, 136, 0.1) 50%, transparent 70%)",
          filter: "blur(70px)",
          right: "25%",
          top: "40%",
        }}
        animate={{
          x: [0, -100, 50, 0],
          y: [0, -70, 100, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Liquid flow overlay */}
      <motion.div
        className="absolute inset-0 opacity-30"
        animate={{
          background: [
            "linear-gradient(45deg, rgba(99, 102, 241, 0.2) 0%, transparent 50%, rgba(34, 211, 238, 0.15) 100%)",
            "linear-gradient(135deg, rgba(168, 85, 247, 0.18) 0%, transparent 50%, rgba(20, 184, 166, 0.15) 100%)",
            "linear-gradient(225deg, rgba(79, 70, 229, 0.2) 0%, transparent 50%, rgba(6, 182, 212, 0.18) 100%)",
            "linear-gradient(315deg, rgba(139, 92, 246, 0.18) 0%, transparent 50%, rgba(13, 148, 136, 0.15) 100%)",
            "linear-gradient(45deg, rgba(99, 102, 241, 0.2) 0%, transparent 50%, rgba(34, 211, 238, 0.15) 100%)",
          ],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  )
}

// =============================================================================
// INTERACTIVE NEURAL NETWORK (z-index: 0)
// =============================================================================
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

      // Draw connections
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

      // Update and draw particles
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
      className="absolute inset-0 pointer-events-none z-0"
      style={{ opacity: 0.5 }}
    />
  )
}

// =============================================================================
// FLOATING 3D GEOMETRIC SHAPES (z-index: 0)
// =============================================================================
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
      {/* Torus 1 */}
      <motion.div className="absolute" style={{ x: x1, y: y1, left: "10%", top: "20%" }}>
        <motion.div
          className="w-64 h-64 rounded-full border-[20px] opacity-[0.06]"
          style={{
            borderColor: "#22d3ee",
            boxShadow: "0 0 60px rgba(34, 211, 238, 0.25), inset 0 0 40px rgba(34, 211, 238, 0.15)",
          }}
          animate={{ rotateX: [0, 360], rotateY: [0, 180] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>

      {/* Sphere 2 */}
      <motion.div className="absolute" style={{ x: x2, y: y2, right: "15%", top: "30%" }}>
        <motion.div
          className="w-32 h-32 rounded-full opacity-[0.1]"
          style={{
            background: "radial-gradient(circle at 30% 30%, #a855f7, #7c3aed)",
            boxShadow: "0 0 80px rgba(168, 85, 247, 0.35), inset 0 0 40px rgba(196, 181, 253, 0.25)",
          }}
          animate={{ scale: [1, 1.1, 1], rotateZ: [0, 360] }}
          transition={{
            scale: { duration: 8, repeat: Infinity, ease: "easeInOut" },
            rotateZ: { duration: 30, repeat: Infinity, ease: "linear" },
          }}
        />
      </motion.div>

      {/* Ring 3 */}
      <motion.div className="absolute" style={{ x: x3, y: y3, left: "60%", bottom: "25%" }}>
        <motion.div
          className="w-48 h-48 rounded-full border-[12px] opacity-[0.05]"
          style={{
            borderColor: "#14b8a6",
            borderTopColor: "transparent",
            borderBottomColor: "transparent",
            boxShadow: "0 0 50px rgba(20, 184, 166, 0.25)",
          }}
          animate={{ rotateX: [60, 60], rotateZ: [0, 360] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>

      {/* Crystal 4 */}
      <motion.div className="absolute" style={{ x: x4, y: y4, left: "25%", bottom: "20%" }}>
        <motion.div
          className="w-20 h-20 opacity-[0.08]"
          style={{
            background: "linear-gradient(135deg, #38bdf8 0%, #8b5cf6 100%)",
            clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
            boxShadow: "0 0 40px rgba(139, 92, 246, 0.3)",
          }}
          animate={{ rotateY: [0, 360], rotateZ: [0, 180, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>
    </div>
  )
}

// =============================================================================
// STAGGERED ANIMATION VARIANTS
// =============================================================================
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.3 } },
}

const staggerItem = {
  hidden: { opacity: 0, y: 25, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 200, damping: 20 } },
}

// =============================================================================
// MAIN LOGIN PAGE COMPONENT
// =============================================================================
export function LoginPage() {
  const [selectedRole, setSelectedRole] = useState("employee")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
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

  const handleSubmit = (e) => {
    e.preventDefault()
  }

  const roleConfig = {
    employee: { gradient: "linear-gradient(135deg, #0ea5e9, #0284c7)", glow: "rgba(14, 165, 233, 0.35)", accent: "#0ea5e9", hue: 200 },
    hr: { gradient: "linear-gradient(135deg, #a855f7, #9333ea)", glow: "rgba(168, 85, 247, 0.35)", accent: "#a855f7", hue: 280 },
  }
  const currentConfig = roleConfig[selectedRole]

  return (
    <div ref={containerRef} className="min-h-screen w-full flex relative overflow-hidden" style={{ background: "#06060f" }}>
      {/* Background Layers (z-index: 0) */}
      <AuroraMeshGradient />
      <InteractiveNeuralNetwork mouseX={mouseX} mouseY={mouseY} />
      <FloatingGeometrics mouseX={mouseX} mouseY={mouseY} />

      {/* LEFT PANE - HERO (z-index: 10) */}
      <div className="hidden lg:flex flex-1 flex-col justify-center px-16 xl:px-24 relative z-10">
        <motion.div className="max-w-xl" initial="hidden" animate="visible" variants={staggerContainer}>
          {/* Logo */}
          <motion.div className="flex items-center gap-3 mb-14" variants={staggerItem}>
            <motion.div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #0ea5e9, #6366f1)" }}
              whileHover={{ scale: 1.05, rotate: 5 }}
              animate={{ boxShadow: ["0 0 30px rgba(14, 165, 233, 0.25)", "0 0 45px rgba(14, 165, 233, 0.45)", "0 0 30px rgba(14, 165, 233, 0.25)"] }}
              transition={{ boxShadow: { duration: 3, repeat: Infinity, ease: "easeInOut" } }}
            >
              <Sparkles className="w-7 h-7 text-white" />
            </motion.div>
            <span className="text-2xl font-bold text-white">PeopleOS</span>
          </motion.div>

          {/* Headline with letter animation */}
          <motion.h1 className="text-5xl xl:text-6xl font-bold leading-tight mb-6" variants={staggerItem}>
            <span className="relative inline-block">
              <span className="absolute inset-0 blur-2xl opacity-40" style={{ background: "linear-gradient(90deg, #22d3ee, #6366f1)" }} />
              <motion.span
                className="relative bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(90deg, #67e8f9, #e0f2fe, #a5b4fc)" }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                Manage Talent,
              </motion.span>
            </span>
            <br />
            <motion.span
              className="text-white inline-block"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Empower Growth
            </motion.span>
          </motion.h1>

          <motion.p className="text-lg text-gray-400 mb-10 max-w-md leading-relaxed" variants={staggerItem}>
            Transform your workforce management with intelligent automation and real-time analytics.
          </motion.p>

          {/* AI Badge with pulse and scanning line */}
          <motion.div variants={staggerItem}>
            <motion.div
              className="relative inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border overflow-hidden"
              style={{ background: "linear-gradient(135deg, rgba(15, 15, 30, 0.9), rgba(10, 10, 25, 0.8))", borderColor: "rgba(34, 211, 238, 0.3)", backdropFilter: "blur(10px)" }}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
                boxShadow: ["0 0 20px rgba(34, 211, 238, 0.15), 0 0 40px rgba(34, 211, 238, 0.08)", "0 0 30px rgba(34, 211, 238, 0.3), 0 0 60px rgba(34, 211, 238, 0.15)", "0 0 20px rgba(34, 211, 238, 0.15), 0 0 40px rgba(34, 211, 238, 0.08)"],
              }}
              transition={{ opacity: { duration: 0.6, delay: 1 }, scale: { duration: 0.6, delay: 1, type: "spring" }, boxShadow: { duration: 2.5, repeat: Infinity } }}
            >
              {/* Scanning line */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ x: "-100%" }}
                animate={{ x: "200%" }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
              >
                <div className="h-full w-1/3" style={{ background: "linear-gradient(90deg, transparent, rgba(34, 211, 238, 0.25), transparent)" }} />
              </motion.div>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }}>
                <Cpu className="w-4 h-4 text-cyan-400" />
              </motion.div>
              <motion.span
                className="text-sm font-semibold bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(90deg, #67e8f9, #e0f2fe, #a5f3fc)" }}
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                AI-Powered
              </motion.span>
              <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.2, repeat: Infinity }}>
                <Activity className="w-3.5 h-3.5 text-teal-400" />
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div className="flex gap-14 mt-16" variants={staggerItem}>
            {[{ value: "10K+", label: "Companies" }, { value: "2M+", label: "Employees" }, { value: "99.9%", label: "Uptime" }].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 + idx * 0.15, duration: 0.5, type: "spring" }}
              >
                <motion.div
                  className="text-4xl font-bold text-white"
                  animate={{ textShadow: ["0 0 10px rgba(14, 165, 233, 0.15)", "0 0 20px rgba(14, 165, 233, 0.35)", "0 0 10px rgba(14, 165, 233, 0.15)"] }}
                  transition={{ duration: 3, repeat: Infinity, delay: idx * 0.3 }}
                >
                  {stat.value}
                </motion.div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* RIGHT PANE - LOGIN CARD (z-index: 10) */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative z-10">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 100 }}
        >
          {/* Glassmorphism Card */}
          <motion.div
            className="rounded-3xl p-8 relative overflow-hidden"
            style={{
              background: "rgba(10, 10, 25, 0.6)",
              backdropFilter: "blur(40px)",
              WebkitBackdropFilter: "blur(40px)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
            }}
            animate={{
              boxShadow: `0 0 0 1px rgba(255, 255, 255, 0.06), 0 30px 80px -20px rgba(0, 0, 0, 0.65), 0 0 120px -30px ${currentConfig.glow}`,
            }}
            transition={{ duration: 0.5 }}
          >
            {/* Inner glow */}
            <div className="absolute inset-0 opacity-40 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(255, 255, 255, 0.06), transparent 60%)" }} />

            {/* Mobile logo */}
            <div className="lg:hidden text-center mb-8">
              <motion.div
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
                style={{ background: "linear-gradient(135deg, #0ea5e9, #6366f1)" }}
                animate={{ boxShadow: ["0 0 25px rgba(14, 165, 233, 0.25)", "0 0 40px rgba(14, 165, 233, 0.45)", "0 0 25px rgba(14, 165, 233, 0.25)"] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Sparkles className="w-8 h-8 text-white" />
              </motion.div>
              <h1 className="text-2xl font-bold text-white tracking-tight">PeopleOS</h1>
            </div>

            {/* Staggered Content */}
            <motion.div variants={staggerContainer} initial="hidden" animate="visible">
              <motion.div className="relative mb-8" variants={staggerItem}>
                <h2 className="text-2xl font-semibold text-white">Welcome back</h2>
                <p className="text-gray-400 text-sm mt-1.5">Sign in to continue to your dashboard</p>
              </motion.div>

              {/* Role Selection */}
              <motion.div className="mb-7" variants={staggerItem}>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 block">Select Your Role</label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: "employee", title: "Employee", description: "Access your dashboard", Icon: User },
                    { id: "hr", title: "HR Manager", description: "Manage your team", Icon: Shield },
                  ].map((role) => {
                    const isSelected = selectedRole === role.id
                    const isHovered = hoveredRole === role.id
                    const config = roleConfig[role.id]

                    return (
                      <motion.button
                        key={role.id}
                        type="button"
                        onClick={() => setSelectedRole(role.id)}
                        onMouseEnter={() => setHoveredRole(role.id)}
                        onMouseLeave={() => setHoveredRole(null)}
                        className="relative p-5 rounded-2xl text-left overflow-hidden"
                        style={{
                          background: isSelected
                            ? `linear-gradient(135deg, rgba(${role.id === "employee" ? "14, 165, 233" : "168, 85, 247"}, 0.15), rgba(${role.id === "employee" ? "14, 165, 233" : "168, 85, 247"}, 0.08))`
                            : "rgba(15, 15, 35, 0.5)",
                        }}
                        animate={{
                          scale: isHovered ? 1.03 : 1,
                          boxShadow:
                            isSelected || isHovered
                              ? `0 0 30px ${config.glow}, 0 0 50px ${config.glow.replace("0.35", "0.15")}, inset 0 1px 0 rgba(255,255,255,0.08)`
                              : "0 0 0px transparent, inset 0 1px 0 rgba(255,255,255,0.04)",
                        }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      >
                        {/* Neon border */}
                        <motion.div
                          className="absolute inset-0 rounded-2xl pointer-events-none"
                          animate={{
                            boxShadow: isSelected
                              ? `inset 0 0 0 2px ${config.accent}`
                              : isHovered
                              ? `inset 0 0 0 1px rgba(${role.id === "employee" ? "14, 165, 233" : "168, 85, 247"}, 0.5)`
                              : "inset 0 0 0 1px rgba(100, 100, 120, 0.25)",
                          }}
                          transition={{ duration: 0.3 }}
                        />

                        {/* Glow pulse when selected */}
                        <AnimatePresence>
                          {isSelected && (
                            <motion.div
                              className="absolute inset-0 rounded-2xl pointer-events-none"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: [0.2, 0.35, 0.2] }}
                              exit={{ opacity: 0 }}
                              transition={{ opacity: { duration: 2, repeat: Infinity } }}
                              style={{ background: `radial-gradient(ellipse at center, ${config.glow}, transparent 70%)` }}
                            />
                          )}
                        </AnimatePresence>

                        <div className="relative">
                          <motion.div
                            className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                            animate={{
                              background: isSelected ? config.gradient : "rgba(30, 30, 50, 0.8)",
                              boxShadow: isSelected ? `0 4px 20px ${config.glow}` : "none",
                            }}
                            transition={{ duration: 0.3 }}
                          >
                            <role.Icon className={`w-5 h-5 transition-colors duration-300 ${isSelected ? "text-white" : "text-gray-400"}`} />
                          </motion.div>
                          <motion.h3 className="font-semibold text-sm" animate={{ color: isSelected ? "#fff" : "#a1a1aa" }} transition={{ duration: 0.3 }}>
                            {role.title}
                          </motion.h3>
                          <p className="text-xs text-gray-500 mt-1">{role.description}</p>
                        </div>

                        {/* Selection indicator */}
                        <motion.div
                          className="absolute top-4 right-4 w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ border: `2px solid ${isSelected ? config.accent : "rgba(100, 100, 120, 0.4)"}` }}
                          animate={{
                            background: isSelected ? config.accent : "transparent",
                            boxShadow: isSelected ? `0 0 15px ${config.glow}` : "none",
                          }}
                          transition={{ duration: 0.3 }}
                        >
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
                        </motion.div>
                      </motion.button>
                    )
                  })}
                </div>
              </motion.div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Field */}
                <motion.div className="space-y-2" variants={staggerItem}>
                  <label htmlFor="email" className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email Address
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
                      placeholder="you@company.com"
                      className="w-full h-[52px] pl-11 pr-4 rounded-xl text-white placeholder:text-gray-500 focus:outline-none transition-all duration-300"
                      style={{
                        background: "rgba(15, 15, 35, 0.7)",
                        border: "1px solid rgba(80, 80, 100, 0.4)",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "rgba(14, 165, 233, 0.5)")}
                      onBlur={(e) => (e.target.style.borderColor = "rgba(80, 80, 100, 0.4)")}
                      required
                    />
                  </div>
                </motion.div>

                {/* Password Field */}
                <motion.div className="space-y-2" variants={staggerItem}>
                  <label htmlFor="password" className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Password
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
                      placeholder="Enter your password"
                      className="w-full h-[52px] pl-11 pr-4 rounded-xl text-white placeholder:text-gray-500 focus:outline-none transition-all duration-300"
                      style={{
                        background: "rgba(15, 15, 35, 0.7)",
                        border: "1px solid rgba(80, 80, 100, 0.4)",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = "rgba(14, 165, 233, 0.5)")}
                      onBlur={(e) => (e.target.style.borderColor = "rgba(80, 80, 100, 0.4)")}
                      required
                    />
                  </div>
                </motion.div>

                {/* Forgot Password */}
                <motion.div className="flex justify-end" variants={staggerItem}>
                  <button type="button" className="text-sm text-gray-500 hover:text-cyan-400 transition-colors">
                    Forgot password?
                  </button>
                </motion.div>

                {/* Magnetic Sign In Button */}
                <motion.div variants={staggerItem}>
                  <motion.button
                    ref={buttonRef}
                    type="submit"
                    className="relative w-full h-14 rounded-xl font-semibold text-white overflow-hidden"
                    style={{ x: springButtonX, y: springButtonY, background: currentConfig.gradient }}
                    onMouseMove={handleButtonMouseMove}
                    onMouseEnter={() => setIsButtonHovered(true)}
                    onMouseLeave={handleButtonMouseLeave}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    animate={{
                      boxShadow: isButtonHovered
                        ? `0 15px 50px -12px ${currentConfig.glow}, 0 0 30px ${currentConfig.glow}`
                        : `0 8px 30px -8px ${currentConfig.glow}`,
                    }}
                  >
                    {/* Shimmer effects */}
                    <motion.div
                      className="absolute inset-0"
                      style={{ background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%)" }}
                      initial={{ x: "-100%", opacity: 0 }}
                      animate={isButtonHovered ? { x: "100%", opacity: 1 } : { x: "-100%", opacity: 0 }}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                    />
                    <motion.div
                      className="absolute inset-0"
                      style={{ background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)" }}
                      initial={{ x: "-100%" }}
                      animate={isButtonHovered ? { x: "100%" } : { x: "-100%" }}
                      transition={{ duration: 0.6, ease: "easeInOut", delay: 0.1 }}
                    />
                    <span className="relative flex items-center justify-center gap-2 text-base">
                      Sign In
                      <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                        <ArrowRight className="w-5 h-5" />
                      </motion.span>
                    </span>
                  </motion.button>
                </motion.div>

                {/* Divider */}
                <motion.div className="flex items-center gap-4 my-6" variants={staggerItem}>
                  <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(100, 100, 120, 0.4), transparent)" }} />
                  <span className="text-xs text-gray-500 uppercase tracking-wider">Or continue with</span>
                  <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(100, 100, 120, 0.4), transparent)" }} />
                </motion.div>

                {/* Social Login */}
                <motion.div className="grid grid-cols-2 gap-4" variants={staggerItem}>
                  {[
                    {
                      id: "google",
                      label: "Google",
                      icon: (
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                      ),
                    },
                    {
                      id: "apple",
                      label: "Apple",
                      icon: (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.88-3.63-.88-1.698 0-2.302.91-3.67.91-1.377 0-2.332-1.26-3.428-2.8-1.287-1.82-2.323-4.63-2.323-7.28 0-4.28 2.797-6.55 5.552-6.55 1.448 0 2.675.95 3.6.95.865 0 2.222-1.01 3.902-1.01.613 0 2.886.06 4.374 2.19-.13.09-2.383 1.37-2.383 4.19 0 3.26 2.854 4.42 2.955 4.45z" />
                        </svg>
                      ),
                    },
                  ].map((social) => (
                    <motion.button
                      key={social.id}
                      type="button"
                      className="h-12 rounded-xl text-gray-300 font-medium flex items-center justify-center gap-2 relative overflow-hidden"
                      style={{ background: "rgba(15, 15, 35, 0.7)", border: "1px solid rgba(80, 80, 100, 0.3)" }}
                      whileHover={{
                        scale: 1.02,
                        boxShadow: "0 0 20px rgba(100, 100, 160, 0.15), inset 0 1px 0 rgba(255,255,255,0.08)",
                      }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {social.icon}
                      {social.label}
                    </motion.button>
                  ))}
                </motion.div>

                {/* Sign Up */}
                <motion.p className="text-center text-sm text-gray-500 mt-8" variants={staggerItem}>
                  {"Don't have an account? "}
                  <button type="button" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                    Sign up
                  </button>
                </motion.p>
              </form>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
