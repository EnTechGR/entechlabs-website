document.addEventListener('DOMContentLoaded', () => {
  const emailElements = document.querySelectorAll('.ch-val');

  emailElements.forEach((el) => {
    // Target mailto links or elements containing email addresses
    if (el.href && el.href.startsWith('mailto:')) {
      el.addEventListener('click', async (e) => {
        // Stop default mailto action and prevent other global template scripts from triggering
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        // Extract clean email address without 'mailto:'
        const emailToCopy = el.href.replace('mailto:', '').trim();
        const originalEmail = el.textContent;

        // Prevent double trigger during active timeout
        if (el.dataset.copying === 'true') return;

        try {
          await navigator.clipboard.writeText(emailToCopy);

          // Force state update immediately
          el.dataset.copying = 'true';
          el.textContent = 'EMAIL COPIED TO CLIPBOARD';
          el.classList.add('copied');

          // Revert back to the email address after 2 seconds
          setTimeout(() => {
            el.textContent = originalEmail;
            el.classList.remove('copied');
            delete el.dataset.copying;
          }, 2000);

        } catch (err) {
          console.error('Copy failed: ', err);
          el.textContent = 'FAILED TO COPY';
          setTimeout(() => {
            el.textContent = originalEmail;
          }, 2000);
        }
      }, true); // Use capture phase to intercept before parent listeners
    }
  });
});