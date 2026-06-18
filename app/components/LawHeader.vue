<template>
  <header class="law-header glass">
    <div class="header-left" @click="$emit('reset-search')">
      <!-- Scales of justice + Initial D modern geometric logo -->
      <svg class="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Outer elegant D shape -->
        <path d="M4 4H12C16.9706 4 21 8.02944 21 13C21 17.9706 16.9706 22 12 22H4V4Z" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round" />
        <!-- Center pillar of scales -->
        <line x1="9.5" y1="9" x2="9.5" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        <line x1="7.5" y1="18" x2="11.5" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        <!-- Balance beam -->
        <line x1="5.5" y1="10.5" x2="13.5" y2="10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        <!-- Left scale pan -->
        <path d="M4.5 14C4.5 15.5 6.5 15.5 6.5 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        <line x1="5.5" y1="10.5" x2="5.5" y2="14" stroke="currentColor" stroke-width="1" />
        <!-- Right scale pan -->
        <path d="M12.5 14C12.5 15.5 14.5 15.5 14.5 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        <line x1="13.5" y1="10.5" x2="13.5" y2="14" stroke="currentColor" stroke-width="1" />
      </svg>
      <span class="logo-title">Lawyer <span class="text-accent">Dom</span></span>
    </div>
    
    <div class="header-right">
      <!-- Fixed Live Status Badge -->
      <div class="status-badge active">
        <span class="status-dot"></span>
        <span class="status-text">법제처 API 연동 중</span>
      </div>

      <!-- New Search Button -->
      <button class="new-search-btn" @click="$emit('reset-search')" title="새로운 검색을 시작합니다.">
        <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        <span>새 검색</span>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
defineEmits(['reset-search']);
</script>

<style lang="scss" scoped>
.law-header {
  height: var(--header-height);
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  border-bottom: 1px solid var(--border-light);
  border-top: none;
  border-left: none;
  border-right: none;

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    user-select: none;
    
    .logo-icon {
      width: 28px;
      height: 28px;
      color: var(--text-primary);
      transition: transform 0.3s ease;
    }
    
    &:hover .logo-icon {
      transform: rotate(-5deg) scale(1.05);
    }
    
    .logo-title {
      font-size: 1.4rem;
      font-weight: 700;
      letter-spacing: -0.03em;
      
      .text-accent {
        color: var(--accent);
      }
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 16px;
    
    .status-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border-light);
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;
      color: var(--text-secondary);
      transition: all 0.3s ease;
      
      &.active {
        border-color: rgba(37, 99, 235, 0.2);
        background: rgba(37, 99, 235, 0.05);
        color: var(--accent);
        
        .status-dot {
          background: var(--accent);
          box-shadow: 0 0 8px var(--accent);
          animation: pulse-accent 2s infinite;
        }
      }
      
      .status-dot {
        width: 6px;
        height: 6px;
        background: var(--text-muted);
        border-radius: 50%;
        display: inline-block;
        transition: all 0.3s ease;
      }
    }

    .new-search-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--bg-card);
      border: 1px solid var(--border-light);
      color: var(--text-primary);
      padding: 7px 14px;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      
      &:hover {
        background: var(--bg-card-hover);
        border-color: var(--accent);
        color: var(--accent);
      }
      
      .btn-icon {
        width: 15px;
        height: 15px;
      }
    }
  }
}

@keyframes pulse-accent {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

@media (max-width: 640px) {
  .law-header {
    padding: 0 16px;
    
    .header-right {
      .status-badge {
        padding: 5px 8px;
        
        .status-text {
          display: none;
        }
      }
    }
  }
}
</style>
