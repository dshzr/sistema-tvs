<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h2>{{ announcement ? 'Editar Anúncio' : 'Novo Anúncio' }}</h2>
        <button class="modal-close" @click="$emit('close')">&times;</button>
      </div>
      <form @submit.prevent="save" class="modal-body">
        <div class="form-group">
          <label>Título do anúncio</label>
          <input v-model="form.title" type="text" required />
        </div>
        
        <div class="form-group">
          <label>Duração (segundos)</label>
          <input v-model="form.duration" type="number" min="3" max="120" />
        </div>

        <div class="form-group">
          <label>Mídia (imagem ou vídeo)</label>
          <div class="upload-area" @click="fileInput.click()">
            <div v-if="!preview" class="upload-placeholder">
              <p>Clique para selecionar arquivo</p>
            </div>
            <div v-else class="upload-preview">
              <video v-if="previewType === 'video'" :src="preview" muted autoplay loop></video>
              <img v-else :src="preview" />
              <button type="button" @click.stop="clearFile">Remover</button>
            </div>
            <input type="file" ref="fileInput" @change="onFileChange" hidden accept="image/*,video/*" />
          </div>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn btn-ghost" @click="$emit('close')">Cancelar</button>
          <button type="submit" class="btn btn-primary">Salvar</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps(['announcement'])
const emit = defineEmits(['close', 'save'])

const form = ref({
  title: '',
  duration: 10
})

const file = ref(null)
const preview = ref(null)
const previewType = ref(null)
const fileInput = ref(null)

onMounted(() => {
  if (props.announcement) {
    form.value.title = props.announcement.title
    form.value.duration = props.announcement.duration
    preview.value = props.announcement.mediaPath
    previewType.value = props.announcement.type
  }
})

const onFileChange = (e) => {
  const f = e.target.files[0]
  if (f) {
    file.value = f
    preview.value = URL.createObjectURL(f)
    previewType.value = f.type.startsWith('video/') ? 'video' : 'image'
  }
}

const clearFile = () => {
  file.value = null
  preview.value = null
  previewType.value = null
  if (fileInput.value) fileInput.value.value = ''
}

const save = () => {
  if (!props.announcement && !file.value) {
    alert('Selecione uma imagem ou vídeo')
    return
  }

  const formData = new FormData()
  formData.append('title', form.value.title)
  formData.append('duration', form.value.duration)
  if (file.value) {
    formData.append('media', file.value)
  }

  emit('save', formData)
}
</script>

<style scoped>
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: var(--radius-xl); width: 100%; max-width: 560px; max-height: 90vh; overflow-y: auto; padding: 2rem; }
.modal-header { display: flex; justify-content: space-between; margin-bottom: 1.5rem; }
.modal-close { background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer; }
.form-group { margin-bottom: 1.5rem; }
.form-group label { display: block; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem; }
.form-group input { width: 100%; padding: 0.85rem; background: var(--bg-input); border: 1px solid var(--border); border-radius: var(--radius-md); color: white; }
.upload-area { border: 2px dashed var(--border); border-radius: var(--radius-lg); padding: 2rem; text-align: center; cursor: pointer; }
.upload-preview { position: relative; }
.upload-preview img, .upload-preview video { max-width: 100%; max-height: 200px; }
.upload-preview button { position: absolute; top: 10px; right: 10px; background: red; color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer; }
.modal-actions { display: flex; justify-content: flex-end; gap: 1rem; }
.btn { padding: 0.75rem 1.5rem; border: none; border-radius: var(--radius-md); font-weight: 600; cursor: pointer; color: white; }
.btn-primary { background: linear-gradient(135deg, var(--accent), #8b5cf6); }
.btn-ghost { background: transparent; border: 1px solid var(--border); color: var(--text-secondary); }
</style>
