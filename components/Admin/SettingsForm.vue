<template>
  <div class="settings-card">
    <div class="section-header">
      <div>
        <h1 class="section-title">Configurações</h1>
        <p class="section-subtitle">Ajuste o comportamento do player</p>
      </div>
    </div>
    
    <form @submit.prevent="save">
      <div class="form-group">
        <label>Duração padrão (segundos)</label>
        <input v-model="form.defaultDuration" type="number" min="3" max="120" />
      </div>

      <div class="form-group">
        <label>Efeito de transição</label>
        <select v-model="form.transition">
          <option value="fade">Fade (Dissolver)</option>
          <option value="slide">Slide (Deslizar)</option>
          <option value="zoom">Zoom</option>
          <option value="none">Sem transição</option>
        </select>
      </div>

      <hr class="divider" />

      <div class="form-group">
        <label>Alterar senha do admin</label>
        <input v-model="form.adminPassword" type="password" placeholder="Nova senha (deixe em branco para manter)" />
      </div>

      <button type="submit" class="btn btn-primary">Salvar Configurações</button>
    </form>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps(['settings'])
const emit = defineEmits(['save'])

const form = ref({
  defaultDuration: 10,
  transition: 'fade',
  adminPassword: ''
})

watch(() => props.settings, (newSettings) => {
  if (newSettings) {
    form.value.defaultDuration = newSettings.defaultDuration
    form.value.transition = newSettings.transition
  }
}, { immediate: true })

const save = () => {
  if (form.value.adminPassword && form.value.adminPassword.length < 4) {
    alert('A senha deve ter no mínimo 4 caracteres')
    return
  }
  emit('save', form.value)
  form.value.adminPassword = ''
}
</script>

<style scoped>
.settings-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 2rem; max-width: 600px; }
.section-header { margin-bottom: 2rem; }
.section-title { font-size: 1.5rem; font-weight: 700; color: white; }
.section-subtitle { color: var(--text-secondary); font-size: 0.9rem; }
.form-group { margin-bottom: 1.5rem; }
.form-group label { display: block; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem; }
.form-group input, .form-group select { width: 100%; padding: 0.85rem; background: var(--bg-input); border: 1px solid var(--border); border-radius: var(--radius-md); color: white; outline: none; }
.form-group select { appearance: none; }
.divider { border: none; border-top: 1px solid var(--border); margin: 2rem 0; }
.btn { padding: 0.75rem 1.5rem; border: none; border-radius: var(--radius-md); font-weight: 600; cursor: pointer; color: white; }
.btn-primary { background: linear-gradient(135deg, var(--accent), #8b5cf6); }
</style>
