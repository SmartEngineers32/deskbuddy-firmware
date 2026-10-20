/**
 * Virtual OLED Animation Engine for 128x64 Displays
 * Parametric eye graphics and character vignettes
 */

// Global configuration
const OLED_CONFIG = {
    color: '#00e5ff',       // Classic OLED cyan
    glow: true,
    speed: 1.0
};

class VirtualOLED {
    constructor(canvas, animType = 'idle') {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.animType = animType;
        this.isRunning = true;
        this.startTime = performance.now();
        this.lastTime = performance.now();
        
        // Internal 128x64 resolution
        this.W = 128;
        this.H = 64;
        this.canvas.width = this.W;
        this.canvas.height = this.H;

        // Character display geometry constants
        this.RE_LCX = 32;
        this.RE_RCX = 96;
        this.RE_ECY = 32;
        this.RE_EW = 42;
        this.RE_EH = 38;
        this.RE_ER = 10;
        this.RE_PR = 10;
        this.RE_LEX = this.RE_LCX - Math.floor(this.RE_EW / 2);
        this.RE_REX = this.RE_RCX - Math.floor(this.RE_EW / 2);
        this.RE_EEY = this.RE_ECY - Math.floor(this.RE_EH / 2);

        // Interactive mouse tracking
        this.mouseX = 64;
        this.mouseY = 32;
        this.isHovered = false;
        this.setupMouseEvents();

        // State for animations
        this.state = {};
        this.initState();

        // Start render loop
        this.loop = this.loop.bind(this);
        requestAnimationFrame(this.loop);
    }

