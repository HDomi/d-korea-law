<template>
  <div class="law-guide-view glass animate-fade-in" @click="handleContainerClick">
    <!-- 1. Domain Error State View -->
    <div v-if="isDomainError" class="domain-error-view animate-fade-in">
      <div class="error-shield-wrapper">
        <svg class="error-shield-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke-linecap="round" stroke-linejoin="round" />
          <line x1="12" y1="8" x2="12" y2="12" stroke-linecap="round" stroke-linejoin="round" />
          <line x1="12" y1="16" x2="12.01" y2="16" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
      <h3 class="error-title">지원하지 않는 법률 분야</h3>
      
      <!-- User Query Box (Error State) -->
      <div class="user-query-box error-state animate-slide-up" v-if="userQuery">
        <p class="query-label">입력한 질문 내용</p>
        <p class="query-text">"{{ userQuery }}"</p>
      </div>

      <p class="error-msg">
        {{ guideText }}
      </p>
      <div class="error-guideline-box">
        <h4 class="guideline-title">Lawyer Dom은 아래의 3가지 소액 분쟁만 전문적으로 해결합니다:</h4>
        <ul class="guideline-list">
          <li><strong>🏠 부동산/주거:</strong> 전세보증금 미반환, 원룸 월세 보증금 먹튀 등</li>
          <li><strong>💼 노동/직장:</strong> 아르바이트 및 소액 임금체불, 주휴수당 미지급 등</li>
          <li><strong>📱 사이버/민사:</strong> 당근/중고나라 등 소액 중고거래 사기 및 먹튀 등</li>
        </ul>
      </div>
      <button class="retry-search-btn" @click="triggerResetTrigger">새로운 질문 하러 가기</button>
    </div>

    <!-- 2. Standard Guide View (only show if not error) -->
    <template v-else>
      <!-- Header with Category and Title -->
      <div class="guide-header">
      <div class="meta-section">
        <span class="badge badge-blue console-font">AI 가이드</span>
        <span class="badge badge-grey console-font">{{ getCategoryLabel(category) }}</span>
      </div>
      <h2 class="guide-title">
        <span class="sparkle-icon">✨</span> AI 법률 분석 및 단계별 대응 가이드
      </h2>
      <p class="guide-subtitle text-muted">
        검색된 키워드: <strong class="keyword-text">#{{ searchKeyword }}</strong> | 질문에 기반한 법률 의견 및 행동 전략입니다.
      </p>

      <!-- User Query Box -->
      <div class="user-query-box animate-slide-up" v-if="userQuery">
        <span class="query-quote-icon">“</span>
        <span class="query-text">{{ userQuery }}</span>
        <span class="query-quote-icon right">”</span>
      </div>
    </div>

    <!-- Tab Navigation -->
    <nav class="guide-tabs-nav" aria-label="가이드 및 참조 자료 탭">
      <button 
        v-for="tab in tabs" 
        :key="tab.id" 
        :class="['tab-nav-item', activeTab === tab.id ? 'active' : '']"
        @click="activeTab = tab.id"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-text">{{ tab.label }}</span>
        <span v-if="tab.count !== undefined" class="tab-count">{{ tab.count }}</span>
      </button>
    </nav>

    <!-- Tab Contents -->
    <div class="guide-content-area">
      <!-- 1. AI GUIDE TAB -->
      <div v-if="activeTab === 'guide'" class="tab-pane-content guide-pane animate-fade-in">
        <div class="guide-body-html" v-html="parsedGuide"></div>
      </div>

      <!-- 2. LAWS TAB -->
      <div v-else-if="activeTab === 'laws'" class="tab-pane-content references-pane animate-fade-in">
        <div v-if="laws.length > 0" class="reference-cards-list">
          <div v-for="law in laws" :key="law.lawId + '-' + law.articleNumber" class="reference-card glow-hover">
            <div class="ref-card-header">
              <span class="ref-badge badge-blue">법령</span>
              <h3 class="ref-title">{{ law.title }} 제{{ law.articleNumber }}조의{{ law.paragraphNumber || '1' }} ({{ law.articleTitle || '조문' }})</h3>
            </div>
            <div class="ref-body">
              <p class="ref-content-text">{{ law.content }}</p>
            </div>
            <div class="ref-footer">
              <a :href="law.link" target="_blank" class="ref-link-btn" rel="noopener noreferrer">
                <span>국가법령정보센터에서 법령 전문 보기</span>
                <svg class="external-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div v-else class="empty-reference-state">
          <p class="text-muted">가이드 작성에 참조된 법령이 없습니다.</p>
        </div>
      </div>

      <!-- 3. PRECEDENTS TAB -->
      <div v-else-if="activeTab === 'precedents'" class="tab-pane-content references-pane animate-fade-in">
        <div v-if="precedents.length > 0" class="reference-cards-list">
          <div v-for="prec in precedents" :key="prec.precId" class="reference-card precedents glow-hover">
            <div class="ref-card-header">
              <span class="ref-badge badge-purple">판례</span>
              <h3 class="ref-title">{{ prec.court }} {{ prec.judgmentType }} | {{ prec.caseName }}</h3>
            </div>
            <div class="ref-meta text-muted">
              <span>사건번호: <strong>{{ prec.caseNumber }}</strong></span>
              <span class="meta-dot">•</span>
              <span>선고일자: {{ formatPrecDate(prec.judgmentDate) }}</span>
              <span class="meta-dot">•</span>
              <span>사건구분: {{ prec.caseType }}</span>
            </div>
            <div class="ref-footer">
              <a :href="prec.link" target="_blank" class="ref-link-btn" rel="noopener noreferrer">
                <span>종합법률정보에서 판례 전문 보기</span>
                <svg class="external-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div v-else class="empty-reference-state">
          <p class="text-muted">가이드 작성에 참조된 대법원 판례가 없습니다.</p>
        </div>
      </div>

      <!-- 4. OTHERS TAB -->
      <div v-else-if="activeTab === 'others'" class="tab-pane-content references-pane animate-fade-in">
        <div v-if="others.length > 0" class="reference-cards-list">
          <div v-for="other in others" :key="other.id" class="reference-card others glow-hover">
            <div class="ref-card-header">
              <span class="ref-badge badge-orange">{{ other.targetType || '기타' }}</span>
              <h3 class="ref-title">{{ other.title || other.caseName || '기타 유관 행정 자료' }}</h3>
            </div>
            <div class="ref-meta text-muted" v-if="other.caseNumber || other.judgmentDate || other.court">
              <span v-if="other.court">기관/법원: {{ other.court }}</span>
              <span class="meta-dot" v-if="other.court && other.caseNumber">•</span>
              <span v-if="other.caseNumber">번호: {{ other.caseNumber }}</span>
              <span class="meta-dot" v-if="other.caseNumber && other.judgmentDate">•</span>
              <span v-if="other.judgmentDate">일자: {{ formatPrecDate(other.judgmentDate) }}</span>
            </div>
            <div class="ref-footer">
              <a :href="other.link" target="_blank" class="ref-link-btn" rel="noopener noreferrer">
                <span>공식 상세 정보 확인하기</span>
                <svg class="external-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div v-else class="empty-reference-state">
          <p class="text-muted">참조된 유관 행정 규칙 및 해석례 자료가 없습니다.</p>
        </div>
      </div>
    </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useState } from '#app';
