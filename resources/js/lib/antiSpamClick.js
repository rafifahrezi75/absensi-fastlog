const COOLDOWN_MS = 750;
const blockedButtons = new WeakSet();
let lastFormSubmitTime = 0;
let lastSubmittedForm = null;

export function initAntiSpamClick() {
    if (typeof window === 'undefined') return;

    window.addEventListener(
        'click',
        (event) => {
            const button = event.target.closest('button, [role="button"], input[type="submit"]');
            if (!button) return;

            if (button.dataset.allowSpam === 'true') return;

            if (blockedButtons.has(button) || button.getAttribute('data-spam-locked') === 'true') {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
                return;
            }

            blockedButtons.add(button);
            button.setAttribute('data-spam-locked', 'true');

            const prevPointerEvents = button.style.pointerEvents;
            button.style.pointerEvents = 'none';

            setTimeout(() => {
                blockedButtons.delete(button);
                button.removeAttribute('data-spam-locked');
                button.style.pointerEvents = prevPointerEvents;
            }, COOLDOWN_MS);
        },
        true
    );

    window.addEventListener(
        'submit',
        (event) => {
            const form = event.target;
            const now = Date.now();
            if (form === lastSubmittedForm && now - lastFormSubmitTime < COOLDOWN_MS) {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
                return;
            }
            lastSubmittedForm = form;
            lastFormSubmitTime = now;
        },
        true
    );
}
