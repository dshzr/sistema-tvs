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

    <!-- Overlay -->
    <div class="player-overlay">
      <div class="player-clock">{{ time }}</div>
      <div class="player-dots">
        <div 
          v-for="(_, i) in announcements" 
          :key="i"
          :class="['dot', { active: currentIndex === i }]"
        ></div>
      </div>
    </div>

    <!-- Progress -->
    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
    </div>
  </div>

  <div v-else class="no-content">
    <div class="no-content-inner">
      <div class="no-content-icon">📺</div>
      <h1>Sistema de Anúncios</h1>
      <p>Nenhum anúncio ativo no momento.</p>
      <p class="no-content-hint">Acesse o painel admin para adicionar conteúdo.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const announcements = ref([])
const settings = ref({ transition: 'fade', defaultDuration: 10 })
const currentIndex = ref(0)
const prevIndex = ref(-1)
const time = ref('')
const progress = ref(0)
const videoRefs = ref([])

let slideTimer = null
let pollTimer = null
let animationFrame = null

const updateClock = () => {
  const now = new Date()
  time.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

const startProgress = (durationSec) => {
  progress.value = 0
  const startTime = Date.now()
  const durationMs = durationSec * 1000

  cancelAnimationFrame(animationFrame)

  const animate = () => {
    const elapsed = Date.now() - startTime
    progress.value = Math.min((elapsed / durationMs) * 100, 100)
    if (progress.value < 100) {
      animationFrame = requestAnimationFrame(animate)
    }
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
    // Find the video element
    setTimeout(() => {
      const videos = document.querySelectorAll('video')
      const video = Array.from(videos).find(v => v.src.endsWith(slide.mediaPath))
      if (video) {
        video.currentTime = 0
        video.play().catch(() => {})
        // Use video duration if available, fallback to settings
        const vidDur = video.duration || duration
        startProgress(vidDur)
      } else {
        startProgress(duration)
        slideTimer = setTimeout(nextSlide, duration * 1000)
      }
    }, 50)
  } else {
    startProgress(duration)
    slideTimer = setTimeout(nextSlide, duration * 1000)
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
    
    // Check if changed
    const oldIds = announcements.value.map(a => a.id).join(',')
    const newIds = activeAnns.map(a => a.id).join(',')
    
    if (oldIds !== newIds && activeAnns.length > 0) {
      announcements.value = activeAnns
      currentIndex.value = 0
      showSlide(0)
    } else if (activeAnns.length === 0) {
      announcements.value = []
    }
  } catch (err) {
    console.error(err)
  }
}

onMounted(() => {
  updateClock()
  setInterval(updateClock, 1000)
  
  fetchData().then(() => {
    if (announcements.value.length > 0) showSlide(0)
  })
  
  pollTimer = setInterval(fetchData, 15000)
  
  // Hide cursor logic
  let cursorTimer
  window.addEventListener('mousemove', () => {
    document.body.style.cursor = 'default'
    clearTimeout(cursorTimer)
    cursorTimer = setTimeout(() => { document.body.style.cursor = 'none' }, 3000)
  })
})

onUnmounted(() => {
  clearTimeout(slideTimer)
  clearInterval(pollTimer)
  cancelAnimationFrame(animationFrame)
})
</script>

<style scoped>
html, body {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #000;
  cursor: none;
}

.player {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #000;
}

.slides-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: none;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
}

.slide.active { opacity: 1; z-index: 2; }

/* Transitions */
.transition-fade .slide { transition: opacity 1s ease-in-out; }
.transition-slide .slide {
  transition: opacity 0.8s ease-in-out, transform 0.8s ease-in-out;
  transform: translateX(100%);
}
.transition-slide .slide.active { transform: translateX(0); }
.transition-slide .slide.prev { transform: translateX(-100%); opacity: 0; }

.transition-zoom .slide {
  transition: opacity 1s ease-in-out, transform 1s ease-in-out;
  transform: scale(0.8);
}
.transition-zoom .slide.active { transform: scale(1); }

.slide img, .slide video {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* Overlay */
.player-overlay {
  position: absolute;
  bottom: 2rem;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 0 2.5rem;
  z-index: 10;
}

.player-clock {
  font-size: 1.4rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(12px);
  padding: 0.5rem 1.2rem;
  border-radius: 12px;
}

.player-dots {
  display: flex;
  gap: 0.5rem;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  transition: all 0.4s ease;
}

.dot.active {
  background: rgba(255, 255, 255, 0.9);
  width: 24px;
  border-radius: 4px;
}

.progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: rgba(255, 255, 255, 0.08);
  z-index: 10;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #06b6d4);
  width: 0%;
  box-shadow: 0 0 12px rgba(99, 102, 241, 0.5);
}

.no-content {
  position: fixed;
  top: 0; left: 0; width: 100vw; height: 100vh;
  display: flex; align-items: center; justify-content: center;
  background: #0a0a1a;
  text-align: center;
}
.no-content-icon { font-size: 5rem; margin-bottom: 2rem; }
.no-content h1 { font-size: 2.5rem; color: #fff; }
</style>
