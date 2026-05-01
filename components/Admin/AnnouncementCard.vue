<template>
  <div :class="['announcement-card', { inactive: !announcement.active }]">
    <div class="card-media">
      <video v-if="announcement.type === 'video'" :src="announcement.mediaPath" muted preload="metadata"></video>
      <img v-else :src="announcement.mediaPath" :alt="announcement.title" loading="lazy" />
      <span class="card-type-badge">{{ announcement.type === 'video' ? '🎬 Vídeo' : '🖼️ Imagem' }}</span>
      <div class="card-status">
        <button :class="['toggle-switch', { active: announcement.active }]" @click="$emit('toggle', announcement.id, announcement.active)"></button>
      </div>
    </div>
    <div class="card-body">
      <div class="card-title-text">{{ announcement.title }}</div>
      <div class="card-meta">
        <span>⏱️ {{ announcement.duration }}s</span>
        <span>📅 {{ new Date(announcement.createdAt).toLocaleDateString('pt-BR') }}</span>
      </div>
      <div class="card-actions">
        <button class="btn btn-ghost btn-sm" @click="$emit('edit', announcement.id)">Editar</button>
        <button class="btn btn-danger btn-sm" @click="$emit('delete', announcement.id)">Excluir</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps(['announcement'])
defineEmits(['toggle', 'edit', 'delete'])
</script>

<style scoped>
.announcement-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; transition: var(--transition); position: relative; }
.announcement-card:hover { border-color: var(--border-hover); box-shadow: var(--shadow-md); transform: translateY(-4px); }
.announcement-card.inactive { opacity: 0.5; }
.card-media { position: relative; width: 100%; height: 200px; overflow: hidden; background: rgba(0,0,0,0.3); }
.card-media img, .card-media video { width: 100%; height: 100%; object-fit: cover; }
.card-type-badge { position: absolute; top: 0.75rem; left: 0.75rem; padding: 0.3rem 0.6rem; background: rgba(0,0,0,0.6); backdrop-filter: blur(10px); border-radius: 6px; font-size: 0.7rem; color: var(--cyan); }
.card-status { position: absolute; top: 0.75rem; right: 0.75rem; }
.toggle-switch { width: 44px; height: 24px; background: rgba(255,255,255,0.15); border: none; border-radius: 12px; cursor: pointer; transition: var(--transition); position: relative; }
.toggle-switch.active { background: var(--green); }
.toggle-switch::after { content: ''; position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; background: white; border-radius: 50%; transition: var(--transition); }
.toggle-switch.active::after { transform: translateX(20px); }
.card-body { padding: 1.25rem; }
.card-title-text { font-size: 1rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--text-primary); }
.card-meta { display: flex; gap: 1rem; font-size: 0.8rem; color: var(--text-muted); }
.card-actions { display: flex; gap: 0.5rem; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border); }
.btn { padding: 0.5rem 0.75rem; font-size: 0.8rem; flex: 1; border: none; border-radius: var(--radius-sm); cursor: pointer; color: white; }
.btn-ghost { background: transparent; color: var(--text-secondary); border: 1px solid var(--border); }
.btn-danger { background: rgba(239, 68, 68, 0.1); color: var(--red); border: 1px solid rgba(239, 68, 68, 0.2); }
</style>
