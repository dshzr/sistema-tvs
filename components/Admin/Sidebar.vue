<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="sidebar-logo">📺</div>
      <span class="sidebar-title">Well Builders</span>
    </div>
    <nav class="sidebar-nav">
      <button :class="['nav-item', { active: activeSection === 'announcements' }]" @click="$emit('change-section', 'announcements')">
        Anúncios
      </button>
      <button :class="['nav-item', { active: activeSection === 'settings' }]" @click="$emit('change-section', 'settings')">
        Configurações
      </button>
    </nav>
    <div class="sidebar-footer">
      <NuxtLink to="/player" target="_blank" class="nav-item">Abrir Player</NuxtLink>
      <button class="nav-item nav-danger" @click="$emit('logout')">Sair</button>
    </div>
  </aside>
</template>

<script setup>
defineProps(['activeSection'])
defineEmits(['change-section', 'logout'])
</script>

<style scoped>
.sidebar {
  width: 260px; background: var(--bg-sidebar); border-right: 1px solid var(--border);
  display: flex; flex-direction: column; position: fixed; top: 0; left: 0; height: 100vh; z-index: 100;
}
.sidebar-header { display: flex; align-items: center; gap: 0.75rem; padding: 1.5rem; border-bottom: 1px solid var(--border); }
.sidebar-logo { font-size: 1.5rem; }
.sidebar-title { font-size: 1.2rem; font-weight: 700; color: #818cf8; }
.sidebar-nav { flex: 1; padding: 1rem 0.75rem; display: flex; flex-direction: column; gap: 0.25rem; }
.nav-item {
  padding: 0.75rem 1rem; border: none; border-radius: var(--radius-md); background: transparent;
  color: var(--text-secondary); text-align: left; cursor: pointer; transition: var(--transition); text-decoration: none;
}
.nav-item:hover { background: var(--bg-card-hover); color: var(--text-primary); }
.nav-item.active { background: rgba(99, 102, 241, 0.12); color: var(--accent-hover); }
.nav-danger:hover { background: rgba(239, 68, 68, 0.1); color: var(--red); }
.sidebar-footer { padding: 0.75rem; border-top: 1px solid var(--border); display: flex; flex-direction: column; gap: 0.25rem; }
</style>
