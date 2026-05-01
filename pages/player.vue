<template>
  <div v-if="announcements.length > 0" :class="['player', `transition-${settings.transition}`]">
    <!-- Grainy Texture -->
    <div class="grain-overlay"></div>

    <div class="slides-container">
      <div 
        v-for="(a, i) in announcements" 
        :key="a.id"
        :class="['slide', { active: currentIndex === i, prev: prevIndex === i }]"
      >
        <video 
          v-if="a.type === 'video'" 
          :src="a.mediaPath" 
          muted 
          playsinline 
          preload="auto"
          ref="videoRefs"
          @ended="nextSlide"
        ></video>
        <img v-else :src="a.mediaPath" :alt="a.title" loading="eager" />
      </div>
    </div>

    <!-- Main Footer -->
    <footer class="player-footer">
      <div class="footer-content">
        <!-- Branding -->
        <div class="footer-brand">
          <div class="brand-dot"></div>
          <span class="brand-text">Well Builders</span>
        </div>

        <!-- Center: Progress Bar & Counter -->
        <div class="footer-center">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
          </div>
          <div class="slide-counter">
            <span class="current">{{ String(currentIndex + 1).padStart(2, '0') }}</span>
            <span class="sep">/</span>
            <span class="total">{{ String(announcements.length).padStart(2, '0') }}</span>
          </div>
        </div>

        <!-- Right: Info (Weather & Clock) -->
        <div class="footer-info">
          <div class="weather-brief">
            <span class="w-temp">{{ weather.temp }}°</span>
            <span class="w-icon">{{ weather.icon }}</span>
          </div>
          <div class="footer-divider"></div>
          <div class="footer-clock">
            <span class="f-hours">{{ time.hours }}</span>
            <span class="f-sep">:</span>
            <span class="f-mins">{{ time.minutes }}</span>
          </div>
        </div>
      </div>
    </footer>
  </div>

  <div v-else class="no-content">
    <div class="grain-overlay"></div>
    <div class="no-content-inner">
      <div class="no-content-icon">📺</div>
      <h1 class="editorial-title">Well Builders</h1>
      <p class="editorial-p">Aguardando conteúdo para exibição.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive } from 'vue'

const announcements = ref([])
const settings = ref({ transition: 'fade', defaultDuration: 10 })
const currentIndex = ref(0)
const prevIndex = ref(-1)
const progress = ref(0)

// Time State
const time = reactive({ hours: '00', minutes: '00' })
const date = reactive({ dayName: '', fullDate: '' })

// Weather State
const weather = reactive({
  temp: 24,
  description: 'Céu Limpo',
  icon: '☀️'
})

let slideTimer = null
let pollTimer = null
let animationFrame = null

const updateClock = () => {
  const now = new Date()
  time.hours = String(now.getHours()).padStart(2, '0')
  time.minutes = String(now.getMinutes()).padStart(2, '0')
  
  const options = { weekday: 'long', day: 'numeric', month: 'long' }
  const formatter = new Intl.DateTimeFormat('pt-BR', options)
  const parts = formatter.formatToParts(now)
  
  date.dayName = parts.find(p => p.type === 'weekday').value
  date.fullDate = `${parts.find(p => p.type === 'day').value} de ${parts.find(p => p.type === 'month').value}`
}

const updateWeather = () => {
  const hour = new Date().getHours()
  if (hour > 18 || hour < 6) {
    weather.icon = '🌙'; weather.description = 'Noite Estrelada'; weather.temp = 19
  } else if (hour > 12 && hour < 16) {
    weather.icon = '☀️'; weather.description = 'Ensolarado'; weather.temp = 28
  } else {
    weather.icon = '🌤️'; weather.description = 'Parcialmente Nublado'; weather.temp = 24
  }
}

const startProgress = (durationSec) => {
  progress.value = 0
  const startTime = Date.now()
  const durationMs = durationSec * 1000
  cancelAnimationFrame(animationFrame)
  const animate = () => {
    const elapsed = Date.now() - startTime
    progress.value = Math.min((elapsed / durationMs) * 100, 100)
    if (progress.value < 100) animationFrame = requestAnimationFrame(animate)
  }
  animationFrame = requestAnimationFrame(animate)
}

const showSlide = (index) => {
  if (announcements.value.length === 0) return
  prevIndex.value = currentIndex.value
  currentIndex.value = index
  setTimeout(() => { prevIndex.value = -1 }, 1000)

  const slide = announcements.value[index]
  const duration = slide.duration || settings.value.defaultDuration
  clearTimeout(slideTimer)

  if (slide.type === 'video') {
    setTimeout(() => {
      const videos = document.querySelectorAll('video')
      const video = Array.from(videos).find(v => v.src.endsWith(slide.mediaPath))
      if (video) {
        video.currentTime = 0
        video.play().catch(() => {})
        const vidDur = video.duration || duration
        startProgress(vidDur)
      } else {
        startProgress(duration); slideTimer = setTimeout(nextSlide, duration * 1000)
      }
    }, 50)
  } else {
    startProgress(duration); slideTimer = setTimeout(nextSlide, duration * 1000)
  }
}

