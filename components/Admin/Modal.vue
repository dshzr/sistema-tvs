<template>
  <div class="apple-modal-overlay" @click.self="$emit('close')">
    <div class="apple-modal">
      <div class="modal-header">
        <h2 class="modal-title">{{ announcement ? 'Editar Anúncio' : 'Novo Anúncio' }}</h2>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <form @submit.prevent="submit" class="modal-form">
        <div class="form-group">
          <label>Título do Anúncio</label>
          <input v-model="form.title" type="text" placeholder="Ex: Promoção de Verão" required />
        </div>

        <div class="form-group">
          <label>Mídia (Imagem ou Vídeo)</label>
          <div class="file-input-wrapper">
            <input type="file" @change="handleFile" accept="image/*,video/*" :required="!announcement" />
            <div class="file-custom-btn">Selecionar Arquivo</div>
            <span v-if="fileName" class="file-name">{{ fileName }}</span>
          </div>
        </div>

        <div class="form-group">
          <label>Duração (segundos)</label>
          <input v-model="form.duration" type="number" min="3" max="300" />
        </div>

        <div class="modal-footer">
          <button type="button" class="apple-btn apple-btn-secondary" @click="$emit('close')">Cancelar</button>
          <button type="submit" class="apple-btn apple-btn-primary" :disabled="loading">
            {{ loading ? 'Salvando...' : 'Salvar Anúncio' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps(['announcement'])
const emit = defineEmits(['close', 'save'])

const form = ref({ title: '', duration: 10 })
const file = ref(null)
const fileName = ref('')
const loading = ref(false)

onMounted(() => {
  if (props.announcement) {
    form.value.title = props.announcement.title
    form.value.duration = props.announcement.duration
  }
})

const handleFile = (e) => {
  const f = e.target.files[0]
  if (f) {
    file.value = f
    fileName.value = f.name
  }
}

const submit = async () => {
  loading.value = true
  const formData = new FormData()
  formData.append('title', form.value.title)
  formData.append('duration', form.value.duration)
  if (file.value) formData.append('media', file.value)
  
  emit('save', formData)
}
</script>

<style scoped>
.apple-modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(5px);
  display: flex; align-items: center; justify-content: center; z-index: 1000;
}

.apple-modal {
  background: #1c1c1e; width: 100%; max-width: 480px;
  border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5);
  animation: modalScale 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-header {
  padding: 1.5rem; display: flex; justify-content: space-between; align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}
.modal-title { font-size: 1.2rem; font-weight: 700; color: #fff; }
.close-btn { background: transparent; border: none; color: rgba(255, 255, 255, 0.3); font-size: 1.2rem; cursor: pointer; }

.modal-form { padding: 1.5rem; }
.form-group { margin-bottom: 1.25rem; }
.form-group label { display: block; font-size: 0.85rem; color: rgba(255, 255, 255, 0.5); margin-bottom: 0.5rem; }
.form-group input {
  width: 100%; padding: 0.75rem; background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 10px; color: #fff; outline: none;
}
.form-group input:focus { border-color: #007aff; }

.file-input-wrapper { position: relative; }
.file-input-wrapper input { position: absolute; opacity: 0; width: 100%; height: 100%; cursor: pointer; }
.file-custom-btn {
  padding: 0.75rem; background: rgba(255, 255, 255, 0.05); border: 1px dashed rgba(255, 255, 255, 0.2);
  border-radius: 10px; text-align: center; color: rgba(255, 255, 255, 0.6); font-size: 0.9rem;
}
.file-name { display: block; margin-top: 0.5rem; font-size: 0.8rem; color: #007aff; }

.modal-footer { margin-top: 2rem; display: flex; justify-content: flex-end; gap: 0.75rem; }
.apple-btn { padding: 0.6rem 1.2rem; border-radius: 10px; font-weight: 600; border: none; cursor: pointer; }
.apple-btn-secondary { background: rgba(255, 255, 255, 0.1); color: #fff; }
.apple-btn-primary { background: #007aff; color: #fff; }

@keyframes modalScale { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
</style>
