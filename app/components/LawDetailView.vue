<template>
  <div class="law-detail-view glass animate-fade-in">
    <!-- Detail Header -->
    <div class="detail-header">
      <div class="meta-section">
        <span class="badge badge-blue console-font">{{ law.department }}</span>
        <span class="badge badge-grey console-font">ID: {{ law.idNumber }}</span>
      </div>
      <h2 class="law-title">{{ law.title }}</h2>
      <div class="law-meta text-muted">
        <span>공포일: {{ formatDate(law.date) }}</span>
        <span class="divider">•</span>
        <span>시행일: {{ formatDate(law.effectiveDate) }}</span>
        <span class="divider">•</span>
        <span>구분: {{ law.type }}</span>
      </div>
    </div>

    <!-- Content Area (Only Core Articles Text View) -->
    <div class="detail-content-area">
      <div class="articles-layout">
        <!-- Mini Outline (Left Sidebar) -->
        <aside class="articles-outline" aria-label="조문 목차">
          <div class="outline-title">목차</div>
          <div class="outline-list">
            <button 
              v-for="art in law.articles" 
              :key="art.id"
              class="outline-item"
              @click="scrollToArticle(art.id)"
              :title="art.title"
            >
              <span class="outline-dot"></span>
              <span class="outline-text">{{ art.id }}</span>
            </button>
          </div>
        </aside>

        <!-- Articles Body (Right Scrollable Pane) -->
        <div id="detail-body-container" class="articles-body">
          <div 
            v-for="art in law.articles" 
            :key="art.id" 
            :id="'art-' + art.id"
            class="article-card glow-hover"
          >
            <div class="article-card-header">
              <h3 class="article-card-title">{{ art.title }}</h3>
              <button class="copy-btn" @click="copyArticleText(art)" title="조문 복사">
                <svg class="copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
            </div>
            <div 
              class="article-card-content" 
              v-html="getHighlightedContent(art.content)"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LawDetail, Article } from '~/types';

const props = defineProps<{
  law: LawDetail;
  searchQuery?: string;
}>();

// Helper to format Korea Law date e.g., '19871029' -> '1987년 10월 29일'
function formatDate(dateStr: string) {
  if (!dateStr || dateStr.length !== 8) return dateStr || '미상';
  return `${dateStr.substring(0, 4)}년 ${dateStr.substring(4, 6)}월 ${dateStr.substring(6, 8)}일`;
}

// Outline scroll jump
function scrollToArticle(id: string) {
  const container = document.getElementById('detail-body-container');
  const target = document.getElementById(`art-${id}`);
  if (container && target) {
    container.scrollTo({
      top: target.offsetTop - 12,
      behavior: 'smooth'
    });
  }
}

// Highlight query matches inside articles
function getHighlightedContent(content: string) {
  if (!props.searchQuery || !props.searchQuery.trim()) {
    return escapeHtml(content).replace(/\n/g, '<br>');
  }
  const escapedText = escapeHtml(content);
  const regex = new RegExp(`(${escapeRegex(props.searchQuery)})`, 'gi');
  return escapedText.replace(regex, '<span class="highlight">$1</span>').replace(/\n/g, '<br>');
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeRegex(text: string) {
  return text.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

// Copy article text to clipboard
async function copyArticleText(art: any) {
  try {
    const textToCopy = `${props.law.title} ${art.title}\n\n${art.content}`;
    await navigator.clipboard.writeText(textToCopy);
    alert(`${art.id} 조문이 클립보드에 복사되었습니다.`);
  } catch (err) {
    console.error('클립보드 복사 실패:', err);
  }
}
</script>

<style lang="scss" scoped>
.law-detail-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid var(--border-light);
  background: var(--bg-surface-glass);

  /* Header style */
  .detail-header {
    padding: 24px;
    border-bottom: 1px solid var(--border-light);
    
    .meta-section {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
    }

    .law-title {
      font-size: 1.8rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      margin-bottom: 8px;
    }

    .law-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.85rem;
      
      .divider {
        opacity: 0.3;
      }
    }
  }

  /* Content Area */
  .detail-content-area {
    flex: 1;
    overflow: hidden;
    position: relative;
    
    /* Articles layout split */
    .articles-layout {
      display: flex;
      height: 100%;
      position: relative;
      
      /* Mini outline (TOC) sidebar */
      .articles-outline {
        width: 140px;
        border-right: 1px solid var(--border-light);
        padding: 16px 8px;
        display: flex;
        flex-direction: column;
        background: rgba(0, 0, 0, 0.1);
        overflow-y: auto;
        
        .outline-title {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-muted);
          margin-bottom: 12px;
          padding-left: 8px;
        }

        .outline-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
          
          .outline-item {
            display: flex;
            align-items: center;
            gap: 8px;
            background: transparent;
            border: none;
            color: var(--text-secondary);
            font-size: 0.8rem;
            padding: 6px 8px;
            border-radius: 6px;
            cursor: pointer;
            text-align: left;
            transition: all 0.2s ease;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            
            &:hover {
              background: rgba(255, 255, 255, 0.05);
              color: var(--text-primary);
              
              .outline-dot {
                background: var(--accent);
                box-shadow: 0 0 6px var(--accent);
              }
            }

            .outline-dot {
              width: 4px;
              height: 4px;
              background: var(--text-muted);
              border-radius: 50%;
              flex-shrink: 0;
            }

            .outline-text {
              overflow: hidden;
              text-overflow: ellipsis;
            }
          }
        }
      }
      
      /* Articles scrolling pane */
      .articles-body {
        flex: 1;
        padding: 24px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 16px;
        height: 100%;
        
        .article-card {
          background: var(--bg-card);
          border: 1px solid var(--border-light);
          border-radius: 10px;
          padding: 20px;
          position: relative;
          
          .article-card-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 12px;
            gap: 16px;
            
            .article-card-title {
              font-size: 1rem;
              font-weight: 600;
              color: var(--text-primary);
            }

            .copy-btn {
              background: transparent;
              border: none;
              color: var(--text-muted);
              cursor: pointer;
              padding: 4px;
              border-radius: 4px;
              display: flex;
              align-items: center;
              justify-content: center;
              transition: all 0.2s ease;
              
              &:hover {
                background: rgba(255, 255, 255, 0.05);
                color: var(--accent);
              }

              .copy-icon {
                width: 16px;
                height: 16px;
              }
            }
          }

          .article-card-content {
            font-size: 0.95rem;
            line-height: 1.6;
            color: var(--text-secondary);
            white-space: pre-wrap;
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .law-detail-view {
    .detail-content-area {
      .articles-layout {
        .articles-outline {
          display: none;
        }
      }
    }
  }
}
</style>
