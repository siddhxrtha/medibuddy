// Community Hub JavaScript
document.addEventListener('DOMContentLoaded', async () => {
  // Load user info
  try {
    const res = await fetch('/api/auth/me');
    if (res.ok) {
      const data = await res.json();
      document.getElementById('navUserName').textContent = data.user.name;
      const avatar = data.user.name.charAt(0).toUpperCase();
      document.getElementById('userAvatar').textContent = avatar;
    } else {
      window.location.href = '/login.html';
    }
  } catch (err) {
    console.error('Failed to load user', err);
    window.location.href = '/login.html';
  }

  // Hamburger menu toggle
  const hamburger = document.getElementById('hamburger');
  const navContent = document.getElementById('navContent');
  if (hamburger && navContent) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navContent.classList.toggle('active');
    });
  }

  // Logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = '/login.html';
      } catch (err) {
        console.error('Logout error', err);
      }
    });
  }

  // Category filtering
  const categoryTabs = document.querySelectorAll('.category-tab');
  const communityPosts = document.querySelectorAll('.community-post');

  categoryTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Update active tab
      categoryTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const category = tab.dataset.category;

      // Filter posts
      communityPosts.forEach(post => {
        if (category === 'all') {
          post.style.display = 'block';
        } else {
          if (post.dataset.category === category) {
            post.style.display = 'block';
          } else {
            post.style.display = 'none';
          }
        }
      });
    });
  });

  // Like/Heart functionality
  const postActions = document.querySelectorAll('.post-action');
  postActions.forEach(action => {
    action.addEventListener('click', function(e) {
      if (this.innerHTML.includes('bi-heart')) {
        const icon = this.querySelector('i');
        if (icon.classList.contains('bi-heart')) {
          icon.classList.remove('bi-heart');
          icon.classList.add('bi-heart-fill');
          this.style.color = '#fc8181';
          // Increment count
          const countText = this.textContent.trim();
          const count = parseInt(countText.match(/\d+/)[0]);
          this.innerHTML = `<i class="bi bi-heart-fill"></i> ${count + 1}`;
        } else {
          icon.classList.remove('bi-heart-fill');
          icon.classList.add('bi-heart');
          this.style.color = '';
          // Decrement count
          const countText = this.textContent.trim();
          const count = parseInt(countText.match(/\d+/)[0]);
          this.innerHTML = `<i class="bi bi-heart"></i> ${count - 1}`;
        }
      }
    });
  });

  // New Post Modal
  const submitPostBtn = document.getElementById('submitPost');
  if (submitPostBtn) {
    submitPostBtn.addEventListener('click', async () => {
      const category = document.getElementById('postCategory').value;
      const title = document.getElementById('postTitle').value;
      const content = document.getElementById('postContent').value;
      const anonymous = document.getElementById('postAnonymous').checked;

      if (!category || !title || !content) {
        alert('Please fill in all required fields');
        return;
      }

      // Get user info for display
      const userRes = await fetch('/api/auth/me');
      const userData = await userRes.json();
      const userName = anonymous ? 'Anonymous' : userData.user.name;
      const userInitial = anonymous ? '?' : userData.user.name.charAt(0).toUpperCase();

      // Create badge class based on category
      let badgeClass = 'badge-experiences';
      let badgeText = 'Experience';
      if (category === 'tips') {
        badgeClass = 'badge-tips';
        badgeText = 'Tips & Advice';
      } else if (category === 'support') {
        badgeClass = 'badge-support';
        badgeText = 'Need Support';
      } else if (category === 'meals') {
        badgeClass = 'badge-meals';
        badgeText = 'Meal Ideas';
      }

      // Create new post element
      const newPost = document.createElement('div');
      newPost.className = 'community-post';
      newPost.dataset.category = category;
      newPost.innerHTML = `
        <div class="post-header">
          <div class="d-flex align-items-center">
            <div class="post-avatar">${userInitial}</div>
            <div>
              <h6 class="mb-0 fw-bold">${userName}</h6>
              <small class="text-muted">Just now • Singapore</small>
            </div>
          </div>
          <span class="post-badge ${badgeClass}">${badgeText}</span>
        </div>
        <div class="post-content">
          <h5 class="mb-2">${title}</h5>
          <p>${content.replace(/\n/g, '<br>')}</p>
        </div>
        <div class="post-footer">
          <button class="post-action"><i class="bi bi-heart"></i> 0</button>
          <button class="post-action"><i class="bi bi-chat"></i> 0 Comments</button>
          <button class="post-action"><i class="bi bi-share"></i> Share</button>
        </div>
      `;

      // Add to feed
      const feed = document.getElementById('communityFeed');
      feed.insertBefore(newPost, feed.firstChild);

      // Re-attach event listeners to new post
      const newActions = newPost.querySelectorAll('.post-action');
      newActions.forEach(action => {
        action.addEventListener('click', function() {
          if (this.innerHTML.includes('bi-heart')) {
            const icon = this.querySelector('i');
            if (icon.classList.contains('bi-heart')) {
              icon.classList.remove('bi-heart');
              icon.classList.add('bi-heart-fill');
              this.style.color = '#fc8181';
              this.innerHTML = '<i class="bi bi-heart-fill"></i> 1';
            } else {
              icon.classList.remove('bi-heart-fill');
              icon.classList.add('bi-heart');
              this.style.color = '';
              this.innerHTML = '<i class="bi bi-heart"></i> 0';
            }
          }
        });
      });

      // Close modal and reset form
      const modal = bootstrap.Modal.getInstance(document.getElementById('newPostModal'));
      modal.hide();
      document.getElementById('newPostForm').reset();

      // Show success message
      alert('Your post has been shared with the community! 🎉');
    });
  }

  // AI Modal functionality
  const aiFloatingBtn = document.getElementById('aiFloatingBtn');
  const aiModalOverlay = document.getElementById('aiModalOverlay');
  const aiModalContainer = document.getElementById('aiModalContainer');
  const closeAiModal = document.getElementById('closeAiModal');
  const aiSendBtn = document.getElementById('aiSendBtn');
  const aiInput = document.getElementById('aiInput');
  const aiChatMessages = document.getElementById('aiChatMessages');
  const openAiFromCommunity = document.getElementById('openAiFromCommunity');

  function openAiChat() {
    aiModalOverlay.classList.add('active');
    aiModalContainer.classList.add('active');
    aiInput.focus();
  }

  function closeAiChat() {
    aiModalOverlay.classList.remove('active');
    aiModalContainer.classList.remove('active');
  }

  if (aiFloatingBtn) aiFloatingBtn.addEventListener('click', openAiChat);
  if (openAiFromCommunity) openAiFromCommunity.addEventListener('click', openAiChat);
  if (closeAiModal) closeAiModal.addEventListener('click', closeAiChat);
  if (aiModalOverlay) aiModalOverlay.addEventListener('click', closeAiChat);

  // Auto-resize textarea
  if (aiInput) {
    aiInput.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });

    // Send on Enter (Shift+Enter for new line)
    aiInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        aiSendBtn.click();
      }
    });
  }

  // Send AI message
  async function sendAiMessage() {
    const message = aiInput.value.trim();
    if (!message) return;

    // Add user message to chat
    const userMsgDiv = document.createElement('div');
    userMsgDiv.className = 'user-message';
    userMsgDiv.innerHTML = `
      <div class="user-bubble">
        <p>${message}</p>
      </div>
    `;
    aiChatMessages.appendChild(userMsgDiv);

    // Clear input
    aiInput.value = '';
    aiInput.style.height = 'auto';

    // Scroll to bottom
    aiChatMessages.scrollTop = aiChatMessages.scrollHeight;

    // Show typing indicator
    const typingDiv = document.createElement('div');
    typingDiv.className = 'ai-message typing-indicator';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = `
      <div class="ai-avatar">✨</div>
      <div class="ai-bubble">
        <div class="typing-dots">
          <span></span><span></span><span></span>
        </div>
      </div>
    `;
    aiChatMessages.appendChild(typingDiv);
    aiChatMessages.scrollTop = aiChatMessages.scrollHeight;

    try {
      // Call AI API
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });

      const data = await response.json();

      // Remove typing indicator
      const indicator = document.getElementById('typingIndicator');
      if (indicator) indicator.remove();

      // Add AI response with typewriter effect
      const aiMsgDiv = document.createElement('div');
      aiMsgDiv.className = 'ai-message';
      aiMsgDiv.innerHTML = `
        <div class="ai-avatar">✨</div>
        <div class="ai-bubble">
          <p id="typewriterText"></p>
        </div>
      `;
      aiChatMessages.appendChild(aiMsgDiv);
      aiChatMessages.scrollTop = aiChatMessages.scrollHeight;

      // Typewriter effect
      const textElement = document.getElementById('typewriterText');
      const text = data.response || 'Sorry, I encountered an error. Please try again.';
      let index = 0;
      
      function typeWriter() {
        if (index < text.length) {
          textElement.textContent += text.charAt(index);
          index++;
          aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
          setTimeout(typeWriter, 15);
        } else {
          textElement.removeAttribute('id');
        }
      }
      typeWriter();

    } catch (error) {
      console.error('AI chat error:', error);
      
      // Remove typing indicator
      const indicator = document.getElementById('typingIndicator');
      if (indicator) indicator.remove();

      // Show error message
      const errorDiv = document.createElement('div');
      errorDiv.className = 'ai-message';
      errorDiv.innerHTML = `
        <div class="ai-avatar">✨</div>
        <div class="ai-bubble">
          <p>Sorry, I'm having trouble connecting right now. Please make sure Ollama is running and try again.</p>
        </div>
      `;
      aiChatMessages.appendChild(errorDiv);
      aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
    }
  }

  if (aiSendBtn) {
    aiSendBtn.addEventListener('click', sendAiMessage);
  }
});