import type { RawLaw, RawPrecedent, RawOther } from '~/types';

const props = defineProps<{
  guideText: string;
  category: string;
  searchKeyword: string;
  laws: RawLaw[];
  precedents: RawPrecedent[];
  others: RawOther[];
  userQuery?: string;
}>();

const activeTab = ref<'guide' | 'laws' | 'precedents' | 'others'>('guide');

// Global search reset trigger
const resetTrigger = useState('reset-search-trigger', () => 0);
function triggerResetTrigger() {
  resetTrigger.value++;
}

const isDomainError = computed(() => {
  if (!props.guideText) return false;
  return props.guideText.includes('저는 저 3가지 도메인') || 
         props.guideText.includes('전문 봇이라 다른건 대답할수 없습니다');
});

// Temporary storage for code/templates extracted from markdown
const templates = ref<string[]>([]);

const tabs = computed(() => [
  { id: 'guide', label: 'AI 법률 가이드', icon: '✨' },
  { id: 'laws', label: '참조 법령', icon: '⚖️', count: props.laws?.length || 0 },
  { id: 'precedents', label: '참조 판례', icon: '👩‍⚖️', count: props.precedents?.length || 0 },
  { id: 'others', label: '유관 행정 자료', icon: '📋', count: props.others?.length || 0 },
]);

// Clear and rebuild parsed content when guideText changes
const parsedGuide = computed(() => {
  templates.value = [];
  return parseMarkdownToHtml(props.guideText);
});

