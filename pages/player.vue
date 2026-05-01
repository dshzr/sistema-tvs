<template>
  <div v-if="announcements.length > 0" :class="['player', `transition-${settings.transition}`]">
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

    <!-- Apple Style Footer -->
    <footer class="player-footer">
      <div class="footer-blur-bg"></div>
      <div class="footer-content">
        <!-- Branding -->
        <div class="footer-brand">
          <div class="brand-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <span class="brand-text">Well Builders</span>
        </div>

        <!-- Center: Status & Progress -->
        <div class="footer-center">
          <div class="progress-wrapper">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
            </div>
          </div>
        </div>

        <!-- Right: Time & Weather -->
        <div class="footer-widgets">
          <div class="widget weather">
            <span class="w-icon">{{ weather.icon }}</span>
            <span class="w-temp">{{ weather.temp }}°</span>
          </div>
          <div class="widget-divider"></div>
          <div class="widget clock">
            <span class="c-time">{{ time.hours }}<span class="c-sep">:</span>{{ time.minutes }}</span>
          </div>
        </div>
      </div>
    </footer>
  </div>

  <div v-else class="no-content">
    <div class="no-content-card">
      <div class="no-content-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect>
          <polyline points="17 2 12 7 7 2"></polyline>
        </svg>
      </div>
      <h1 class="apple-title">Well Builders</h1>
      <p class="apple-p">Aguardando conteúdo para transmissão.</p>
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
}

const updateWeather = () => {
  const hour = new Date().getHours()
  if (hour > 18 || hour < 6) {
    weather.icon = '🌙'; weather.temp = 19
  } else if (hour > 12 && hour < 16) {
    weather.icon = '☀️'; weather.temp = 28
  } else {
    weather.icon = '🌤️'; weather.temp = 24
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
    if (activeAnns.length !== announcements.value.length) {
      announcements.value = activeAnns; currentIndex.value = 0; showSlide(0)
    }
  } catch (err) { console.error(err) }
}

onMounted(() => {
  updateClock(); updateWeather()
  setInterval(updateClock, 1000)
  fetchData().then(() => { if (announcements.value.length > 0) showSlide(0) })
  pollTimer = setInterval(fetchData, 15000)
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
  font-family: 'Outfit', sans-serif;
}

.slides-container {
  position: relative;
  width: 100%;
  height: calc(100% - 90px);
}

.slide {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  opacity: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.slide.active { opacity: 1; z-index: 2; }

.slide img, .slide video {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* Apple Transitions */
.transition-fade .slide { transition: opacity 1s cubic-bezier(0.4, 0, 0.2, 1); }
.transition-slide .slide {
  transition: transform 1.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.8s ease;
  transform: translateX(100%);
}
.transition-slide .slide.active { transform: translateX(0); }

/* Apple Style Footer */
.player-footer {
  position: absolute;
  bottom: 1.5rem;
  left: 1.5rem;
  right: 1.5rem;
  height: 80px;
  border-radius: 24px;
  overflow: hidden;
  z-index: 100;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

.footer-blur-bg {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(28, 28, 30, 0.7);
  backdrop-filter: blur(30px) saturate(180%);
  z-index: -1;
}

.footer-content {
  height: 100%;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.brand-text {
  font-weight: 600;
  font-size: 1.1rem;
  letter-spacing: -0.02em;
  color: #fff;
}

.footer-center {
  flex: 0 1 450px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-dot {
  width: 6px; height: 6px;
  background: #34c759;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(52, 199, 89, 0.5);
}

.status-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 100px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #fff;
  transition: width 0.1s linear;
}

.slide-info {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.5);
  font-variant-numeric: tabular-nums;
}

.slide-info .current { color: #fff; font-weight: 600; margin-right: 4px; }

.footer-widgets {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.widget { display: flex; align-items: center; gap: 0.6rem; }

.w-temp { font-size: 1.4rem; font-weight: 500; color: #fff; }
.w-icon { font-size: 1.2rem; }

.widget-divider {
  width: 1px; height: 24px;
  background: rgba(255, 255, 255, 0.1);
}

.c-time {
  font-size: 1.8rem;
  font-weight: 600;
  color: #fff;
  letter-spacing: -0.02em;
}

.c-sep {
  opacity: 0.4;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 1; }
}

/* No Content Apple Card */
.no-content {
  height: 100vh;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.no-content-card {
  background: #1c1c1e;
  padding: 4rem;
  border-radius: 40px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 40px 80px rgba(0, 0, 0, 0.5);
}

.no-content-icon { color: #007aff; margin-bottom: 2rem; }
.apple-title { font-size: 2.5rem; font-weight: 700; margin-bottom: 0.5rem; }
.apple-p { color: rgba(255, 255, 255, 0.5); font-size: 1.1rem; }
</style>
