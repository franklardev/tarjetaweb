/**
 * Tarjeta Virtual Full-Screen
 * Pestañas, copiado al portapapeles,
 * descarga vCard, galería lightbox,
 * animaciones de entrada.
 */

document.addEventListener('DOMContentLoaded', () => {

    // ============================================
    // NAVEGACIÓN POR PESTAÑAS
    // ============================================
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;

            tabButtons.forEach(b => b.classList.remove('active'));
            tabPanels.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const panel = document.getElementById(`panel-${targetTab}`);
            if (panel) {
                panel.classList.add('active');
                // Reiniciar animación
                panel.style.animation = 'none';
                panel.offsetHeight;
                panel.style.animation = '';
            }
        });
    });

    // ============================================
    // COPIAR AL PORTAPAPELES
    // ============================================
    const copyButtons = document.querySelectorAll('.copy-btn');
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-msg');
    let toastTimeout = null;

    function showToast(message) {
        if (toastTimeout) clearTimeout(toastTimeout);
        toastMsg.textContent = message;
        toast.classList.add('show');
        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 2500);
    }

    async function copyToClipboard(text) {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text);
                return true;
            }
            // Fallback para HTTP o navegadores antiguos
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.left = '-9999px';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            const success = document.execCommand('copy');
            document.body.removeChild(textarea);
            return success;
        } catch (err) {
            console.warn('Error al copiar:', err);
            return false;
        }
    }

    copyButtons.forEach(btn => {
        btn.addEventListener('click', async () => {
            const card = btn.closest('.info-card');
            const textToCopy = card?.dataset.copy;
            if (!textToCopy) return;

            const success = await copyToClipboard(textToCopy);

            if (success) {
                btn.classList.add('copied');
                btn.innerHTML = '<i class="fas fa-check"></i>';
                showToast('Copiado al portapapeles');

                setTimeout(() => {
                    btn.classList.remove('copied');
                    btn.innerHTML = '<i class="far fa-copy"></i>';
                }, 2000);
            } else {
                showToast('No se pudo copiar');
            }
        });
    });

    // ============================================
    // AGREGAR A CONTACTOS (vCard)
    // ============================================
    const btnContact = document.getElementById('btn-contact');

    function downloadVCard() {
        const vcard = [
            'BEGIN:VCARD',
            'VERSION:3.0',
            'FN:Andrés García',
            'N:García;Andrés;;;',
            'TITLE:Gerente General',
            'ORG:Grupo Empresarial García S.A.',
            'TEL;TYPE=WORK,VOICE:+523336587521',
            'EMAIL;TYPE=WORK:andresgarcia@ejemplo.com',
            'URL:https://ejemplo.com',
            'ADR;TYPE=WORK:;;Av. Vallarta 1234;Guadalajara;Jalisco;;;México',
            'NOTE:Tarjeta virtual digital',
            'END:VCARD'
        ].join('\n');

        const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = 'Andres_Garcia.vcf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => URL.revokeObjectURL(url), 5000);
    }

    btnContact.addEventListener('click', () => {
        downloadVCard();
        showToast('Contacto descargado');

        const originalHTML = btnContact.innerHTML;
        const originalBg = btnContact.style.background;
        btnContact.innerHTML = '<i class="fas fa-check-circle"></i> Descargado';
        btnContact.style.background = 'linear-gradient(135deg, #16A34A, #22C55E)';

        setTimeout(() => {
            btnContact.innerHTML = originalHTML;
            btnContact.style.background = originalBg;
        }, 2200);
    });

    // ============================================
    // GALERÍA LIGHTBOX
    // ============================================
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.getElementById('lightbox-close');
    const galleryItems = document.querySelectorAll('.gallery-item');

    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const img = item.querySelector('img');
            if (!img) return;

            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt;
            lightbox.classList.add('open');
            document.body.style.overflow = 'hidden';
        });
    });

    function closeLightbox() {
        lightbox.classList.remove('open');
        document.body.style.overflow = '';
        setTimeout(() => {
            lightboxImg.src = '';
        }, 400);
    }

    lightboxClose.addEventListener('click', closeLightbox);

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('open')) {
            closeLightbox();
        }
    });

    // ============================================
    // ANIMACIÓN DE ENTRADA INICIAL
    // ============================================
    const sidebarInner = document.querySelector('.sidebar-inner');
    const contentInner = document.querySelector('.content-inner');

    // Elementos del sidebar
    const sidebarChildren = sidebarInner ? Array.from(sidebarInner.children) : [];
    // Elementos del contenido
    const contentChildren = contentInner ? Array.from(contentInner.children) : [];

    // Ocultar todo al inicio
    const allEntrance = [...sidebarChildren, ...contentChildren];
    allEntrance.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(18px)';
    });

    // Animar secuencialmente
    requestAnimationFrame(() => {
        allEntrance.forEach((el, i) => {
            setTimeout(() => {
                el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, i * 70);
        });
    });

    // ============================================
    // PARALLAX SUTIL EN EL AVATAR (solo desktop)
    // ============================================
    const avatarRing = document.querySelector('.avatar-ring');
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (!isTouchDevice) {
        document.addEventListener('mousemove', (e) => {
            if (!avatarRing) return;

            const rect = avatarRing.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const x = (e.clientX - centerX) / window.innerWidth;
            const y = (e.clientY - centerY) / window.innerHeight;

            avatarRing.style.transform = `translate(${x * 12}px, ${y * 12}px)`;
        });
    }

    // ============================================
    // PARTÍCULAS FLOTANTES DECORATIVAS
    // ============================================
    function createParticles() {
        const container = document.querySelector('.app-container');
        if (!container) return;

        const particleCount = window.innerWidth < 768 ? 8 : 15;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'floating-particle';
            particle.style.cssText = `
                position: fixed;
                width: ${Math.random() * 3 + 1.5}px;
                height: ${Math.random() * 3 + 1.5}px;
                background: ${Math.random() > 0.5 ? 'var(--primary-light)' : 'var(--accent)'};
                border-radius: 50%;
                pointer-events: none;
                z-index: 0;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                opacity: ${Math.random() * 0.25 + 0.05};
                animation: particleDrift ${Math.random() * 20 + 15}s linear infinite;
                animation-delay: ${Math.random() * -20}s;
            `;
            document.body.appendChild(particle);
        }

        // Inyectar keyframes si no existen
        if (!document.getElementById('particle-keyframes')) {
            const style = document.createElement('style');
            style.id = 'particle-keyframes';
            style.textContent = `
                @keyframes particleDrift {
                    0% { transform: translate(0, 0) scale(1); }
                    25% { transform: translate(${rand(-80,80)}px, ${rand(-80,80)}px) scale(1.2); }
                    50% { transform: translate(${rand(-60,60)}px, ${rand(-120,120)}px) scale(0.8); }
                    75% { transform: translate(${rand(-100,100)}px, ${rand(-40,40)}px) scale(1.1); }
                    100% { transform: translate(0, 0) scale(1); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    function rand(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // No crear partículas si el usuario prefiere movimiento reducido
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        createParticles();
    }

    // ============================================
    // CONTADOR DE VISITAS (localStorage, silencioso)
    // ============================================
    (function() {
        const key = 'tarjeta_visitas_andres';
        const current = parseInt(localStorage.getItem(key) || '0', 10);
        localStorage.setItem(key, (current + 1).toString());
    })();

});