<template>
  <div :class="['apple-card', { inactive: !announcement.active }]">
    <div class="card-preview">
      <video v-if="announcement.type === 'video'" :src="announcement.mediaPath" muted></video>
      <img v-else :src="announcement.mediaPath" alt="" />
      <div class="card-badge">{{ announcement.type === 'video' ? 'Vídeo' : 'Imagem' }}</div>
    </div>
    <div class="card-body">
      <div class="card-info">
        <h3 class="card-title">{{ announcement.title }}</h3>
        <p class="card-meta">{{ announcement.duration }}s • {{ formatDate(announcement.createdAt) }}</p>
      </div>
      <div class="card-actions">
        <button class="action-btn" title="Editar" @click="$emit('edit', announcement.id)">
          <span>✏️</span>
        </button>
        <button 
          class="action-btn" 
          :title="announcement.active ? 'Desativar' : 'Ativar'"
          @click="$emit('toggle', announcement.id, announcement.active)"
        >
          <span>{{ announcement.active ? '🟢' : '⚪️' }}</span>
        </button>
        <button class="action-btn danger" title="Excluir" @click="$emit('delete', announcement.id)">
          <span>🗑️</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps(['announcement'])
defineEmits(['edit', 'toggle', 'delete'])

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}
</script>

<style scoped>
.apple-card {
  background: var(--bg-secondary); border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 18px; overflow: hidden; transition: all 0.3s;
}
.apple-card:hover { transform: translateY(-4px); border-color: rgba(255, 255, 255, 0.1); box-shadow: var(--shadow-md); }
.apple-card.inactive { opacity: 0.6; grayscale: 0.5; }

.card-preview { height: 160px; position: relative; background: #000; overflow: hidden; }
.card-preview img, .card-preview video { width: 100%; height: 100%; object-fit: cover; }
.card-badge {
  position: absolute; top: 0.75rem; right: 0.75rem; padding: 0.25rem 0.6rem;
  background: rgba(0, 0, 0, 0.6); backdrop-filter: blur(10px); border-radius: 6px;
  font-size: 0.7rem; font-weight: 600; color: #fff; text-transform: uppercase;
}

.card-body { padding: 1.25rem; display: flex; justify-content: space-between; align-items: flex-start; }
.card-title { font-size: 1rem; font-weight: 600; color: #fff; margin-bottom: 0.25rem; }
.card-meta { font-size: 0.75rem; color: rgba(255, 255, 255, 0.4); }

.card-actions { display: flex; gap: 0.5rem; }
.action-btn {
  width: 34px; height: 34px; border: none; background: rgba(255, 255, 255, 0.05);
  border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all 0.2s; font-size: 0.9rem;
}
.action-btn:hover { background: rgba(255, 255, 255, 0.1); transform: scale(1.05); }
.action-btn.danger:hover { background: rgba(255, 69, 58, 0.1); }
</style>