    setupMouseEvents() {
        const rectTarget = this.canvas.parentElement || this.canvas;
        rectTarget.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = ((e.clientX - rect.left) / rect.width) * this.W;
            this.mouseY = ((e.clientY - rect.top) / rect.height) * this.H;
            this.isHovered = true;
        });
        rectTarget.addEventListener('mouseleave', () => {
            this.isHovered = false;
        });

        // Dedicated Long Touch vs Short Tap Detection
        let touchTimer = null;
        let isLongTouch = false;

        const startTouch = () => {
            isLongTouch = false;
            touchTimer = setTimeout(() => {
                isLongTouch = true;
                this.onLongTouch();
            }, 350); // 350ms triggers dedicated long touch (petting)
        };

        const endTouch = () => {
            clearTimeout(touchTimer);
            if (!isLongTouch) {
                this.onShortTap();
            }
        };

        rectTarget.addEventListener('mousedown', startTouch);
        rectTarget.addEventListener('mouseup', endTouch);
        rectTarget.addEventListener('touchstart', (e) => { startTouch(); }, { passive: true });
        rectTarget.addEventListener('touchend', endTouch);
    }

    onShortTap() {
        if (this.animType === 'interactive') {
            this.state.shortTapTime = performance.now();
        } else {
            this.startTime = performance.now();
            this.initState();
        }
    }

    onLongTouch() {
        if (this.animType === 'interactive') {
            this.state.longTouchTime = performance.now();
        } else {
            this.startTime = performance.now();
            this.initState();
        }
    }

    onTap() {
        this.onShortTap();
    }

    initState() {
        this.state = {
            blinkProgress: 0,
            nextBlink: performance.now() + 2000 + Math.random() * 2500,
            isBlinking: false,
            pupilX: 0,
            pupilY: 0,
            targetPupilX: 0,
            targetPupilY: 0,
            nextLookTime: performance.now() + 1500,
            tapReactionTime: 0,
            shortTapTime: 0,
            longTouchTime: 0,
            pupilX: 0,
            pupilY: 0,
            targetPupilX: 0,
            targetPupilY: 0,
            nextLookTime: performance.now() + 1500,
            tapReactionTime: 0,
            // Vignette specific
            ballX: 64, ballY: 48, bvx: 2.5, bvy: 1.2, padL: 45, padR: 45,
            dinoX: -22,
            snakeHeadX: -25,
            barbellY: 55,
            rainDrops: Array.from({length: 10}, () => ({ x: Math.random() * 128, y: Math.random() * 64 - 20 })),
            dizzyAngle: 0,
            ninjaMaskY: -20,
            sleepBreath: 0,
            jugglerBall: 0,
            musicBeat: 0
        };
    }

    setColor(colorHex) {
        OLED_CONFIG.color = colorHex;
    }

    clear() {
        this.ctx.fillStyle = '#05070a'; // Deep OLED true-black
        this.ctx.fillRect(0, 0, this.W, this.H);
    }

    fillRoundRect(x, y, w, h, r, color = OLED_CONFIG.color) {
        if (w <= 0 || h <= 0) return;
        r = Math.min(r, Math.floor(w / 2), Math.floor(h / 2));
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(x + r, y);
        this.ctx.arcTo(x + w, y, x + w, y + h, r);
        this.ctx.arcTo(x + w, y + h, x, y + h, r);
        this.ctx.arcTo(x, y + h, x, y, r);
        this.ctx.arcTo(x, y, x + w, y, r);
        this.ctx.closePath();
        this.ctx.fill();
    }

    fillCircle(cx, cy, r, color = OLED_CONFIG.color) {
        if (r <= 0) return;
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, r, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawFastHLine(x, y, w, color = OLED_CONFIG.color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), 1);
    }

    drawFastVLine(x, y, h, color = OLED_CONFIG.color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(Math.floor(x), Math.floor(y), 1, Math.floor(h));
    }

    drawSmile(cx, cy, mw = 8, mh = 4, color = OLED_CONFIG.color) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.moveTo(cx - mw, cy);
        this.ctx.lineTo(cx - mw / 2, cy + mh);
        this.ctx.lineTo(cx + mw / 2, cy + mh);
        this.ctx.lineTo(cx + mw, cy);
        this.ctx.stroke();
    }

    drawHeartEye(cx, eyeY, eyeH, color = OLED_CONFIG.color) {
        const w = Math.floor((this.RE_EW * 3) / 5);
        const h = Math.floor((eyeH * 3) / 5);
        const bumpR = Math.floor(w / 4) + 1;
        const yOffset = Math.floor((eyeH - h) / 2) + 2;
        const bumpCY = eyeY + yOffset + bumpR;

        this.fillCircle(cx - bumpR, bumpCY, bumpR, color);
        this.fillCircle(cx + bumpR, bumpCY, bumpR, color);

        const peakY = eyeY + yOffset + h;
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(cx - w / 2, bumpCY);
        this.ctx.lineTo(cx + w / 2, bumpCY);
        this.ctx.lineTo(cx, peakY);
        this.ctx.closePath();
        this.ctx.fill();
    }

    drawOneEye(cx, lx, ly, topCut, botCut, pupR, offY = 0, eyeW = 0, xEye = false, heart = false) {
        const w = (eyeW > 0) ? eyeW : this.RE_EW;
        const ex = cx - Math.floor(w / 2);
        const y = this.RE_EEY + topCut + offY;
        const h = this.RE_EH - topCut - botCut;
        if (h < 2) return;

        if (heart) {
            this.drawHeartEye(cx, y, h);
            return;
        }

        // Draw outer eye body (rounded rect)
        this.fillRoundRect(ex, y, w, h, this.RE_ER, OLED_CONFIG.color);

        // Show pupil if eye is sufficiently open (> 50% height)
        const showPupil = (h > (this.RE_EH * 0.45));
        if (showPupil) {
            const minPx = ex + pupR + 1;
            const maxPx = ex + w - pupR - 1;
            const minPy = y + pupR + 1;
            const maxPy = y + h - pupR - 1;

            const px = Math.max(minPx, Math.min(maxPx, cx + lx));
            const py = Math.max(minPy, Math.min(maxPy, this.RE_ECY + offY + ly));

            if (xEye) {
                this.fillCircle(px, py, pupR, '#05070a');
                const xs = pupR - 2;
                this.ctx.strokeStyle = OLED_CONFIG.color;
                this.ctx.lineWidth = 1.5;
                this.ctx.beginPath();
                this.ctx.moveTo(px - xs, py - xs); this.ctx.lineTo(px + xs, py + xs);
                this.ctx.moveTo(px + xs, py - xs); this.ctx.lineTo(px - xs, py + xs);
                this.ctx.stroke();
            } else {
                // OLED True Black pupil
                this.fillCircle(px, py, pupR, '#05070a');
                // Cute white highlight reflection!
                this.fillCircle(px - 3, py - 3, 2, OLED_CONFIG.color);
            }
        }
    }

    drawStandardPair(lx, ly, rx, ry, topCut = 0, botCut = 0, pupR = this.RE_PR, offY = 0, eyeW = 0) {
        this.drawOneEye(this.RE_LCX, lx, ly, topCut, botCut, pupR, offY, eyeW);
        this.drawOneEye(this.RE_RCX, rx, ry, topCut, botCut, pupR, offY, eyeW);
    }

    // ── ISOLATED DEFAULT EYE RENDERER (Used ONLY for Default Eye / Interactive Screen) ──

    drawMochiDefaultEye(cx, lx, ly, blinkCut) {
        const circR = 19;
        const ccy = 26;
        const pupR = 12;

        this.fillCircle(cx, ccy, circR, OLED_CONFIG.color);

        if (blinkCut > 0) {
            this.ctx.fillStyle = '#05070a';
            this.ctx.fillRect(cx - circR - 2, ccy - circR - 2, circR * 2 + 4, blinkCut + 2);
        }

        if (blinkCut < 22) {
            const minPx = cx - circR + pupR + 2;
            const maxPx = cx + circR - pupR - 2;
            const minPy = ccy - circR + pupR + 2;
            const maxPy = ccy + circR - pupR - 2;

            const px = Math.max(minPx, Math.min(maxPx, Math.floor(cx + lx)));
            const py = Math.max(minPy, Math.min(maxPy, Math.floor(ccy + ly)));

            this.fillCircle(px, py, pupR, '#05070a');
            this.fillCircle(px - 3, py - 3, 2, OLED_CONFIG.color);
        }
    }

    drawMochiDefaultSmile(cx = 64, cy = 44, smileR = 8) {
        this.ctx.fillStyle = OLED_CONFIG.color;
        const smileY = cy - 2;
        for (let x = cx - smileR + 1; x < cx + smileR; x++) {
            const dx = x - cx;
            const dy = Math.sqrt(smileR * smileR - dx * dx);
            const py = Math.floor(smileY + dy);
            if (py >= cy) {
                this.ctx.fillRect(x, py, 1, 2);
            }
        }
    }

    // ── ANIMATION RENDERERS ──

    renderInteractive(now) {
        // Natural blink calculation with smooth timing
        let blinkCut = 0;
        if (!this.state.isBlinking && now > this.state.nextBlink) {
            this.state.isBlinking = true;
            this.state.blinkStart = now;
        }
        if (this.state.isBlinking) {
            const bElapsed = now - this.state.blinkStart;
            if (bElapsed < 110) {
                blinkCut = Math.floor((bElapsed / 110) * (this.RE_EH - 2));
            } else if (bElapsed < 210) {
                blinkCut = Math.floor((1 - (bElapsed - 110) / 100) * (this.RE_EH - 2));
            } else {
                this.state.isBlinking = false;
                this.state.nextBlink = now + 2400 + Math.random() * 2800;
            }
        }

        // 1. Long Touch (Petting / Cuddle) Reaction
        if (now - this.state.longTouchTime < 2400) {
            this.renderPetting(now, this.state.longTouchTime);
            return;
        }

        // 2. Short Tap Reaction (Playful Wink + Hop)
        if (now - this.state.shortTapTime < 1200) {
            const elapsed = now - this.state.shortTapTime;
            const hop = Math.sin((elapsed / 1200) * Math.PI) * 6;
            this.drawMochiDefaultEye(this.RE_LCX, 0, -hop, 0);
            const ry = 26 - hop;
            this.fillRoundRect(this.RE_RCX - 16, ry - 2, 32, 4, 2, OLED_CONFIG.color);
            this.drawMochiDefaultSmile(64, 44 - hop);
            return;
        }

        // 3. Fallback tap reaction
        if (now - this.state.tapReactionTime < 1800) {
            const bounce = Math.sin((now - this.state.tapReactionTime) * 0.015) * 4;
            this.drawHeartEye(this.RE_LCX, this.RE_EEY - 6 + bounce, this.RE_EH);
            this.drawHeartEye(this.RE_RCX, this.RE_EEY - 6 + bounce, this.RE_EH);
            this.drawMochiDefaultSmile(64, 44 + bounce);
            return;
        }

        // Natural saccadic gaze or smooth cursor tracking
        if (this.isHovered) {
            this.state.targetPupilX = ((this.mouseX - 64) / 64) * 6.0;
            this.state.targetPupilY = ((this.mouseY - 26) / 32) * 5.0;
        } else if (now > this.state.nextLookTime) {
            const gazes = [
                {x: 0, y: 0},
                {x: 0, y: 0},
                {x: 0, y: 0},
                {x: 0, y: -5.5},
                {x: 0, y: 5.5},
                {x: -6.0, y: 0},
                {x: 6.0, y: 0},
                {x: -4.2, y: -3.8},
                {x: 4.2, y: -3.8},
                {x: -4.2, y: 3.8},
                {x: 4.2, y: 3.8}
            ];
            const chosen = gazes[Math.floor(Math.random() * gazes.length)];
            this.state.targetPupilX = chosen.x;
            this.state.targetPupilY = chosen.y;
            this.state.nextLookTime = now + 1200 + Math.random() * 2200;
        }

        // Smooth pupil interpolation
        this.state.pupilX += (this.state.targetPupilX - this.state.pupilX) * 0.22;
        this.state.pupilY += (this.state.targetPupilY - this.state.pupilY) * 0.22;

        // ONLY default eye uses the authentic circular face with smile:
        this.drawMochiDefaultEye(this.RE_LCX, this.state.pupilX, this.state.pupilY, blinkCut);
        this.drawMochiDefaultEye(this.RE_RCX, this.state.pupilX, this.state.pupilY, blinkCut);
        if (blinkCut < 26) {
            this.drawMochiDefaultSmile(64, 44);
        }
    }

    renderPetting(now, startTime = 0) {
        const elapsed = (startTime > 0) ? (now - startTime) : now;
        const purr = Math.sin(now * 0.02) * 1.5;
        const w = 42;
        const h = 20;
        const y = 30 + purr;
        const lex = this.RE_LCX - w / 2;
        const rex = this.RE_RCX - w / 2;

        // Happy squinting hammock eyes (petting cuddle smile)
        this.fillRoundRect(lex, y, w, h, 10, OLED_CONFIG.color);
        this.fillRoundRect(rex, y, w, h, 10, OLED_CONFIG.color);

        // Boolean cutout of top
        const cutR = 36;
        const cutCY = y + 8 - cutR;
        this.fillCircle(this.RE_LCX, cutCY, cutR, '#05070a');
        this.fillCircle(this.RE_RCX, cutCY, cutR, '#05070a');
        this.ctx.fillStyle = '#05070a';
        this.ctx.fillRect(lex, 0, w, cutCY);
        this.ctx.fillRect(rex, 0, w, cutCY);

        // Big happy smile below
        this.drawSmile(64, 48 + purr, 10, 5);

        // Floating love heart
        const floatY = (elapsed * 0.025) % 28;
        this.drawHeartEye(64, 18 - floatY, 12);
    }

    renderLovestruck(now) {
        const beatCycle = (now * 0.005) % (Math.PI * 2);
        const beat = Math.pow(Math.sin(beatCycle), 4);
        const pulse = beat * 5;

        this.drawHeartEye(this.RE_LCX, this.RE_EEY - 2 - pulse/2, this.RE_EH + pulse);
        this.drawHeartEye(this.RE_RCX, this.RE_EEY - 2 - pulse/2, this.RE_EH + pulse);
        this.drawSmile(64, 46, 8 + pulse/2, 4);
    }

    renderMusic(now) {
        const beat = Math.sin(now * 0.008);
        const bob = Math.abs(beat) * 6;
        const offY = Math.floor(bob);

        // Headphone band
        this.ctx.strokeStyle = OLED_CONFIG.color;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(64, 32 + offY, 36, Math.PI, 0, false);
        this.ctx.stroke();

        // Ear cups
        this.fillRoundRect(14, 18 + offY, 12, 24, 4, OLED_CONFIG.color);
        this.fillRoundRect(102, 18 + offY, 12, 24, 4, OLED_CONFIG.color);

        // Eyes (slimmer, cute, bouncing)
        this.drawOneEye(this.RE_LCX, 0, 0, 6, 8, this.RE_PR + 1, offY, 32);
        this.drawOneEye(this.RE_RCX, 0, 0, 6, 8, this.RE_PR + 1, offY, 32);

        // Happy Smile
        this.drawSmile(64, 48 + offY, 8, 4);

        // Floating music notes
        const note1Y = (now * 0.04) % 35;
        const note2Y = ((now + 400) * 0.035) % 35;
        this.drawMusicNote(20, 36 - note1Y);
        this.drawMusicNote(106, 36 - note2Y);
    }

    drawMusicNote(x, y) {
        if (y < 2) return;
        this.fillCircle(x, y, 2.5);
        this.drawFastVLine(x + 2, y - 7, 7);
        this.drawFastHLine(x + 2, y - 7, 3);
    }

    renderGamer(now) {
        // Focused narrowed eyes looking up
        const topCut = 10;
        const botCut = 4;
        const eyeOffY = -6;

        // Move pong ball
        this.state.ballX += this.state.bvx;
        this.state.ballY += this.state.bvy;
        if (this.state.ballY <= 38 || this.state.ballY >= 56) this.state.bvy = -this.state.bvy;
        if (this.state.ballX <= 8) { this.state.ballX = 8; this.state.bvx = Math.abs(this.state.bvx); }
        if (this.state.ballX >= 118) { this.state.ballX = 118; this.state.bvx = -Math.abs(this.state.bvx); }

        // Paddle tracking
        this.state.padL += (this.state.ballY > this.state.padL + 5) ? 1.5 : -1.5;
        this.state.padR += (this.state.ballY > this.state.padR + 5) ? 1.5 : -1.5;
        this.state.padL = Math.max(38, Math.min(50, this.state.padL));
        this.state.padR = Math.max(38, Math.min(50, this.state.padR));

        // Eyes track ball
        const eyeX = ((this.state.ballX - 64) / 64) * 8;
        const eyeY = ((this.state.ballY - 47) / 9) * 3;

        this.drawOneEye(this.RE_LCX, eyeX, eyeY, topCut, botCut, this.RE_PR - 2, eyeOffY);
        this.drawOneEye(this.RE_RCX, eyeX, eyeY, topCut, botCut, this.RE_PR - 2, eyeOffY);

        // Eyebrows (focused angle)
        this.ctx.strokeStyle = OLED_CONFIG.color;
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.moveTo(14, 12); this.ctx.lineTo(50, 16);
        this.ctx.moveTo(114, 12); this.ctx.lineTo(78, 16);
        this.ctx.stroke();

        // Pong game at bottom
        for (let x = 0; x < 128; x += 4) this.drawFastHLine(x, 58, 2);
        this.ctx.fillStyle = OLED_CONFIG.color;
        this.ctx.fillRect(4, Math.floor(this.state.padL), 3, 10);
        this.ctx.fillRect(121, Math.floor(this.state.padR), 3, 10);
        this.ctx.fillRect(Math.floor(this.state.ballX), Math.floor(this.state.ballY), 3, 3);
    }

    renderSleepy(now) {
        const elapsed = now * 0.002;
        const breathWave = Math.sin(elapsed);
        const breathY = breathWave * 2.0;

        const w = 42;
        const h = 18;
        const y = 30 + breathY;
        const lex = this.RE_LCX - w / 2;
        const rex = this.RE_RCX - w / 2;

        // Bottom curved hammock bowls
        this.fillRoundRect(lex, y, w, h, 10, OLED_CONFIG.color);
        this.fillRoundRect(rex, y, w, h, 10, OLED_CONFIG.color);

        // Cutout top hammock curve
        const cutR = 38;
        const cutCY = y + 8 + (breathWave * 3.5) - cutR;
        this.fillCircle(this.RE_LCX, cutCY, cutR, '#05070a');
        this.fillCircle(this.RE_RCX, cutCY, cutR, '#05070a');
        this.ctx.fillStyle = '#05070a';
        this.ctx.fillRect(lex, 0, w, cutCY);
        this.ctx.fillRect(rex, 0, w, cutCY);

        // Drifting 'Z z z'
        const z1 = ((now * 0.03) % 40);
        const z2 = (((now + 500) * 0.025) % 40);
        this.ctx.fillStyle = OLED_CONFIG.color;
        this.ctx.font = 'bold 9px monospace';
        this.ctx.fillText('Z', 60 + Math.sin(now * 0.005) * 4, 32 - z1);
        this.ctx.font = 'bold 7px monospace';
        this.ctx.fillText('z', 68 + Math.cos(now * 0.005) * 3, 30 - z2);
    }

    renderDino(now) {
        // Dino runs across bottom from left to right
        const progress = ((now * 0.05) % 160) - 20;
        this.state.dinoX = progress;

        // Eyes track Dino
        const eyeTargetX = Math.max(-8, Math.min(8, ((this.state.dinoX - 64) / 64) * 8));
        const eyeTargetY = 4;

        this.drawOneEye(this.RE_LCX, eyeTargetX, eyeTargetY, 0, 0, 8);
        this.drawOneEye(this.RE_RCX, eyeTargetX, eyeTargetY, 0, 0, 8);

        // Ground line
        this.drawFastHLine(0, 62, 128);

        // Mini 8-bit T-Rex running sprite
        const dx = Math.floor(this.state.dinoX);
        const legStep = Math.floor(now * 0.015) % 2;
        this.ctx.fillStyle = OLED_CONFIG.color;
        // Head & body
        this.ctx.fillRect(dx + 8, 48, 8, 6);
        this.ctx.fillRect(dx + 12, 46, 6, 4);
        this.ctx.fillRect(dx + 4, 52, 10, 6);
        // Eye
        this.ctx.fillStyle = '#05070a';
        this.ctx.fillRect(dx + 14, 47, 2, 2);
        // Legs
        this.ctx.fillStyle = OLED_CONFIG.color;
        if (legStep === 0) {
            this.ctx.fillRect(dx + 6, 58, 2, 4);
            this.ctx.fillRect(dx + 10, 58, 2, 2);
        } else {
            this.ctx.fillRect(dx + 6, 58, 2, 2);
            this.ctx.fillRect(dx + 10, 58, 2, 4);
        }
    }

    renderSnake(now) {
        const headProgress = ((now * 0.04) % 170) - 25;
        const headX = headProgress;
        const headY = 52;
        const phase = now * 0.008;

        // Surprised "O" mouth + eyes tracking snake
        const eyeTargetX = Math.max(-8, Math.min(8, ((headX - 64) / 64) * 8));
        this.drawOneEye(this.RE_LCX, eyeTargetX, 4, 0, 0, 8);
        this.drawOneEye(this.RE_RCX, eyeTargetX, 4, 0, 0, 8);

        // "O" mouth
        this.fillCircle(64, 46, 4, OLED_CONFIG.color);
        this.fillCircle(64, 46, 2.5, '#05070a');

        // Draw slithering snake
        const segs = 6;
        for (let i = segs; i >= 0; i--) {
            const sp = phase + i * 0.8;
            const sx = headX - i * 5;
            const sy = headY + Math.sin(sp) * 4;
            const r = (i === 0) ? 4.5 : 3.5;
            this.fillCircle(sx, sy, r, OLED_CONFIG.color);
            if (i === 0) {
                // Eye dot
                this.ctx.fillStyle = '#05070a';
                this.ctx.fillRect(sx + 1, sy - 1, 2, 2);
            }
        }
    }

    renderWorkout(now) {
        const cycle = (now * 0.004) % (Math.PI * 2);
        const ty = 40 + Math.sin(cycle) * 16;
        const struggle = (ty < 35) ? ((Math.floor(now * 0.05) % 2 === 0) ? 2 : -2) : 0;

        // Determined narrowed eyes
        const topCut = (ty < 35) ? 8 : 4;
        const botCut = (ty < 35) ? 8 : 0;
        this.drawOneEye(this.RE_LCX, struggle, (ty < 35 ? -3 : 2), topCut, botCut, this.RE_PR - 1);
        this.drawOneEye(this.RE_RCX, struggle, (ty < 35 ? -3 : 2), topCut, botCut, this.RE_PR - 1);

        // Eyebrows
        this.ctx.strokeStyle = OLED_CONFIG.color;
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.moveTo(14, 15); this.ctx.lineTo(48, 18);
        this.ctx.moveTo(114, 15); this.ctx.lineTo(80, 18);
        this.ctx.stroke();

        // Barbell
        const barbellY = Math.floor(ty);
        this.ctx.fillStyle = OLED_CONFIG.color;
        this.ctx.fillRect(20, barbellY, 88, 2);
        // Weight plates
        this.ctx.fillRect(24, barbellY - 6, 6, 14);
        this.ctx.fillRect(18, barbellY - 4, 5, 10);
        this.ctx.fillRect(98, barbellY - 6, 6, 14);
        this.ctx.fillRect(105, barbellY - 4, 5, 10);

        // Sweat drops when lifting high
        if (ty < 32) {
            this.ctx.fillRect(40, 10, 1.5, 4);
            this.ctx.fillRect(88, 12, 1.5, 4);
        }
    }

    renderReading(now) {
        // Eyes scan left to right across the page
        const scan = Math.sin(now * 0.003) * 6;
        this.drawOneEye(this.RE_LCX, scan, 3, 2, 0, this.RE_PR);
        this.drawOneEye(this.RE_RCX, scan, 3, 2, 0, this.RE_PR);

        // Open book at bottom
        const bx = 64;
        const by = 48;
        this.ctx.strokeStyle = OLED_CONFIG.color;
        this.ctx.lineWidth = 1.2;

        // Mask behind book
        this.ctx.fillStyle = '#05070a';
        this.ctx.beginPath();
        this.ctx.moveTo(bx, by);
        this.ctx.lineTo(bx - 22, by - 5); this.ctx.lineTo(bx - 22, by + 10);
        this.ctx.lineTo(bx + 22, by + 10); this.ctx.lineTo(bx + 22, by - 5);
        this.ctx.closePath();
        this.ctx.fill();

        // Spine
        this.drawFastVLine(bx, by, 12);
        // Left & right page outlines
        this.ctx.strokeRect(bx - 20, by, 20, 10);
        this.ctx.strokeRect(bx, by, 20, 10);

        // Text lines
        this.drawFastHLine(bx - 17, by + 3, 13);
        this.drawFastHLine(bx - 17, by + 6, 11);
        this.drawFastHLine(bx + 4, by + 3, 13);
        this.drawFastHLine(bx + 4, by + 6, 11);

        // Cute paws holding book
        this.fillRoundRect(bx - 22, by + 6, 6, 5, 2);
        this.fillRoundRect(bx + 16, by + 6, 6, 5, 2);
    }

    renderDizzy(now) {
        const angle = now * 0.006;
        const dx = Math.cos(angle) * 6;
        const dy = Math.sin(angle) * 4;

        // X Eyes
        this.drawOneEye(this.RE_LCX, dx, dy, 2, 2, this.RE_PR, 0, 0, true);
        this.drawOneEye(this.RE_RCX, -dx, -dy, 2, 2, this.RE_PR, 0, 0, true);

        // 3 Orbiting stars
        for (let s = 0; s < 3; s++) {
            const a = angle * 1.5 + (s * (Math.PI * 2 / 3));
            const sx = 64 + Math.cos(a) * 24;
            const sy = 8 + Math.sin(a) * 5;
            this.drawStar(sx, sy);
        }
    }

    drawStar(cx, cy) {
        this.ctx.fillStyle = OLED_CONFIG.color;
        this.ctx.fillRect(cx, cy - 2, 1, 5);
        this.ctx.fillRect(cx - 2, cy, 5, 1);
    }

    renderNinja(now) {
        const maskDrop = Math.min(14, -20 + ((now * 0.04) % 150));
        const scan = Math.sin(now * 0.004) * 8;

        this.drawOneEye(this.RE_LCX, scan, 0, 8, 6, this.RE_PR - 3);
        this.drawOneEye(this.RE_RCX, scan, 0, 8, 6, this.RE_PR - 3);

        // Ninja forehead mask
        this.ctx.fillStyle = OLED_CONFIG.color;
        this.ctx.fillRect(0, 0, 128, Math.max(0, maskDrop));
        this.ctx.fillStyle = '#05070a';
        this.ctx.fillRect(0, 0, 128, Math.max(0, maskDrop - 2));

        // Ninja chin/mouth mask
        const botBand = maskDrop + 22;
        this.ctx.fillStyle = OLED_CONFIG.color;
        this.ctx.fillRect(0, botBand, 128, 64 - botBand);
        this.ctx.fillStyle = '#05070a';
        this.ctx.fillRect(0, botBand + 2, 128, 64 - botBand);

        // Mask headband tails
        this.ctx.strokeStyle = OLED_CONFIG.color;
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.moveTo(120, maskDrop + 3); this.ctx.lineTo(128, maskDrop);
        this.ctx.moveTo(120, maskDrop + 5); this.ctx.lineTo(128, maskDrop + 2);
        this.ctx.stroke();
    }

    renderRain(now) {
        // Raindrops
        this.ctx.fillStyle = OLED_CONFIG.color;
        for (const drop of this.state.rainDrops) {
            drop.y += 3;
            if (drop.y > 64) {
                drop.x = Math.random() * 128;
                drop.y = Math.random() * -10;
            }
            // Skip or splash if hits umbrella (x: 36..92, y: 18..24)
            if (drop.x > 36 && drop.x < 92 && drop.y >= 16 && drop.y <= 24) {
                this.ctx.fillRect(drop.x - 1, drop.y, 3, 1);
            } else {
                this.ctx.fillRect(drop.x, drop.y, 1, 4);
            }
        }

        // Umbrella canopy
        this.ctx.strokeStyle = OLED_CONFIG.color;
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.arc(64, 22, 24, Math.PI, 0, false);
        this.ctx.stroke();
        this.drawFastHLine(40, 22, 48);
        // Handle
        this.drawFastVLine(64, 22, 14);
        this.ctx.beginPath();
        this.ctx.arc(61, 36, 3, 0, Math.PI, false);
        this.ctx.stroke();

        // Sad/cozy eyes under umbrella
        this.drawOneEye(this.RE_LCX, 0, 2, 6, 2, this.RE_PR);
        this.drawOneEye(this.RE_RCX, 0, 2, 6, 2, this.RE_PR);
    }

    renderPingPong(now) {
        const sweep = Math.sin(now * 0.007) * 12;
        this.drawOneEye(this.RE_LCX, sweep, 0, 0, 0, this.RE_PR);
        this.drawOneEye(this.RE_RCX, sweep, 0, 0, 0, this.RE_PR);
    }

    renderBounce(now) {
        const bounce = Math.abs(Math.sin(now * 0.008)) * 8;
        const squishW = (bounce < 2) ? 6 : 0;
        const squishH = (bounce < 2) ? -4 : 0;

        this.drawOneEye(this.RE_LCX, 0, 0, -squishH, 0, this.RE_PR + 1, -bounce, this.RE_EW + squishW);
        this.drawOneEye(this.RE_RCX, 0, 0, -squishH, 0, this.RE_PR + 1, -bounce, this.RE_EW + squishW);
        this.drawSmile(64, 46 - bounce, 8 + squishW/2, 4);
    }

    loop() {
        if (!this.isRunning) return;
        const now = performance.now() * OLED_CONFIG.speed;

        this.clear();

        switch (this.animType) {
            case 'interactive': this.renderInteractive(now); break;
            case 'petting':     this.renderPetting(now); break;
            case 'lovestruck':  this.renderLovestruck(now); break;
            case 'music':       this.renderMusic(now); break;
            case 'gamer':       this.renderGamer(now); break;
            case 'sleepy':      this.renderSleepy(now); break;
            case 'dino':        this.renderDino(now); break;
            case 'snake':       this.renderSnake(now); break;
            case 'workout':     this.renderWorkout(now); break;
            case 'reading':     this.renderReading(now); break;
            case 'dizzy':       this.renderDizzy(now); break;
            case 'ninja':       this.renderNinja(now); break;
            case 'rain':        this.renderRain(now); break;
            case 'pingpong':    this.renderPingPong(now); break;
            case 'bounce':      this.renderBounce(now); break;
            default:            this.renderInteractive(now); break;
        }

        requestAnimationFrame(this.loop);
    }
}

if (typeof window !== 'undefined') {
    window.OLED_CONFIG = OLED_CONFIG;
    window.VirtualOLED = VirtualOLED;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { OLED_CONFIG, VirtualOLED };
}
