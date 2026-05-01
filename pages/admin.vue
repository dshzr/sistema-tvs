<template>
  <div class="apple-admin">
    <!-- macOS Style Login -->
    <div v-if="!isAuthenticated" class="login-wrapper">
      <div class="login-bg"></div>
      <div class="login-container">
        <div class="user-avatar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <h1 class="login-name">Well Builders</h1>
        <form @submit.prevent="login" class="login-form">
          <div class="input-field">
            <input 
              v-model="password" 
              type="password" 
              placeholder="Senha" 
              required 
              autofocus
            />
            <button type="submit" class="submit-arrow">→</button>
          </div>
          <p v-if="errorMsg" class="login-error">{{ errorMsg }}</p>
        </form>
      </div>
    </div>

    <!-- macOS Style Dashboard -->
    <div v-else class="dashboard-wrapper">
      <AdminSidebar 
        :active-section="activeSection" 
        @change-section="activeSection = $event"
        @logout="logout"
      />
      
      <main class="main-viewport">
        <div class="viewport-header">
          <h1 class="view-title">{{ activeSection === 'announcements' ? 'Anúncios' : 'Configurações' }}</h1>
          <button 
            v-if="activeSection === 'announcements'"
            class="apple-btn apple-btn-primary" 
            @click="showModal = true; editingId = null"
          >
            Adicionar Novo
          </button>
        </div>

        <div class="view-content">
          <!-- Announcements -->
          <div v-show="activeSection === 'announcements'" class="scroll-area">
            <div v-if="announcements.length > 0" class="apple-grid">
              <AdminAnnouncementCard 
                v-for="ann in announcements" 
                :key="ann.id" 
                :announcement="ann"
                @toggle="toggleStatus"
                @edit="openEdit"
                @delete="deleteAnn"
              />
            </div>
            <div v-else class="apple-empty">
              <span class="empty-icon">📂</span>
              <p>Nenhum anúncio disponível</p>
            </div>
          </div>

          <!-- Settings -->
          <div v-show="activeSection === 'settings'" class="apple-settings-view">
            <AdminSettingsForm :settings="settings" @save="saveSettings" />
          </div>
        </div>
      </main>
    </div>

    <AdminModal 
      v-if="showModal" 
      :announcement="editingAnn" 
      @close="closeModal" 
      @save="saveAnnouncement"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const isAuthenticated = ref(false)
const password = ref('')
const errorMsg = ref('')

const activeSection = ref('announcements')
const announcements = ref([])
const settings = ref({ defaultDuration: 10, transition: 'fade' })

const showModal = ref(false)
const editingId = ref(null)

const editingAnn = computed(() => {
  return editingId.value ? announcements.value.find(a => a.id === editingId.value) : null
})

const login = async () => {
  try {
    errorMsg.value = ''
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: { password: password.value }
    })
    isAuthenticated.value = true
    sessionStorage.setItem('admin_auth', 'true')
    fetchData()
  } catch (err) {
    errorMsg.value = 'Senha Incorreta'
  }
}

const logout = () => {
  isAuthenticated.value = false
  sessionStorage.removeItem('admin_auth')
  password.value = ''
}

const fetchData = async () => {
  try {
    const [anns, sets] = await Promise.all([
      $fetch('/api/announcements'),
      $fetch('/api/settings')
    ])
    announcements.value = anns
    settings.value = sets
  } catch (err) { console.error(err) }
}

const toggleStatus = async (id, currentStatus) => {
  const formData = new FormData()
  formData.append('active', (!currentStatus).toString())
  await $fetch(`/api/announcements/${id}`, { method: 'PUT', body: formData })
  fetchData()
}

const deleteAnn = async (id) => {
  if (confirm('Deseja realmente remover este anúncio?')) {
    await $fetch(`/api/announcements/${id}`, { method: 'DELETE' })
    fetchData()
  }
}

const openEdit = (id) => {
  editingId.value = id; showModal.value = true
}

const closeModal = () => {
  showModal.value = false; editingId.value = null
}

const saveAnnouncement = async (formData) => {
  try {
    const url = editingId.value ? `/api/announcements/${editingId.value}` : '/api/announcements'
    await $fetch(url, { method: editingId.value ? 'PUT' : 'POST', body: formData })
    closeModal(); fetchData()
  } catch (err) { alert('Erro ao salvar') }
}

const saveSettings = async (newSettings) => {
  try {
    const res = await $fetch('/api/settings', { method: 'PUT', body: newSettings })
    settings.value = res.settings
    alert('Ajustes salvos com sucesso!')
  } catch (err) { alert('Erro ao salvar') }
}

onMounted(() => {
  if (sessionStorage.getItem('admin_auth') === 'true') {
    isAuthenticated.value = true; fetchData()
  }
})
</script>

<style scoped>
.apple-admin {
  min-height: 100vh;
  background: var(--bg-primary);
  font-family: 'Outfit', sans-serif;
}

/* Login Style */
.login-wrapper {
  height: 100vh; display: flex; align-items: center; justify-content: center; position: relative;
}
.login-bg {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  background: radial-gradient(circle at center, #2c2c2e 0%, #000000 100%);
  z-index: -1;
}
.login-container { text-align: center; width: 100%; max-width: 300px; animation: fadeIn 1s ease; }
.user-avatar {
  width: 90px; height: 90px; background: rgba(255,255,255,0.1); 
  border-radius: 50%; margin: 0 auto 1.5rem; display: flex; align-items: center; justify-content: center; color: #fff;
}
.login-name { font-size: 1.5rem; font-weight: 600; margin-bottom: 1.5rem; color: #fff; }
.input-field {
  position: relative; background: rgba(255,255,255,0.1); border-radius: 100px; padding: 2px;
  border: 1px solid rgba(255,255,255,0.05); backdrop-filter: blur(20px);
}
.input-field input {
  width: 100%; background: transparent; border: none; padding: 0.75rem 1.25rem; color: #fff; outline: none; text-align: center;
}
.submit-arrow {
  position: absolute; right: 4px; top: 4px; bottom: 4px; width: 32px; 
  background: rgba(255,255,255,0.2); border: none; border-radius: 50%; color: #fff; cursor: pointer;
}
.login-error { color: var(--system-red); font-size: 0.8rem; margin-top: 1rem; }

/* Dashboard Style */
.dashboard-wrapper { display: flex; min-height: 100vh; }
.main-viewport { flex: 1; margin-left: 260px; padding: 2.5rem 3rem; background: #000; }
.viewport-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; }
.view-title { font-size: 2rem; font-weight: 700; color: #fff; letter-spacing: -0.03em; }

.apple-btn {
  padding: 0.6rem 1.2rem; border-radius: 10px; font-weight: 500; border: none; cursor: pointer; transition: all 0.2s;
}
.apple-btn-primary { background: #007aff; color: #fff; }
.apple-btn-primary:hover { background: #0a84ff; }

.apple-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
.apple-empty { text-align: center; padding: 5rem; color: rgba(255,255,255,0.3); }
.empty-icon { font-size: 3rem; margin-bottom: 1rem; display: block; }

.apple-settings-view { max-width: 700px; }

@media (max-width: 768px) {
  .main-viewport { margin-left: 0; padding: 1.5rem; }
}

@keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
</style>
