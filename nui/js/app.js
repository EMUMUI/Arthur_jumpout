const CHARGE_DURATION = 2000;
const RING_CIRCUMFERENCE = 2 * Math.PI * 16;

const chargeContainer = document.getElementById('charge-container');
const chargeFill = document.getElementById('charge-bar-fill');
const chargePercent = document.getElementById('charge-percent');
const cooldownContainer = document.getElementById('cooldown-container');
const cooldownRingFill = document.getElementById('cooldown-ring-fill');
const notifications = document.getElementById('notifications');

let chargeStartTime = 0;
let chargeAnimId = null;
let maxChargeTime = CHARGE_DURATION;

cooldownRingFill.style.strokeDasharray = RING_CIRCUMFERENCE;
cooldownRingFill.style.strokeDashoffset = RING_CIRCUMFERENCE;

window.addEventListener('message', function(event) {
    const { action, data } = event.data;

    switch (action) {
        case 'chargeStart':
            onChargeStart(data);
            break;
        case 'chargeEnd':
            onChargeEnd();
            break;
        case 'cooldownUpdate':
            onCooldownUpdate(data);
            break;
        case 'showNotification':
            onShowNotification(data);
            break;
    }
});

function onChargeStart(data) {
    maxChargeTime = data.maxTime || CHARGE_DURATION;
    chargeStartTime = Date.now();
    chargeContainer.classList.remove('hidden');

    if (chargeAnimId) {
        cancelAnimationFrame(chargeAnimId);
    }

    function update() {
        const elapsed = Date.now() - chargeStartTime;
        const progress = Math.min(elapsed / maxChargeTime, 1.0);
        const percent = Math.round(progress * 100);

        chargeFill.style.width = percent + '%';
        chargePercent.textContent = percent + '%';

        if (progress >= 1.0) {
            chargeFill.style.background = 'linear-gradient(90deg, #e74c3c, #e67e22)';
        } else {
            chargeFill.style.background = 'linear-gradient(90deg, #3498db, #2ecc71)';
        }

        if (progress < 1.0) {
            chargeAnimId = requestAnimationFrame(update);
        } else {
            chargeAnimId = null;
        }
    }

    chargeAnimId = requestAnimationFrame(update);
}

function onChargeEnd() {
    if (chargeAnimId) {
        cancelAnimationFrame(chargeAnimId);
        chargeAnimId = null;
    }
    chargeContainer.classList.add('hidden');
    chargeFill.style.width = '0%';
    chargeFill.style.background = 'linear-gradient(90deg, #3498db, #2ecc71)';
    chargePercent.textContent = '0%';
}

const COOLDOWN_DURATION = 8000;
let cooldownStartTime = 0;
let cooldownAnimId = null;

function onCooldownUpdate(data) {
    if (data.active) {
        if (cooldownContainer.classList.contains('hidden')) {
            cooldownStartTime = Date.now();
            cooldownContainer.classList.remove('hidden');
            startCooldownAnim();
        }
    } else {
        cooldownContainer.classList.add('hidden');
        if (cooldownAnimId) {
            cancelAnimationFrame(cooldownAnimId);
            cooldownAnimId = null;
        }
        cooldownRingFill.style.strokeDashoffset = RING_CIRCUMFERENCE;
        cooldownRingFill.style.stroke = '#e74c3c';
    }
}

function startCooldownAnim() {
    function update() {
        const elapsed = Date.now() - cooldownStartTime;
        const remaining = Math.max(COOLDOWN_DURATION - elapsed, 0);
        const progress = remaining / COOLDOWN_DURATION;

        const offset = RING_CIRCUMFERENCE * (1 - progress);
        cooldownRingFill.style.strokeDashoffset = offset;

        if (progress > 0.5) {
            cooldownRingFill.style.stroke = '#e74c3c';
        } else if (progress > 0.25) {
            cooldownRingFill.style.stroke = '#e67e22';
        } else {
            cooldownRingFill.style.stroke = '#2ecc71';
        }

        if (remaining > 0) {
            cooldownAnimId = requestAnimationFrame(update);
        } else {
            cooldownContainer.classList.add('hidden');
            cooldownRingFill.style.strokeDashoffset = RING_CIRCUMFERENCE;
            cooldownAnimId = null;
        }
    }

    cooldownAnimId = requestAnimationFrame(update);
}

function onShowNotification(data) {
    const type = data.type || 'info';
    const text = data.text || '';
    const duration = data.duration || 2000;

    const el = document.createElement('div');
    el.className = 'notification ' + type;
    el.textContent = text;
    notifications.appendChild(el);

    requestAnimationFrame(function() {
        el.classList.add('show');
    });

    setTimeout(function() {
        el.classList.remove('show');
        setTimeout(function() {
            if (el.parentNode) {
                el.parentNode.removeChild(el);
            }
        }, 300);
    }, duration);
}
