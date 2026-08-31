/* ═══════════════════════════════════════════════
   ENTECH LABS — terminal.js
   ═══════════════════════════════════════════════ */

function initTerminal() {
  const termBody = document.getElementById('tb');
  if (!termBody) return;
  termBody.innerHTML = ''; // Prevent duplication on re-init

  const staticLines = [
    { text: 'entech-platform --init --cluster=production',   type: 'tcmd'  },
    { text: 'Verifying service mesh integrity...',           type: 'tcmt'  },
    { text: 'CLUSTER OPERATIONAL. Microservices: 100%',     type: 'tok'   },
    { text: 'entech-sec --scan --level=deep',               type: 'tcmd'  },
    { text: 'Analyzing zero-trust access protocols...',     type: 'tout'  },
    { text: 'Encryption status: AES-256 / Quantum-Ready',   type: 'tok'   },
  ];

  const dynamicLines = [
    { text: 'entech-telemetry --stream',                    type: 'tcmd'  },
    { text: 'Active instances: 1,024 | Latency: 4ms',        type: 'tcmt'  },
    { text: 'System Uptime: 99.999% | Drift: 0ms',           type: 'tok'   },
  ];

  let lineIndex = 0;
  let isInitial = true;

  function typeTerminal() {
    const lines = isInitial ? staticLines : dynamicLines;
    if (lineIndex >= lines.length) {
      lineIndex = 0;
      isInitial = false;
      setTimeout(typeTerminal, 3000);
      return;
    }

    const line = lines[lineIndex];

    if (line.type === 'tcmd') {
      const promptSpan = document.createElement('span');
      promptSpan.className = 'tprompt';
      promptSpan.textContent = 'admin@entech:~$ ';
      termBody.appendChild(promptSpan);

      const cmdSpan = document.createElement('span');
      cmdSpan.className = 'tcmd';
      termBody.appendChild(cmdSpan);

      let charIndex = 0;
      const typing = setInterval(() => {
        if (charIndex < line.text.length) {
          cmdSpan.textContent += line.text.charAt(charIndex++);
        } else {
          clearInterval(typing);
          termBody.appendChild(document.createElement('br'));
          lineIndex++;
          termBody.scrollTop = termBody.scrollHeight;
          setTimeout(typeTerminal, 600);
        }
      }, 40);
    } else {
      const span = document.createElement('span');
      span.className = line.type;
      span.textContent = line.text;
      termBody.appendChild(span);
      termBody.appendChild(document.createElement('br'));
      lineIndex++;
      termBody.scrollTop = termBody.scrollHeight;
      setTimeout(typeTerminal, 800);
    }
  }
  setTimeout(typeTerminal, 1000);
}