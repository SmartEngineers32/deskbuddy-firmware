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
    const priceOriginal = document.getElementById('priceOriginal');
    const buyBtnText = document.getElementById('buyBtnText');
    const smartBuyBtn = document.getElementById('smartBuyBtn');

    function applyCurrency(isIndia) {
        if (isIndia) {
            if (currencySymbol) currencySymbol.innerText = '₹';
            if (priceAmount) priceAmount.innerText = '79';
            if (priceOriginal) priceOriginal.innerText = '₹149';
            if (buyBtnText) buyBtnText.innerHTML = 'Get Firmware — ₹79';
        } else {
            if (currencySymbol) currencySymbol.innerText = '$';
            if (priceAmount) priceAmount.innerText = '3';
            if (priceOriginal) priceOriginal.innerText = '$6';
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

    // -------------------------------------------------------------
    // 3. Multi-Board Selection & License Key Browser Flasher
    // -------------------------------------------------------------
    const BOARD_CONFIGS = {
        'esp8266': {
            name: 'NodeMCU / D1 Mini',
            chipTag: 'ESP8266',
            manifest: './manifest.json',
            port: 'Micro-USB',
            badge: 'ESP8266 / NodeMCU',
            pins: [
                { name: 'sda', label: 'SDA', pin: 'D2 (GPIO4)' },
                { name: 'scl', label: 'SCL', pin: 'D1 (GPIO5)' },
                { name: 'touch', label: 'Touch', pin: 'D5 (GPIO14)' },
                { name: 'buzzer', label: 'Buzzer', pin: 'D6 (GPIO12)' }
            ]
        },
        'c3_supermini': {
            name: 'ESP32-C3 Super Mini',
            chipTag: 'ESP32-C3',
            manifest: './manifest_c3.json',
            port: 'USB Type-C',
            badge: 'ESP32-C3 Super Mini',
            pins: [
                { name: 'sda', label: 'SDA', pin: 'GPIO8' },
                { name: 'scl', label: 'SCL', pin: 'GPIO9' },
                { name: 'touch', label: 'Touch', pin: 'GPIO4' },
                { name: 'buzzer', label: 'Buzzer', pin: 'GPIO3' }
            ]
        },
        'xiao_c3': {
            name: 'Seeed Studio XIAO C3',
            chipTag: 'XIAO C3',
            manifest: './manifest_xiao_c3.json',
            port: 'USB Type-C',
            badge: 'Seeed XIAO ESP32-C3',
            pins: [
                { name: 'sda', label: 'SDA', pin: 'D4 (SDA)' },
                { name: 'scl', label: 'SCL', pin: 'D5 (SCL)' },
                { name: 'touch', label: 'Touch', pin: 'D2' },
                { name: 'buzzer', label: 'Buzzer', pin: 'D1' }
            ]
        },
        'xiao_s3': {
            name: 'Seeed Studio XIAO S3',
            chipTag: 'XIAO S3',
            manifest: './manifest_xiao_s3.json',
            port: 'USB Type-C',
            badge: 'Seeed XIAO ESP32-S3',
            pins: [
                { name: 'sda', label: 'SDA', pin: 'D4 (SDA)' },
                { name: 'scl', label: 'SCL', pin: 'D5 (SCL)' },
                { name: 'touch', label: 'Touch', pin: 'D1' },
                { name: 'buzzer', label: 'Buzzer', pin: 'D2' }
            ]
        },
        'esp32': {
            name: 'Classic ESP32 WROOM',
            chipTag: 'ESP32',
            manifest: './manifest_esp32.json',
            port: '30/38-Pin DevKit',
            badge: 'Standard ESP32 DevKit',
            pins: [
                { name: 'sda', label: 'SDA', pin: 'GPIO21' },
                { name: 'scl', label: 'SCL', pin: 'GPIO22' },
                { name: 'touch', label: 'Touch', pin: 'GPIO4' },
                { name: 'buzzer', label: 'Buzzer', pin: 'GPIO18' }
            ]
        },
        's3_devkit': {
            name: 'NodeMCU ESP32-S3 DevKit',
            chipTag: 'ESP32-S3',
            manifest: './manifest_s3.json',
            port: 'Dual USB Type-C',
            badge: 'NodeMCU ESP32-S3 DevKit',
            pins: [
                { name: 'sda', label: 'SDA', pin: 'GPIO8' },
                { name: 'scl', label: 'SCL', pin: 'GPIO9' },
                { name: 'touch', label: 'Touch', pin: 'GPIO4' },
                { name: 'buzzer', label: 'Buzzer', pin: 'GPIO5' }
            ]
        }
    };

    let currentSelectedBoard = 'esp8266';
    let isKeyVerified = false;

    const boardCards = document.querySelectorAll('.board-card');
    const boardPinBanner = document.getElementById('boardPinBanner');
    const pinPortInfo = document.getElementById('pinPortInfo');
    const pinDetailsText = document.getElementById('pinDetailsText');
    const activeDeviceTag = document.getElementById('activeDeviceTag');

    function updateBoardUI(boardKey) {
        const config = BOARD_CONFIGS[boardKey] || BOARD_CONFIGS['esp8266'];
        currentSelectedBoard = boardKey;

        // 1. Sync Active Card Glow
        boardCards.forEach(c => {
            if (c.getAttribute('data-board') === boardKey) {
                c.classList.add('active');
            } else {
                c.classList.remove('active');
            }
        });

        // 2. Hero Device Badge remains permanently fixed as "Supports 6+ ESP Boards" 

        // 3. Update Live Dynamic Pinout Preview Banner
        if (boardPinBanner) boardPinBanner.classList.add('switching');
        setTimeout(() => {
            if (pinPortInfo) {
                pinPortInfo.innerHTML = `Port: ${config.port}`;
            }

            if (pinDetailsText) {
                const pills = config.pins.map(p => `
                    <span class="pin-pill">
                        <span class="pin-pill-name ${p.name}">${p.label}</span>
                        <span class="pin-pill-val">${p.pin}</span>
                    </span>
                `).join('');
                pinDetailsText.innerHTML = `<div class="pin-tokens-row">${pills}</div>`;
            }

            if (window.feather) feather.replace();
            if (boardPinBanner) boardPinBanner.classList.remove('switching');
        }, 120);

        // 4. If license key already verified, refresh web installer manifest
        if (isKeyVerified) {
            renderWebInstaller();
        }
    }

    // Attach click listeners to all 5 board cards
    boardCards.forEach(card => {
        card.addEventListener('click', () => {
            const boardKey = card.getAttribute('data-board');
            if (!boardKey || boardKey === currentSelectedBoard) return;
            updateBoardUI(boardKey);
        });
    });

    // License Key Verification Elements
    const verifyBtn = document.getElementById('verifyBtn');
    const licenseInput = document.getElementById('licenseKey');
    const statusMsg = document.getElementById('status-msg');
    const installContainer = document.getElementById('install-container');

    const VALID_LICENSE_KEYS = [
        'DB01-8F29-41A7',
        'DB018F2941A7'
    ];

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

    if (verifyBtn && licenseInput) {
        verifyBtn.addEventListener('click', async () => {
            const rawKey = licenseInput.value.trim().toUpperCase();

            if (rawKey === '') {
                showError("Please enter your license key.");
                return;
            }

            const originalText = verifyBtn.innerText;
            verifyBtn.innerText = 'Verifying...';
            verifyBtn.disabled = true;

            try {
                await new Promise(resolve => setTimeout(resolve, 700));

                const cleanKey = rawKey.replace(/[^A-Z0-9]/g, '');
                const isValid = VALID_LICENSE_KEYS.some(k => k.replace(/[^A-Z0-9]/g, '') === cleanKey);

                if (isValid) {
                    showSuccess();
                } else {
                    throw new Error("Invalid License Key. Please check the key in your Topmate order.");
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
        isKeyVerified = true;
        statusMsg.classList.add('hidden');
        verifyBtn.classList.add('hidden');

        // Dynamically inject esp-web-tools script if not loaded
        if (!document.querySelector('script[src*="esp-web-tools"]')) {
            const script = document.createElement('script');
            script.type = 'module';
            script.src = 'https://unpkg.com/esp-web-tools@10/dist/web/install-button.js?module';
            document.head.appendChild(script);
        }

        renderWebInstaller();
    }

    function renderWebInstaller() {
        const config = BOARD_CONFIGS[currentSelectedBoard] || BOARD_CONFIGS['esp8266'];
        installContainer.innerHTML = `
            <div class="installer-ready-card">
                <div class="ready-badge-row">
                    <span class="ready-status-dot"></span>
                    <span class="ready-board-title">Ready for <strong>${config.name}</strong></span>
                </div>
                <esp-web-install-button manifest="${config.manifest}"></esp-web-install-button>
                <p class="ready-subtext">Connect via ${config.port} cable &bull; Click to flash</p>
            </div>
        `;
        if (window.feather) feather.replace();
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
            '.installer-card, .features-included-card, .feature-detailed-card, .diagram-card, .reel-card'
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
