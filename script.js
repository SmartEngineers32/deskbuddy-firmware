document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------
    // 1. Hero Virtual OLED Display Initialization
    // -------------------------------------------------------------
    const heroCanvas = document.getElementById('heroOledCanvas');
    if (heroCanvas && window.VirtualOLED) {
        new window.VirtualOLED(heroCanvas, 'interactive');
    }

    // -------------------------------------------------------------
    // 2. Smart Country Auto-Detection & Pricing Setup
    // -------------------------------------------------------------
    const currencySymbol = document.getElementById('currencySymbol');
    const priceAmount = document.getElementById('priceAmount');
    const buyBtnText = document.getElementById('buyBtnText');
    const smartBuyBtn = document.getElementById('smartBuyBtn');

    function applyCurrency(isIndia) {
        if (isIndia) {
            if (currencySymbol) currencySymbol.innerText = '₹';
            if (priceAmount) priceAmount.innerText = '79';
            if (buyBtnText) buyBtnText.innerHTML = 'Get Firmware — ₹79';
        } else {
            if (currencySymbol) currencySymbol.innerText = '$';
            if (priceAmount) priceAmount.innerText = '3';
            if (buyBtnText) buyBtnText.innerHTML = 'Get Firmware — $3 USD';
        }
    }

    // Fast initial check using system timezone & language
    const detectIsIndiaFast = () => {
        try {
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
            const isTzIndia = tz.includes('Kolkata') || tz.includes('Calcutta') || tz.includes('Asia/Kolkata');
            const isLangIndia = navigator.languages && navigator.languages.some(l => l.includes('IN') || l.includes('hi'));
            return isTzIndia || isLangIndia;
        } catch (e) {
            return true;
        }
    };

    // Apply fast initial guess
    applyCurrency(detectIsIndiaFast());

    // Precise live IP check (instantly detects VPNs, US, UK, and all foreign IPs)
    fetch('https://api.country.is')
        .then(response => response.json())
        .then(data => {
            if (data && data.country) {
                const isIndiaByIP = (data.country === 'IN');
                applyCurrency(isIndiaByIP);
            }
        })
        .catch(() => {
            // Silently fallback to system check
        });

    // -------------------------------------------------------------
    // 2. Official Payment Gateway Integration
    // -------------------------------------------------------------
    const TOPMATE_URL = "https://topmate.io/raunit_kumar14/2366129";

    if (smartBuyBtn) {
        smartBuyBtn.addEventListener('click', () => {
            // Opens Topmate (auto-detects UPI in India, Cards/Apple Pay internationally)
            window.open(TOPMATE_URL, '_blank');
        });
    }

    // Auto-fill license key if redirected back from checkout with ?key=...
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace('#install?', ''));
    const keyParam = urlParams.get('key') || hashParams.get('key');
    if (keyParam && licenseInput) {
        licenseInput.value = keyParam;
        setTimeout(() => {
            if (verifyBtn) verifyBtn.click();
        }, 400);
    }

    // -------------------------------------------------------------
    // 3. License Key Verification & Browser Flasher
    // -------------------------------------------------------------
    const verifyBtn = document.getElementById('verifyBtn');
    const licenseInput = document.getElementById('licenseKey');
    const statusMsg = document.getElementById('status-msg');
    const installContainer = document.getElementById('install-container');

    if (verifyBtn && licenseInput) {
        verifyBtn.addEventListener('click', async () => {
            const key = licenseInput.value.trim();

            if (key === '') {
                showError("Please enter a license key.");
                return;
            }

            // Button state
            const originalText = verifyBtn.innerText;
            verifyBtn.innerText = 'Verifying...';
            verifyBtn.disabled = true;

            try {
                // Simulated validation delay
                await new Promise(resolve => setTimeout(resolve, 800));

                // Accepts any valid key longer than 5 characters for demo
                if (key.length > 5) {
                    showSuccess();
                } else {
                    throw new Error("Invalid or Expired License Key");
                }
            } catch (error) {
                showError(error.message);
                verifyBtn.innerText = originalText;
                verifyBtn.disabled = false;
            }
        });
    }

    function showError(msg) {
        statusMsg.innerText = msg;
        statusMsg.className = 'status error';
        statusMsg.classList.remove('hidden');
    }

    function showSuccess() {
        statusMsg.classList.add('hidden');
        verifyBtn.classList.add('hidden');

        // Dynamically inject esp-web-tools script if not loaded
        if (!document.querySelector('script[src*="esp-web-tools"]')) {
            const script = document.createElement('script');
            script.type = 'module';
            script.src = 'https://unpkg.com/esp-web-tools@10/dist/web/install-button.js?module';
            document.head.appendChild(script);
        }

        // Inject the web installer element
        installContainer.innerHTML = '<esp-web-install-button manifest="./manifest.json"></esp-web-install-button>';
        
        const successMsg = document.createElement('p');
        successMsg.className = 'status';
        successMsg.style.color = '#10B981';
        successMsg.style.marginTop = '0.75rem';
        successMsg.innerText = '✓ Key verified! Click below to install firmware:';
        installContainer.insertBefore(successMsg, installContainer.firstChild);
    }

    // -------------------------------------------------------------
    // 4. Circuit Diagram Fullscreen Lightbox Modal
    // -------------------------------------------------------------
    const diagramModal = document.getElementById('diagramModal');
    const openDiagramModalBtn = document.getElementById('openDiagramModalBtn');
    const closeDiagramModalBtn = document.getElementById('closeDiagramModalBtn');
    const diagramModalBackdrop = document.getElementById('diagramModalBackdrop');
    const diagramFrame = document.getElementById('diagramFrame');

    function openDiagramModal() {
        if (diagramModal) {
            diagramModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeDiagramModal() {
        if (diagramModal) {
            diagramModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    if (openDiagramModalBtn) openDiagramModalBtn.addEventListener('click', openDiagramModal);
    if (diagramFrame) diagramFrame.addEventListener('click', openDiagramModal);
    if (closeDiagramModalBtn) closeDiagramModalBtn.addEventListener('click', closeDiagramModal);
    if (diagramModalBackdrop) diagramModalBackdrop.addEventListener('click', closeDiagramModal);

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeDiagramModal();
    });

    // -------------------------------------------------------------
    // 5. Ambient Floating Particles Canvas
    // -------------------------------------------------------------
    const pCanvas = document.getElementById('ambientParticlesCanvas');
    if (pCanvas) {
        const pCtx = pCanvas.getContext('2d');
        let pWidth = (pCanvas.width = window.innerWidth);
        let pHeight = (pCanvas.height = window.innerHeight);

        window.addEventListener('resize', () => {
            pWidth = pCanvas.width = window.innerWidth;
            pHeight = pCanvas.height = window.innerHeight;
        });

        const particles = Array.from({ length: 28 }, () => ({
            x: Math.random() * pWidth,
            y: Math.random() * pHeight,
            r: Math.random() * 1.6 + 0.6,
            dx: (Math.random() - 0.5) * 0.3,
            dy: (Math.random() - 0.5) * 0.3,
            alpha: Math.random() * 0.4 + 0.15,
            color: Math.random() > 0.5 ? '#3b82f6' : '#8b5cf6'
        }));

        function renderParticles() {
            if (document.hidden) {
                requestAnimationFrame(renderParticles);
                return;
            }
            pCtx.clearRect(0, 0, pWidth, pHeight);

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.x += p.dx;
                p.y += p.dy;

                if (p.x < 0) p.x = pWidth;
                else if (p.x > pWidth) p.x = 0;
                if (p.y < 0) p.y = pHeight;
                else if (p.y > pHeight) p.y = 0;

                pCtx.beginPath();
                pCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                pCtx.fillStyle = p.color;
                pCtx.globalAlpha = p.alpha;
                pCtx.fill();
            }
            pCtx.globalAlpha = 1.0;
            requestAnimationFrame(renderParticles);
        }

        renderParticles();
    }

    // -------------------------------------------------------------
    // 6. Interactive 3D Perspective Tilt (Desktop)
    // -------------------------------------------------------------
    if (window.matchMedia('(pointer: fine)').matches) {
        const tiltCards = document.querySelectorAll(
            '.installer-card, .features-included-card, .feature-detailed-card, .diagram-card, .connections-panel, .reel-card'
        );

        tiltCards.forEach(card => {
            card.classList.add('tilt-card');

            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = ((y - centerY) / centerY) * -4;
                const rotateY = ((x - centerX) / centerX) * 4;

                card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.008, 1.008, 1.008)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
            });
        });
    }
});