// Category Label Resolver
function getCategoryLabel(cat: string) {
  const mapping: Record<string, string> = {
    housing: '🏠 부동산/주거',
    labor: '💼 노동/직장',
    scam: '📱 사이버/민사'
  };
  return mapping[cat] || '⚖️ 일반 법률';
}

// Convert YYYYMMDD string to readable format
function formatPrecDate(dateStr?: string) {
  if (!dateStr || dateStr.length !== 8) return dateStr || '미상';
  return `${dateStr.substring(0, 4)}.${dateStr.substring(4, 6)}.${dateStr.substring(6, 8)}`;
}

// Escapes special HTML chars
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Helper to escape inline styles/markdown inside bullet items
function parseInlineMarkdown(text: string): string {
  let parsed = escapeHtml(text);
  // Bold: **text**
  parsed = parsed.replace(/\*\*([^*]+)\*\*/g, '<strong class="guide-bold">$1</strong>');
  // Inline Code: `text`
  parsed = parsed.replace(/`([^`]+)`/g, '<code class="guide-inline-code">$1</code>');
  return parsed;
}

// Main Line-by-Line Markdown Parser
function parseMarkdownToHtml(md: string): string {
  if (!md) return '';
  
  const lines = md.split('\n');
  let html = '';
  let inList = false;
  let inTemplate = false;
  let templateLines: string[] = [];
  let checklistIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 1. Check for Template Delimiter
    if (line.trim() === '---') {
      if (inTemplate) {
        // End of Template Block
        const templateContent = templateLines.join('\n');
        const templateIndex = templates.value.length;
        templates.value.push(templateContent);

        html += `
          <div class="template-box animate-slide-up">
            <div class="template-header">
              <span class="template-title">📄 내용증명 자동 완성 서식</span>
              <button class="template-copy-btn" data-template-index="${templateIndex}">복사하기</button>
            </div>
            <pre class="template-body">${escapeHtml(templateContent)}</pre>
          </div>
        `;
        templateLines = [];
        inTemplate = false;
      } else {
        // Peek ahead to see if the block looks like a document template
        let looksLikeTemplate = false;
        for (let j = i + 1; j < Math.min(lines.length, i + 8); j++) {
          const l = lines[j];
          if (l.includes('수신인:') || l.includes('발신인:') || l.includes('제목:')) {
            looksLikeTemplate = true;
            break;
          }
        }
        if (looksLikeTemplate) {
          if (inList) { html += '</ul>'; inList = false; }
          inTemplate = true;
        } else {
          if (inList) { html += '</ul>'; inList = false; }
          html += '<hr class="guide-hr" />';
        }
      }
      continue;
    }

    // 2. Accumulate Template Lines if active
    if (inTemplate) {
      templateLines.push(line);
      continue;
    }

    // 3. Handle H3 headers: ## Header
    if (line.startsWith('## ')) {
      if (inList) { html += '</ul>'; inList = false; }
      const headerText = line.substring(3).trim();
      const parsedText = parseInlineMarkdown(headerText);
      html += `<h3 class="guide-h3">${parsedText}</h3>`;
      continue;
    }

    // 4. Handle Checklist item: - [ ]
    if (line.trim().startsWith('- [ ]') || line.trim().startsWith('- []')) {
      if (inList) { html += '</ul>'; inList = false; }
      const itemText = line.trim().replace(/^-\s*\[\s*\]\s*/, '').trim();
      const parsedText = parseInlineMarkdown(itemText);
      checklistIndex++;

      html += `
        <div class="guide-checklist-item animate-slide-up">
          <div class="checkbox-container">
            <input type="checkbox" id="chk-${checklistIndex}" class="guide-checkbox-input" />
            <label for="chk-${checklistIndex}" class="guide-checkbox-label">
              <span class="checkbox-custom"></span>
              <span class="checkbox-text">${parsedText}</span>
            </label>
          </div>
        </div>
      `;
      continue;
    }

    // 5. Handle Bullet List item: * or -
    const trimmedLine = line.trim();
    const isBullet = trimmedLine.startsWith('* ') || (trimmedLine.startsWith('- ') && !trimmedLine.startsWith('- [ ]') && !trimmedLine.startsWith('- []'));
    if (isBullet) {
      const indent = line.length - line.trimStart().length;
      const cleanText = trimmedLine.substring(2).trim();
      const parsedText = parseInlineMarkdown(cleanText);

      if (!inList) {
        html += '<ul class="guide-list">';
        inList = true;
      }
      html += `<li class="guide-list-item" style="margin-left: ${indent > 0 ? (indent * 8) + 'px' : '0'};">${parsedText}</li>`;
      continue;
    }

    // 6. Handle Empty Line
    if (trimmedLine === '') {
      if (inList) { html += '</ul>'; inList = false; }
      html += '<div class="guide-spacer"></div>';
      continue;
    }

    // 7. General Paragraph Text
    if (inList) { html += '</ul>'; inList = false; }
    const parsedText = parseInlineMarkdown(line);
    html += `<p class="guide-paragraph">${parsedText}</p>`;
  }

  if (inList) html += '</ul>';
  return html;
}

// Handle Delegated Clicks inside parsed HTML
function handleContainerClick(event: MouseEvent) {
  const target = event.target as HTMLElement;
  if (target && target.classList.contains('template-copy-btn')) {
    const indexAttr = target.getAttribute('data-template-index');
    if (indexAttr !== null) {
      const index = parseInt(indexAttr, 10);
      const text = templates.value[index];
      if (text) {
        navigator.clipboard.writeText(text);
        
        // Show brief visual feedback on button
        const originalText = target.innerText;
        target.innerText = '복사 완료! ✓';
        target.classList.add('copied');
        
        setTimeout(() => {
          target.innerText = originalText;
          target.classList.remove('copied');
        }, 2000);
      }
    }
  }
}
</script>

<style lang="scss">
/* Note: We use global scss styling block here to target HTML classes dynamically created in v-html */

.law-guide-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid var(--border-light);
  background: var(--bg-surface-glass);
  
  .guide-header {
    padding: 24px;
    border-bottom: 1px solid var(--border-light);
    background: rgba(255, 255, 255, 0.01);
    
    .meta-section {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
    }
    
    .guide-title {
      font-size: 1.6rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
      
      .sparkle-icon {
        background: linear-gradient(135deg, #fef08a, #facc15);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    }
    
    .guide-subtitle {
      font-size: 0.9rem;
      
      .keyword-text {
        color: var(--accent);
      }
    }

    /* User Query Box */
    .user-query-box {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border-light);
      border-left: 3.5px solid var(--accent);
      border-radius: 10px;
      padding: 12px 18px;
      margin-top: 16px;
      position: relative;
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      text-align: left;
      
      .query-quote-icon {
        font-size: 1.5rem;
        font-weight: 700;
        color: rgba(37, 99, 235, 0.4);
        line-height: 1;
        user-select: none;
        
        &.right {
          margin-left: auto;
        }
      }
      
      .query-text {
        font-size: 0.93rem;
        color: var(--text-secondary);
        line-height: 1.45;
        font-style: italic;
      }
      
      &.error-state {
        border-left-color: #ef4444;
        flex-direction: column;
        align-items: flex-start;
        gap: 6px;
        background: rgba(239, 68, 68, 0.02);
        border-color: rgba(239, 68, 68, 0.1);
        padding: 16px 20px;
        
        .query-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: #fca5a5;
          margin: 0;
          line-height: 1;
        }
        
        .query-text {
          font-size: 0.93rem;
          color: var(--text-primary);
          font-style: normal;
        }
      }
    }
  }
  
  /* Tabs Navigation Bar */
  .guide-tabs-nav {
    display: flex;
    background: rgba(0, 0, 0, 0.2);
    border-bottom: 1px solid var(--border-light);
    padding: 0 16px;
    gap: 8px;
    overflow-x: auto;
    scrollbar-width: none; /* Hide scrollbar for Firefox */
    
    &::-webkit-scrollbar {
      display: none; /* Hide scrollbar for Chrome/Safari */
    }
    
    .tab-nav-item {
      display: flex;
      align-items: center;
      gap: 8px;
      background: transparent;
      border: none;
      border-bottom: 2px solid transparent;
      color: var(--text-secondary);
      padding: 14px 12px;
      font-family: var(--font-sans);
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s ease;
      
      &:hover {
        color: var(--text-primary);
        background: rgba(255, 255, 255, 0.02);
      }
      
      &.active {
        color: var(--accent);
        border-bottom-color: var(--accent);
        background: rgba(37, 99, 235, 0.03);
      }
      
      .tab-icon {
        font-size: 1rem;
      }
      
      .tab-count {
        background: rgba(255, 255, 255, 0.08);
        color: var(--text-secondary);
        font-size: 0.75rem;
        padding: 1px 6px;
        border-radius: 10px;
        font-weight: 600;
      }
      
      &.active .tab-count {
        background: rgba(37, 99, 235, 0.15);
        color: var(--accent);
      }
    }
  }
  
  /* Content container */
  .guide-content-area {
    flex: 1;
    overflow: hidden;
    position: relative;
    background: rgba(0, 0, 0, 0.05);
    
    .tab-pane-content {
      height: 100%;
      overflow-y: auto;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
  }
  
  /* Markdown guide body styling */
  .guide-body-html {
    color: var(--text-primary);
    line-height: 1.7;
    font-size: 0.98rem;
    
    .guide-h3 {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-top: 28px;
      margin-bottom: 14px;
      padding-bottom: 6px;
      border-bottom: 1px solid var(--border-light);
      display: flex;
      align-items: center;
      gap: 6px;
    }
    
    .guide-paragraph {
      margin-bottom: 14px;
      color: var(--text-secondary);
      font-weight: 400;
      
      .guide-bold {
        color: var(--text-primary);
        font-weight: 600;
      }
    }
    
    .guide-spacer {
      height: 12px;
    }
    
    .guide-hr {
      border: none;
      height: 1px;
      background: var(--border-light);
      margin: 24px 0;
    }
    
    .guide-inline-code {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid var(--border-light);
      color: #93c5fd;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: var(--font-mono);
      font-size: 0.85rem;
    }
    
    .guide-list {
      margin-left: 20px;
      margin-bottom: 16px;
      list-style-type: square;
      display: flex;
      flex-direction: column;
      gap: 8px;
      
      .guide-list-item {
        color: var(--text-secondary);
        font-size: 0.93rem;
        
        .guide-bold {
          color: var(--text-primary);
          font-weight: 600;
        }
      }
    }
    
    /* Interactive Checklist Styles */
    .guide-checklist-item {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border-light);
      border-radius: 10px;
      padding: 14px 18px;
      margin-bottom: 10px;
      transition: all 0.2s ease;
      
      &:hover {
        background: rgba(255, 255, 255, 0.04);
        border-color: rgba(255, 255, 255, 0.12);
      }
      
      .checkbox-container {
        display: flex;
        position: relative;
        align-items: flex-start;
      }
      
      .guide-checkbox-input {
        position: absolute;
        opacity: 0;
        cursor: pointer;
        height: 0;
        width: 0;
        
        // Checklist interactivity: when checked, cross out and dim the label text
        &:checked ~ .guide-checkbox-label {
          .checkbox-text {
            text-decoration: line-through;
            color: var(--text-muted);
            opacity: 0.7;
          }
          
          .checkbox-custom {
            background-color: var(--accent);
            border-color: var(--accent);
            box-shadow: 0 0 8px var(--accent-glow);
            
            &::after {
              display: block;
            }
          }
        }
      }
      
      .guide-checkbox-label {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        cursor: pointer;
        width: 100%;
        user-select: none;
        
        .checkbox-custom {
          width: 18px;
          height: 18px;
          border: 1.5px solid var(--text-muted);
          border-radius: 4px;
          display: inline-block;
          flex-shrink: 0;
          position: relative;
          margin-top: 2px;
          transition: all 0.2s ease;
          
          &::after {
            content: '';
            position: absolute;
            display: none;
            left: 5px;
            top: 2px;
            width: 4px;
            height: 7px;
            border: solid white;
            border-width: 0 2px 2px 0;
            transform: rotate(45deg);
          }
        }
        
        .checkbox-text {
          font-size: 0.95rem;
          color: var(--text-primary);
          line-height: 1.4;
          transition: all 0.2s ease;
          
          .guide-bold {
            font-weight: 600;
          }
        }
      }
    }
    
    /* Auto-document Template Styles */
    .template-box {
      margin: 20px 0;
      border: 1px solid var(--border-light);
      border-radius: 12px;
      overflow: hidden;
      background: rgba(0, 0, 0, 0.4);
      
      .template-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: rgba(255, 255, 255, 0.03);
        padding: 12px 18px;
        border-bottom: 1px solid var(--border-light);
        
        .template-title {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
        }
        
        .template-copy-btn {
          background: var(--accent);
          color: #fff;
          border: none;
          padding: 6px 14px;
          font-size: 0.8rem;
          font-weight: 600;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: var(--font-sans);
          
          &:hover {
            background: var(--accent-hover);
            box-shadow: 0 0 10px var(--accent-glow);
          }
          
          &.copied {
            background: #10b981;
          }
        }
      }
      
      .template-body {
        padding: 18px;
        font-family: var(--font-mono);
        font-size: 0.85rem;
        line-height: 1.65;
        color: var(--text-secondary);
        white-space: pre-wrap;
        max-height: 380px;
        overflow-y: auto;
        
        &::-webkit-scrollbar {
          width: 5px;
        }
      }
    }
  }

  /* References tab styling */
  .reference-cards-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    
    .reference-card {
      background: var(--bg-card);
      border: 1px solid var(--border-light);
      border-radius: 10px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      position: relative;
      
      .ref-card-header {
        display: flex;
        align-items: center;
        gap: 10px;
        
        .ref-badge {
          font-size: 0.7rem;
          padding: 2px 8px;
          border-radius: 12px;
          font-weight: 600;
          text-transform: uppercase;
          
          &.badge-purple {
            background: rgba(147, 51, 234, 0.1);
            color: #c084fc;
            border: 1px solid rgba(147, 51, 234, 0.2);
          }
          
          &.badge-orange {
            background: rgba(234, 88, 12, 0.1);
            color: #fb923c;
            border: 1px solid rgba(234, 88, 12, 0.2);
          }
        }
        
        .ref-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-primary);
        }
      }
      
      .ref-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
        font-size: 0.8rem;
        
        .meta-dot {
          opacity: 0.3;
        }
      }
      
      .ref-body {
        .ref-content-text {
          font-size: 0.9rem;
          line-height: 1.6;
          color: var(--text-secondary);
          white-space: pre-wrap;
          border-left: 3.5px solid var(--border-light);
          padding-left: 14px;
        }
      }
      
      .ref-footer {
        display: flex;
        justify-content: flex-end;
        border-top: 1px solid var(--border-light);
        padding-top: 12px;
        
        .ref-link-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: var(--accent);
          text-decoration: none;
          font-size: 0.8rem;
          font-weight: 600;
          transition: all 0.2s ease;
          
          &:hover {
            color: var(--text-primary);
            
            .external-icon {
              transform: translate(1px, -1px);
            }
          }
          
          .external-icon {
            width: 14px;
            height: 14px;
            transition: transform 0.2s ease;
          }
        }
      }
    }
  }
  
  .empty-reference-state {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 60px 20px;
    border: 1px dashed var(--border-light);
    border-radius: 10px;
    font-size: 0.9rem;
  }

  /* Domain Error State Styles */
  .domain-error-view {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    max-width: 540px;
    margin: 0 auto;
    padding: 60px 24px;
    text-align: center;
    gap: 24px;
    
    .error-shield-wrapper {
      width: 72px;
      height: 72px;
      background: rgba(239, 68, 68, 0.06);
      border: 1px solid rgba(239, 68, 68, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ef4444;
      box-shadow: 0 0 15px rgba(239, 68, 68, 0.1);
      
      .error-shield-svg {
        width: 32px;
        height: 32px;
      }
    }
    
    .error-title {
      font-size: 1.4rem;
      font-weight: 800;
      color: var(--text-primary);
      letter-spacing: -0.01em;
    }
    
    .error-msg {
      font-size: 0.98rem;
      line-height: 1.6;
      color: #fca5a5;
      background: rgba(239, 68, 68, 0.04);
      border: 1px solid rgba(239, 68, 68, 0.1);
      padding: 14px 20px;
      border-radius: 10px;
      width: 100%;
      font-weight: 500;
    }
    
    .error-guideline-box {
      width: 100%;
      background: rgba(255, 255, 255, 0.01);
      border: 1px solid var(--border-light);
      padding: 20px;
      border-radius: 12px;
      text-align: left;
      
      .guideline-title {
        font-size: 0.9rem;
        font-weight: 700;
        margin-bottom: 12px;
        color: var(--text-primary);
      }
      
      .guideline-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
        list-style: none;
        
        li {
          font-size: 0.85rem;
          color: var(--text-secondary);
          display: flex;
          gap: 6px;
          line-height: 1.4;
          
          strong {
            color: var(--text-primary);
            font-weight: 600;
            flex-shrink: 0;
          }
        }
      }
    }
    
    .retry-search-btn {
      background: var(--bg-card);
      border: 1px solid var(--border-light);
      color: var(--text-primary);
      padding: 10px 24px;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: var(--font-sans);
      
      &:hover {
        border-color: var(--accent);
        color: var(--accent);
        background: var(--bg-card-hover);
        box-shadow: 0 0 10px var(--accent-glow);
      }
    }
  }
}
</style>
