<template>
  <div class="apple-settings">
    <form @submit.prevent="save" class="settings-form">
      <!-- General Section -->
      <div class="settings-section">
        <h3 class="section-label">Reprodução</h3>
        <div class="settings-group">
          <div class="setting-row">
            <div class="setting-info">
              <label>Duração Padrão</label>
              <p>Tempo de exibição para imagens (segundos)</p>
            </div>
            <div class="setting-control">
              <input v-model="form.defaultDuration" type="number" min="3" max="120" />
            </div>
          </div>
          
          <div class="setting-row">
            <div class="setting-info">
              <label>Efeito de Transição</label>
              <p>Animação entre os anúncios</p>
            </div>
            <div class="setting-control">
              <select v-model="form.transition">
                <option value="fade">Dissolver (Fade)</option>
                <option value="slide">Deslizar (Slide)</option>
                <option value="zoom">Aproximar (Zoom)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Security Section -->
      <div class="settings-section">
        <h3 class="section-label">Segurança</h3>
        <div class="settings-group">
          <div class="setting-row">
            <div class="setting-info">
              <label>Senha do Painel</label>
              <p>Altere a senha de acesso ao admin</p>
            </div>
            <div class="setting-control">
              <input 
                v-model="form.adminPassword" 
                type="password" 
                placeholder="Nova senha" 
              />
            </div>
          </div>
        </div>
      </div>

      <div class="form-footer">
        <button type="submit" class="apple-btn apple-btn-primary">Salvar Ajustes</button>
      </div>
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

watch(() => props.settings, (newS) => {
  if (newS) {
    form.value.defaultDuration = newS.defaultDuration
    form.value.transition = newS.transition
  }
}, { immediate: true })

const save = () => {
  if (form.value.adminPassword && form.value.adminPassword.length < 4) {
    alert('A senha deve ter pelo menos 4 caracteres')
    return
  }
  emit('save', { ...form.value })
  form.value.adminPassword = ''
}
</script>

<style scoped>
.apple-settings { width: 100%; }
.settings-section { margin-bottom: 2.5rem; }
.section-label { 
  font-size: 0.8rem; font-weight: 500; color: rgba(255,255,255,0.4); 
  text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem; padding-left: 1rem;
}

.settings-group {
  background: #1c1c1e; border: 1px solid rgba(255,255,255,0.05);
  border-radius: 12px; overflow: hidden;
}

.setting-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 1rem 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.05);
}
.setting-row:last-child { border-bottom: none; }

.setting-info label { display: block; font-size: 1rem; font-weight: 500; color: #fff; margin-bottom: 0.2rem; }
.setting-info p { font-size: 0.8rem; color: rgba(255,255,255,0.4); }

.setting-control input, .setting-control select {
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px; padding: 0.5rem 0.75rem; color: #fff; outline: none; width: 180px;
  font-family: inherit; font-size: 0.9rem;
}
.setting-control input:focus { border-color: #007aff; }

.form-footer { margin-top: 2rem; display: flex; justify-content: flex-end; }

.apple-btn {
  padding: 0.75rem 1.5rem; border-radius: 10px; font-weight: 600; border: none; cursor: pointer; transition: all 0.2s;
}
.apple-btn-primary { background: #007aff; color: #fff; }
</style>
