<template>
  <div>
    <!-- Login Screen -->
    <div v-if="!isAuthenticated" class="login-screen">
      <div class="login-card">
        <div class="login-logo">🔐</div>
        <h1 class="login-title">Well Builders</h1>
        <p class="login-subtitle">Digite a senha para acessar</p>
        <form @submit.prevent="login" class="login-form">
          <div class="input-group">
            <input v-model="password" type="password" placeholder="Senha de acesso" required />
          </div>
          <button type="submit" class="btn btn-primary btn-full">Entrar</button>
          <p class="login-error">{{ errorMsg }}</p>
        </form>
      </div>
    </div>

    <!-- Dashboard -->
    <div v-else class="dashboard">
      <AdminSidebar 
        :active-section="activeSection" 
        @change-section="activeSection = $event"
        @logout="logout"
      />
      
      <main class="main-content">
        <!-- Announcements Section -->
        <section v-show="activeSection === 'announcements'">
          <div class="section-header">
            <div>
              <h1 class="section-title">Anúncios</h1>
              <p class="section-subtitle">Gerencie o conteúdo exibido nas TVs</p>
            </div>
            <button class="btn btn-primary" @click="showModal = true; editingId = null">
              Novo Anúncio
            </button>
          </div>

          <div v-if="announcements.length > 0" class="announcements-grid">
            <AdminAnnouncementCard 
              v-for="ann in announcements" 
              :key="ann.id" 
              :announcement="ann"
              @toggle="toggleStatus"
              @edit="openEdit"
              @delete="deleteAnn"
            />
          </div>
          <div v-else class="empty-state">
            <div class="empty-icon">📭</div>
            <h3>Nenhum anúncio cadastrado</h3>
          </div>
        </section>

        <!-- Settings Section -->
        <section v-show="activeSection === 'settings'">
          <AdminSettingsForm :settings="settings" @save="saveSettings" />
        </section>
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
    errorMsg.value = 'Senha incorreta'
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
  } catch (err) {
    console.error(err)
  }
}

const toggleStatus = async (id, currentStatus) => {
  const formData = new FormData()
  formData.append('active', (!currentStatus).toString())
  await $fetch(`/api/announcements/${id}`, { method: 'PUT', body: formData })
  fetchData()
}

const deleteAnn = async (id) => {
  if (confirm('Tem certeza que deseja excluir este anúncio?')) {
    await $fetch(`/api/announcements/${id}`, { method: 'DELETE' })
    fetchData()
  }
}

const openEdit = (id) => {
  editingId.value = id
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingId.value = null
}

const saveAnnouncement = async (formData) => {
  try {
    const url = editingId.value ? `/api/announcements/${editingId.value}` : '/api/announcements'
    const method = editingId.value ? 'PUT' : 'POST'
    await $fetch(url, { method, body: formData })
    closeModal()
    fetchData()
  } catch (err) {
    alert('Erro ao salvar anúncio')
  }
}

const saveSettings = async (newSettings) => {
  try {
    const res = await $fetch('/api/settings', {
      method: 'PUT',
      body: newSettings
    })
    settings.value = res.settings
    alert('Configurações salvas!')
  } catch (err) {
    alert('Erro ao salvar configurações')
  }
}

onMounted(() => {
  if (sessionStorage.getItem('admin_auth') === 'true') {
    isAuthenticated.value = true
    fetchData()
  }
})
</script>

<style scoped>
/* Resumo dos estilos base, usando var do main.css */
.login-screen {
  min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 2rem;
}
.login-card {
  background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-xl);
  padding: 3rem 2.5rem; width: 100%; max-width: 420px; text-align: center; backdrop-filter: blur(20px);
}
.login-logo { font-size: 3.5rem; margin-bottom: 1.5rem; }
.login-title { font-size: 1.8rem; font-weight: 700; margin-bottom: 0.5rem; }
.login-error { color: var(--red); font-size: 0.85rem; margin-top: 1rem; min-height: 1.2em; }
.input-group input {
  width: 100%; padding: 0.85rem 1rem; background: var(--bg-input); border: 1px solid var(--border);
  border-radius: var(--radius-md); color: var(--text-primary); margin-bottom: 1rem; outline: none;
}
.btn {
  padding: 0.75rem 1.5rem; border: none; border-radius: var(--radius-md); font-weight: 600; cursor: pointer; transition: var(--transition); color: white;
}
.btn-primary { background: linear-gradient(135deg, var(--accent), #8b5cf6); }
.btn-full { width: 100%; }

.dashboard { display: flex; min-height: 100vh; }
.main-content { flex: 1; margin-left: 260px; padding: 2rem; }
.section-header { display: flex; justify-content: space-between; margin-bottom: 2rem; }
.announcements-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
.empty-state { text-align: center; padding: 4rem; color: var(--text-secondary); }
.empty-icon { font-size: 4rem; margin-bottom: 1.5rem; opacity: 0.5; }

@media (max-width: 768px) {
  .main-content { margin-left: 0; }
}
</style>
