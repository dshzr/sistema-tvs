<template>
  <aside class="apple-sidebar">
    <div class="sidebar-blur"></div>
    <div class="sidebar-header">
      <div class="app-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
          <line x1="8" y1="21" x2="16" y2="21"></line>
          <line x1="12" y1="17" x2="12" y2="21"></line>
        </svg>
      </div>
      <span class="app-name">Well Builders</span>
    </div>

    <nav class="sidebar-links">
      <button 
        :class="['nav-link', { active: activeSection === 'announcements' }]" 
        @click="$emit('change-section', 'announcements')"
      >
        <span class="icon">📁</span>
        Anúncios
      </button>
      <button 
        :class="['nav-link', { active: activeSection === 'settings' }]" 
        @click="$emit('change-section', 'settings')"
      >
        <span class="icon">⚙️</span>
        Ajustes
      </button>
    </nav>

    <div class="sidebar-bottom">
      <NuxtLink to="/player" target="_blank" class="nav-link player-link">
        <span class="icon">📺</span>
        Ver Player
      </NuxtLink>
      <button class="nav-link logout-btn" @click="$emit('logout')">
        <span class="icon">🚪</span>
        Sair
      </button>
    </div>
  </aside>
</template>

<script setup>
defineProps(['activeSection'])
defineEmits(['change-section', 'logout'])
</script>

<style scoped>
.apple-sidebar {
  width: 260px; height: 100vh; position: fixed; top: 0; left: 0;
  display: flex; flex-direction: column; z-index: 100;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
}

.sidebar-blur {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(28, 28, 30, 0.6);
  backdrop-filter: blur(40px) saturate(200%);
  z-index: -1;
}

.sidebar-header {
  padding: 2.5rem 1.5rem 1.5rem; display: flex; align-items: center; gap: 0.75rem;
}

.app-icon {
  width: 32px; height: 32px; background: #007aff; color: #fff;
  border-radius: 8px; display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 10px rgba(0, 122, 255, 0.3);
}

.app-name { font-weight: 700; color: #fff; font-size: 1.1rem; letter-spacing: -0.02em; }

.sidebar-links { flex: 1; padding: 1rem 0.75rem; display: flex; flex-direction: column; gap: 0.25rem; }

.nav-link {
  display: flex; align-items: center; gap: 0.75rem; padding: 0.65rem 0.85rem;
  border: none; background: transparent; border-radius: 8px; color: rgba(255, 255, 255, 0.7);
  font-size: 0.95rem; font-weight: 500; cursor: pointer; transition: all 0.2s;
  text-decoration: none;
}

.nav-link:hover { background: rgba(255, 255, 255, 0.05); color: #fff; }
.nav-link.active { background: rgba(255, 255, 255, 0.1); color: #fff; }

.sidebar-bottom { padding: 0.75rem; border-top: 1px solid rgba(255, 255, 255, 0.05); }

.logout-btn:hover { color: #ff453a; }
.player-link { margin-bottom: 0.25rem; }

.icon { font-size: 1.1rem; filter: grayscale(1); opacity: 0.7; }
.active .icon { filter: none; opacity: 1; }
</style>
