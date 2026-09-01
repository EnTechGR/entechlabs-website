document.addEventListener('DOMContentLoaded', () => {

  /*
   * ============================================================
   * EMAIL ADDRESS COPY
   * ============================================================
   */

  const emailElements = document.querySelectorAll('.ch-val');

  emailElements.forEach((el) => {

    if (el.href && el.href.startsWith('mailto:')) {

      el.addEventListener('click', async (e) => {

        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        const emailToCopy =
          el.href.replace('mailto:', '').trim();

        const originalEmail = el.textContent;

        if (el.dataset.copying === 'true') {
          return;
        }

        try {

          await navigator.clipboard.writeText(emailToCopy);

          el.dataset.copying = 'true';
          el.textContent = 'EMAIL COPIED TO CLIPBOARD';
          el.classList.add('copied');

          setTimeout(() => {

            el.textContent = originalEmail;
            el.classList.remove('copied');
            delete el.dataset.copying;

          }, 2000);

        } catch (err) {

          console.error('Copy failed:', err);

          el.textContent = 'FAILED TO COPY';

          setTimeout(() => {
            el.textContent = originalEmail;
          }, 2000);

        }

      }, true);

    }

  });


  /*
   * ============================================================
   * CONTACT FORM
   * ============================================================
   */

  const form = document.getElementById('contact-form');

  if (!form) {
    return;
  }


  const inquiryInput =
    document.getElementById('inquiry-type');

  const submitButton =
    document.getElementById('contact-submit');

  const statusElement =
    document.getElementById('contact-status');


  /*
   * ============================================================
   * INQUIRY TYPE CHIPS
   * ============================================================
   */

  const chips = form.querySelectorAll('.chip');

  chips.forEach((chip) => {

    chip.addEventListener('click', () => {

      chips.forEach((item) => {
        item.classList.remove('on');
      });

      chip.classList.add('on');

      inquiryInput.value =
        chip.dataset.value;

    });

  });


  /*
   * ============================================================
   * STATUS HELPER
   * ============================================================
   */

  function setStatus(message, type = '') {

    statusElement.textContent = message;

    statusElement.className =
      'contact-status';

    if (type) {
      statusElement.classList.add(type);
    }

  }


  /*
   * ============================================================
   * SUBMIT
   * ============================================================
   */

  form.addEventListener('submit', async (event) => {

    event.preventDefault();


    /*
     * Client-side validation
     */

    const name =
      document.getElementById('contact-name')
        .value.trim();

    const email =
      document.getElementById('contact-email')
        .value.trim();

    const message =
      document.getElementById('contact-message')
        .value.trim();

    const inquiryType =
      inquiryInput.value;

    const honeypot =
      document.getElementById('website')
        .value.trim();


    if (!name || !email || !message) {

      setStatus(
        'Please complete all required fields.',
        'error'
      );

      return;
    }


    /*
     * Honeypot
     *
     * A real user should never fill this field.
     */

    if (honeypot) {

      setStatus(
        'Unable to submit the form.',
        'error'
      );

      return;
    }


    /*
     * Get Turnstile token
     */

    const turnstileInput =
      form.querySelector(
        '[name="cf-turnstile-response"]'
      );

    const turnstileToken =
      turnstileInput
        ? turnstileInput.value
        : '';


    if (!turnstileToken) {

      setStatus(
        'Please complete the security verification.',
        'error'
      );

      return;
    }


    /*
     * Disable button while sending
     */

    submitButton.disabled = true;

    submitButton.textContent =
      'Sending...';

    setStatus('');


    try {

      const response = await fetch(
        'https://api.entechlabs.com/contact',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify({
            name,
            email,
            inquiry_type: inquiryType,
            message,
            website: honeypot,
            turnstile_token: turnstileToken
          })
        }
      );


      let result = {};

      try {
        result = await response.json();
      } catch {
        result = {};
      }


      if (!response.ok) {

        throw new Error(
          result.error ||
          'Unable to send your message.'
        );

      }


      /*
       * SUCCESS
       */

      setStatus(
        'Your message has been sent successfully. We will get back to you shortly.',
        'success'
      );


      form.reset();


      /*
       * Restore default inquiry type
       */

      inquiryInput.value =
        'Sales & Licensing';

      chips.forEach((chip) => {

        chip.classList.toggle(
          'on',
          chip.dataset.value ===
            'Sales & Licensing'
        );

      });


      /*
       * Reset Turnstile
       */

      if (
        window.turnstile &&
        typeof window.turnstile.reset === 'function'
      ) {

        window.turnstile.reset();

      }


    } catch (error) {

      console.error(
        'Contact form error:',
        error
      );


      setStatus(
        error.message ||
        'Unable to send your message. Please try again.',
        'error'
      );


      /*
       * Turnstile tokens are single-use.
       * Reset it after an unsuccessful attempt.
       */

      if (
        window.turnstile &&
        typeof window.turnstile.reset === 'function'
      ) {

        window.turnstile.reset();

      }


    } finally {

      submitButton.disabled = false;

      submitButton.textContent =
        'Submit Message';

    }

  });

});