<template>
  <div class="container">
    <div class="logo">📺</div>
    <h1>Sistema de Anúncios</h1>
    <p class="subtitle">Digital Signage para Prédios Comerciais</p>

    <div class="cards">
      <NuxtLink to="/player" class="card" id="btn-player">
        <span class="card-icon">🖥️</span>
        <div class="card-title">Player TV</div>
        <p class="card-desc">Abrir o player de exibição fullscreen para a TV</p>
      </NuxtLink>

      <NuxtLink to="/admin" class="card" id="btn-admin">
        <span class="card-icon">⚙️</span>
        <div class="card-title">Painel Admin</div>
        <p class="card-desc">Gerenciar anúncios, configurações e conteúdo</p>
      </NuxtLink>
    </div>

    <p class="footer">Sistema de Anúncios para TV &copy; 2024</p>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
  padding: 2rem;
  position: relative;
  z-index: 1;
}

/* Background gradient animation */
.container::before {
  content: '';
  position: fixed;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: 
    radial-gradient(ellipse at 20% 50%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(139, 92, 246, 0.12) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 80%, rgba(6, 182, 212, 0.1) 0%, transparent 50%);
  animation: bgFloat 20s ease-in-out infinite;
  z-index: -1;
}

@keyframes bgFloat {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  33% { transform: translate(2%, -2%) rotate(1deg); }
  66% { transform: translate(-1%, 1%) rotate(-0.5deg); }
}

.logo {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  animation: pulse 3s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

h1 {
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #818cf8, #6366f1, #06b6d4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
  letter-spacing: -0.02em;
}

.subtitle {
  color: rgba(255,255,255,0.5);
  font-size: 1.1rem;
  font-weight: 300;
  margin-bottom: 3rem;
}

.cards {
  display: flex;
  gap: 2rem;
  justify-content: center;
  flex-wrap: wrap;
}

.card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 24px;
  padding: 3rem 2.5rem;
  width: 280px;
  text-decoration: none;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(20px);
  position: relative;
  overflow: hidden;
}

.card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, #6366f1, #06b6d4, transparent);
  opacity: 0;
  transition: opacity 0.4s;
}

.card:hover {
  transform: translateY(-8px);
  border-color: rgba(99, 102, 241, 0.3);
  background: rgba(255,255,255,0.07);
  box-shadow: 0 20px 60px rgba(99, 102, 241, 0.15);
}

.card:hover::before { opacity: 1; }

.card-icon {
  font-size: 3rem;
  margin-bottom: 1.5rem;
  display: block;
}

.card-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 0.75rem;
}

.card-desc {
  font-size: 0.9rem;
  color: rgba(255,255,255,0.45);
  line-height: 1.6;
}

.footer {
  margin-top: 4rem;
  color: rgba(255,255,255,0.2);
  font-size: 0.8rem;
}

@media (max-width: 640px) {
  h1 { font-size: 1.8rem; }
  .cards { flex-direction: column; align-items: center; }
  .card { width: 100%; max-width: 320px; }
}
</style>