const nextSlide = () => {
  if (announcements.value.length === 0) return
  const next = (currentIndex.value + 1) % announcements.value.length
  showSlide(next)
}

const fetchData = async () => {
  try {
    const [fetchedAnnouncements, fetchedSettings] = await Promise.all([
      $fetch('/api/announcements'),
      $fetch('/api/settings')
    ])
    settings.value = fetchedSettings
    const activeAnns = fetchedAnnouncements.filter(a => a.active)
    const oldIds = announcements.value.map(a => a.id).join(',')
    const newIds = activeAnns.map(a => a.id).join(',')
    if (oldIds !== newIds && activeAnns.length > 0) {
      announcements.value = activeAnns; currentIndex.value = 0; showSlide(0)
    } else if (activeAnns.length === 0) {
      announcements.value = []
    }
  } catch (err) { console.error(err) }
}

onMounted(() => {
  updateClock(); updateWeather()
  setInterval(updateClock, 1000)
  setInterval(updateWeather, 3600000)
  fetchData().then(() => { if (announcements.value.length > 0) showSlide(0) })
  pollTimer = setInterval(fetchData, 15000)
  let cursorTimer
  window.addEventListener('mousemove', () => {
    document.body.style.cursor = 'default'
    clearTimeout(cursorTimer)
    cursorTimer = setTimeout(() => { document.body.style.cursor = 'none' }, 3000)
  })
})

onUnmounted(() => {
  clearTimeout(slideTimer); clearInterval(pollTimer); cancelAnimationFrame(animationFrame)
})
</script>

<style scoped>
.player {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #000;
  cursor: none;
}

.grain-overlay {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  z-index: 50;
  pointer-events: none;
  opacity: 0.05;
  background-image: url('https://grainy-gradients.vercel.app/noise.svg');
}

.slides-container {
  position: relative;
  width: 100%;
  height: calc(100% - 100px); /* Leave space for footer */
  background: #000;
}

.slide {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  opacity: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.slide.active { opacity: 1; z-index: 2; }

.slide img, .slide video {
  width: 100%;
  height: 100%;
  object-fit: contain; /* Maintain aspect ratio */
}

/* Individual Slide Title Overlay */
.slide-info {
  position: absolute;
  top: 3rem;
  left: 3rem;
  z-index: 10;
  max-width: 50%;
}

.slide-title {
  font-family: 'Playfair Display', serif;
  font-size: 3rem;
  color: #fff;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.8);
  margin: 0;
  line-height: 1.1;
}

/* Transitions */
.transition-fade .slide { transition: opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1); }
.transition-slide .slide {
  transition: opacity 1s, transform 1.2s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateX(100%);
}
.transition-slide .slide.active { transform: translateX(0); }
.transition-slide .slide.prev { transform: translateX(-100%); opacity: 0; }

/* Premium Footer */
.player-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100px;
  background: rgba(10, 10, 20, 0.85);
  backdrop-filter: blur(25px) saturate(180%);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  z-index: 100;
  display: flex;
  align-items: center;
  padding: 0 3rem;
}

.footer-content {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.brand-dot {
  width: 12px; height: 12px;
  background: #6366f1;
  border-radius: 50%;
  box-shadow: 0 0 15px rgba(99, 102, 241, 0.8);
}

.brand-text {
  font-family: 'Outfit', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.footer-center {
  flex: 0 1 40%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #06b6d4);
  box-shadow: 0 0 15px rgba(99, 102, 241, 0.5);
}

.slide-counter {
  font-family: 'Outfit', sans-serif;
  font-size: 0.8rem;
  letter-spacing: 0.1em;
}

.slide-counter .current { color: #fff; font-weight: 700; }
.slide-counter .sep { color: rgba(255, 255, 255, 0.2); margin: 0 4px; }
.slide-counter .total { color: rgba(255, 255, 255, 0.4); }

.footer-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.weather-brief {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.w-temp {
  font-family: 'Playfair Display', serif;
  font-size: 1.8rem;
  color: #fff;
}

.w-icon { font-size: 1.2rem; }

.footer-divider {
  width: 1px; height: 30px;
  background: rgba(255, 255, 255, 0.15);
}

.footer-clock {
  font-family: 'Playfair Display', serif;
  font-size: 2.5rem;
  color: #fff;
  line-height: 1;
}

.f-sep {
  opacity: 0.3;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 1; }
}

/* Transitions */
.fade-slide-enter-active { transition: all 0.8s ease-out 0.4s; }
.fade-slide-enter-from { opacity: 0; transform: translateY(20px); }

/* No Content */
.no-content {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #050505;
  text-align: center;
}

.editorial-title {
  font-family: 'Playfair Display', serif;
  font-size: 3.5rem;
  color: #fff;
  margin-bottom: 1rem;
}

.editorial-p {
  font-family: 'Outfit', sans-serif;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  font-size: 0.9rem;
  color: #6366f1;
}
</style>
