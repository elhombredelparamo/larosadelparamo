// js/main.js

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Datos de Productos ---
    // Los datos ahora se cargan desde js/productos.js en la variable global 'productsData'
    const products = productsData;

    // --- 2. Estado Global y Carrito ---
    const ORDERS_RECEIVING_EMAIL = "elhombredelparamo@gmail.com";
    let cart = JSON.parse(localStorage.getItem('larosa_cart')) || [];
    
    // --- 3. Referencias DOM estáticas ---
    const appRoot = document.getElementById('app-root');
    const cartCountElement = document.querySelector('.cart-count');
    const cartBtn = document.querySelector('.cart-btn');
    const cartDrawer = document.getElementById('cart-drawer');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartCloseBtn = document.getElementById('cart-close-btn');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartDrawerCount = document.getElementById('cart-drawer-count');
    const cartSubtotalElement = document.getElementById('cart-subtotal');
    const cartClearBtn = document.getElementById('cart-clear-btn');
    const cartFooter = document.getElementById('cart-footer');

    // Referencias a los pasos del Checkout
    const cartStepItems = document.getElementById('cart-step-items');
    const cartStepCheckout = document.getElementById('cart-step-checkout');
    const cartStepSuccess = document.getElementById('cart-step-success');
    const btnGoToCheckout = document.getElementById('btn-go-to-checkout');
    const btnBackToCart = document.getElementById('btn-back-to-cart');
    const checkoutForm = document.getElementById('checkout-form');
    const checkoutSummaryDetails = document.getElementById('checkout-summary-details');
    const checkoutSummaryTotal = document.getElementById('checkout-summary-total');
    const btnSubmitOrder = document.getElementById('btn-submit-order');
    const btnSuccessClose = document.getElementById('btn-success-close');
    const successContactMessage = document.getElementById('success-contact-message');

    // --- 4. Funciones de Navegación y Pasos del Carrito ---
    const switchCartStep = (step) => {
        if (cartStepItems) cartStepItems.classList.remove('active');
        if (cartStepCheckout) cartStepCheckout.classList.remove('active');
        if (cartStepSuccess) cartStepSuccess.classList.remove('active');

        if (step === 'items') {
            if (cartStepItems) cartStepItems.classList.add('active');
        } else if (step === 'checkout') {
            if (cartStepCheckout) {
                cartStepCheckout.classList.add('active');
                const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
                const totalPrice = cart.reduce((sum, item) => {
                    const p = products.find(prod => prod.id === item.id);
                    return sum + (p ? p.price * item.quantity : 0);
                }, 0);

                if (checkoutSummaryDetails) {
                    checkoutSummaryDetails.innerText = `${totalItems} ${totalItems === 1 ? 'producto' : 'productos'}`;
                }
                if (checkoutSummaryTotal) {
                    checkoutSummaryTotal.innerText = `${totalPrice.toFixed(2).replace('.', ',')} €`;
                }
            }
        } else if (step === 'success') {
            if (cartStepSuccess) cartStepSuccess.classList.add('active');
        }
    };

    const openCart = (initialStep = 'items') => {
        if (cartDrawer && cartOverlay) {
            switchCartStep(initialStep);
            cartDrawer.classList.add('open');
            cartOverlay.classList.add('open');
            cartDrawer.setAttribute('aria-hidden', 'false');
            cartOverlay.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        }
    };

    const closeCart = () => {
        if (cartDrawer && cartOverlay) {
            cartDrawer.classList.remove('open');
            cartOverlay.classList.remove('open');
            cartDrawer.setAttribute('aria-hidden', 'true');
            cartOverlay.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            // Resetear paso tras animación
            setTimeout(() => {
                switchCartStep('items');
            }, 350);
        }
    };

    const renderCartDrawer = () => {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        // Actualizar contador del navbar
        cartCountElement.innerText = totalItems;
        if (cartDrawerCount) {
            cartDrawerCount.innerText = `${totalItems} ${totalItems === 1 ? 'producto' : 'productos'}`;
        }

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="cart-empty">
                    <div class="cart-empty-icon">🧺</div>
                    <h4>Tu cesta está vacía</h4>
                    <p>Explora nuestras infusiones botánicas, aceites macerados y jabones naturales.</p>
                    <a href="#tienda" class="btn btn-secondary btn-shop-now" data-route="tienda">Ir a la Botica</a>
                </div>
            `;
            if (cartFooter) {
                cartFooter.style.display = 'none';
            }
            return;
        }

        if (cartFooter) {
            cartFooter.style.display = 'flex';
        }

        let totalPrice = 0;
        let itemsHtml = '';

        cart.forEach(item => {
            const product = products.find(p => p.id === item.id);
            if (!product) return;

            const itemSubtotal = product.price * item.quantity;
            totalPrice += itemSubtotal;

            const imageHtml = product.imagePath
                ? `<img src="${product.imagePath}" alt="${product.name}" class="cart-item-img">`
                : `<div class="cart-item-img">${product.imagePlaceholder || '🌿'}</div>`;

            itemsHtml += `
                <div class="cart-item" data-id="${product.id}">
                    ${imageHtml}
                    <div class="cart-item-details">
                        <div class="cart-item-title">${product.name}</div>
                        <div class="cart-item-unit-price">${product.price.toFixed(2).replace('.', ',')} € / ud.</div>
                        <div class="cart-item-controls">
                            <button class="cart-qty-btn" data-action="decrease" data-id="${product.id}" aria-label="Disminuir">-</button>
                            <span class="cart-qty-value">${item.quantity}</span>
                            <button class="cart-qty-btn" data-action="increase" data-id="${product.id}" aria-label="Aumentar">+</button>
                        </div>
                    </div>
                    <div class="cart-item-total">
                        <span class="cart-item-subtotal">${itemSubtotal.toFixed(2).replace('.', ',')} €</span>
                        <button class="cart-item-remove-btn" data-action="remove" data-id="${product.id}" title="Eliminar producto" aria-label="Eliminar">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                </div>
            `;
        });

        cartItemsContainer.innerHTML = itemsHtml;
        if (cartSubtotalElement) {
            cartSubtotalElement.innerText = `${totalPrice.toFixed(2).replace('.', ',')} €`;
        }
    };

    const saveCart = () => {
        localStorage.setItem('larosa_cart', JSON.stringify(cart));
        renderCartDrawer();
    };

    const addToCart = (productId, quantity = 1) => {
        const existing = cart.find(item => item.id === productId);
        if (existing) {
            existing.quantity += quantity;
        } else {
            cart.push({ id: productId, quantity: quantity });
        }
        saveCart();

        // Animación en el icono de la cesta
        cartCountElement.style.transform = "scale(1.3)";
        setTimeout(() => {
            cartCountElement.style.transform = "scale(1)";
        }, 250);

        openCart('items');
    };

    const updateCartQty = (productId, delta) => {
        const item = cart.find(i => i.id === productId);
        if (item) {
            item.quantity += delta;
            if (item.quantity <= 0) {
                cart = cart.filter(i => i.id !== productId);
            }
            saveCart();
        }
    };

    const removeFromCart = (productId) => {
        cart = cart.filter(i => i.id !== productId);
        saveCart();
    };

    const clearCart = () => {
        cart = [];
        saveCart();
    };

    // Listeners para abrir / cerrar y pasos
    if (cartBtn) {
        cartBtn.addEventListener('click', () => openCart('items'));
    }
    if (cartCloseBtn) {
        cartCloseBtn.addEventListener('click', closeCart);
    }
    if (cartOverlay) {
        cartOverlay.addEventListener('click', closeCart);
    }
    if (btnGoToCheckout) {
        btnGoToCheckout.addEventListener('click', () => {
            if (cart.length > 0) {
                switchCartStep('checkout');
            }
        });
    }
    if (btnBackToCart) {
        btnBackToCart.addEventListener('click', () => {
            switchCartStep('items');
        });
    }
    if (btnSuccessClose) {
        btnSuccessClose.addEventListener('click', () => {
            closeCart();
            window.location.hash = '#tienda';
        });
    }

    if (cartClearBtn) {
        cartClearBtn.addEventListener('click', () => {
            if (confirm("¿Estás seguro de que quieres vaciar la cesta?")) {
                clearCart();
            }
        });
    }

    // Delegación de eventos dentro del contenedor de items del carrito
    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            const shopLink = e.target.closest('.btn-shop-now');
            
            if (shopLink) {
                closeCart();
                return;
            }

            if (!btn) return;
            const action = btn.getAttribute('data-action');
            const id = parseInt(btn.getAttribute('data-id'));

            if (action === 'increase') {
                updateCartQty(id, 1);
            } else if (action === 'decrease') {
                updateCartQty(id, -1);
            } else if (action === 'remove') {
                removeFromCart(id);
            }
        });
    }

    // Envío del Formulario de Pedido por Email
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (cart.length === 0) {
                alert("La cesta está vacía.");
                switchCartStep('items');
                return;
            }

            const name = document.getElementById('customer-name').value.trim();
            const phone = document.getElementById('customer-phone').value.trim();
            const email = document.getElementById('customer-email').value.trim();
            const notes = document.getElementById('customer-notes').value.trim();

            const btnText = btnSubmitOrder.querySelector('.btn-text');
            const btnSpinner = btnSubmitOrder.querySelector('.btn-spinner');

            // Estado cargando
            btnSubmitOrder.disabled = true;
            if (btnText) btnText.style.display = 'none';
            if (btnSpinner) btnSpinner.style.display = 'inline-block';

            // Preparar desglose del pedido
            let orderSummaryText = '';
            let totalAmount = 0;
            cart.forEach(item => {
                const prod = products.find(p => p.id === item.id);
                if (prod) {
                    const sub = prod.price * item.quantity;
                    totalAmount += sub;
                    orderSummaryText += `• ${item.quantity}x ${prod.name} (${prod.price.toFixed(2).replace('.', ',')} €/ud) = ${sub.toFixed(2).replace('.', ',')} €\n`;
                }
            });

            const emailPayload = {
                _subject: `🌿 Nuevo Pedido de ${name} [${totalAmount.toFixed(2).replace('.', ',')} €]`,
                _template: "table",
                _captcha: "false",
                cliente_nombre: name,
                cliente_telefono: phone,
                cliente_email: email,
                direccion_o_notas: notes || "No especificado",
                productos_pedido: orderSummaryText,
                total_pedido: `${totalAmount.toFixed(2).replace('.', ',')} €`,
                fecha_pedido: new Date().toLocaleString('es-ES')
            };

            try {
                const response = await fetch(`https://formsubmit.co/ajax/${ORDERS_RECEIVING_EMAIL}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(emailPayload)
                });

                if (response.ok) {
                    // Éxito: vaciar carrito y mostrar confirmación
                    cart = [];
                    saveCart();
                    checkoutForm.reset();

                    if (successContactMessage) {
                        successContactMessage.innerText = `Nos pondremos en contacto contigo pronto vía ${phone} o ${email} para confirmar los detalles de entrega y pago.`;
                    }
                    switchCartStep('success');
                } else {
                    throw new Error("Respuesta no satisfactoria del servidor");
                }
            } catch (error) {
                console.error("Error enviando el pedido:", error);
                alert("Hubo un pequeño contratiempo al enviar el pedido. Puedes contactarnos directamente al teléfono +34 666 052 494 o reintentarlo en unos instantes.");
            } finally {
                btnSubmitOrder.disabled = false;
                if (btnText) btnText.style.display = 'inline-block';
                if (btnSpinner) btnSpinner.style.display = 'none';
            }
        });
    }

    // Cerrar carrito con tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && cartDrawer && cartDrawer.classList.contains('open')) {
            closeCart();
        }
    });

    // Menú móvil responsive
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('nav-open');
        });
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('nav-open');
            });
        });
    }

    // --- 5. Componentes y Utilidades ---
    const generateProductCard = (product) => {
        let imageContent = '';
        if (product.imagePath) {
            imageContent = `<img src="${product.imagePath}" alt="${product.name}" class="product-img">`;
        } else {
            imageContent = product.imagePlaceholder;
        }
        
        return `
            <div class="product-card">
                <a href="#producto-${product.id}" class="product-card-link">
                    <div class="product-image-container">
                        ${imageContent}
                    </div>
                    <span class="product-category">${product.category}</span>
                    <h3 class="product-title">${product.name}</h3>
                </a>
                <div class="product-price">${product.price.toFixed(2).replace('.', ',')} €</div>
                <button class="add-to-cart-btn" data-id="${product.id}">Añadir al carrito</button>
            </div>
        `;
    };

    const attachCartListeners = () => {
        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const btn = e.target.closest('.add-to-cart-btn');
                if (!btn) return;
                const id = parseInt(btn.getAttribute('data-id'));
                const originalText = btn.innerText;
                btn.innerText = "¡Añadido!";
                btn.style.backgroundColor = "var(--secondary-color)";
                btn.style.color = "var(--white)";
                
                addToCart(id, 1);

                setTimeout(() => {
                    btn.innerText = originalText;
                    btn.style.backgroundColor = "";
                    btn.style.color = "";
                }, 1000);
            });
        });
    };

    // --- 5. Vistas (Views) ---
    const renderHome = () => {
        const topProducts = products.filter(p => [1, 6, 7, 15].includes(p.id)); 
        
        appRoot.innerHTML = `
            <section class="hero">
                <div class="container hero-content">
                    <h1>Medicina Botánica para tu Bienestar</h1>
                    <p>Descubre el poder curativo de la naturaleza con nuestros productos artesanales, formulados con plantas naturales y un profundo respeto por el medio ambiente.</p>
                    <a href="#tienda" class="btn btn-primary" data-route="tienda">Explorar Colección</a>
                </div>
            </section>

            <section class="products-section">
                <div class="container">
                    <div class="section-header">
                        <h2>Selección Destacada</h2>
                        <p>Algunos de nuestros productos favoritos para cuidarte cada día.</p>
                    </div>
                    
                    <div class="carousel-container">
                        <button class="carousel-btn prev-btn">‹</button>
                        <div class="carousel-track" id="featured-carousel">
                            ${topProducts.map(generateProductCard).join('')}
                        </div>
                        <button class="carousel-btn next-btn">›</button>
                    </div>
                    
                    <div style="text-align: center; margin-top: 2rem;">
                        <a href="#tienda" class="btn btn-secondary" data-route="tienda">Ver toda la tienda</a>
                    </div>
                </div>
            </section>

            <section class="about-section">
                <div class="container about-grid">
                    <div class="about-text">
                        <h2>Nuestra Filosofía</h2>
                        <p>En La Rosa del Páramo, nuestra filosofía se basa en utilizar todo lo que nos ofrece la naturaleza, de la forma más natural y pura posible en la fabricación de nuestros productos. Nuestro objetivo es promover un modelo de consumo de medicina y parafarmacia que sea totalmente natural, ético y sostenible.</p>
                    </div>
                    <div class="about-image-placeholder">
                        <img src="assets/filosofia.jpg" alt="Nuestra esencia natural" class="about-img">
                    </div>
                </div>
            </section>
        `;
        attachCartListeners();

        // Inicializar carrusel
        const track = document.getElementById('featured-carousel');
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');

        if(track && prevBtn && nextBtn) {
            // El ancho de una tarjeta + el gap aproximadamente
            const scrollAmount = 300; 
            
            prevBtn.addEventListener('click', () => {
                track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            });
            nextBtn.addEventListener('click', () => {
                track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            });
        }
    };

    const renderStore = () => {
        appRoot.innerHTML = `
            <section class="products-section store-page">
                <div class="container">
                    <div class="section-header">
                        <h2>Nuestra Botica</h2>
                        <p>Explora nuestra gama completa de soluciones naturales.</p>
                    </div>
                    
                    <div class="store-controls">
                        <div class="search-bar">
                            <input type="text" id="searchInput" placeholder="Buscar productos... (ej. dolor, lavanda)">
                        </div>
                        <div class="category-filters">
                            <button class="filter-btn active" data-category="all">Todos</button>
                            <button class="filter-btn" data-category="Infusiones">Infusiones</button>
                            <button class="filter-btn" data-category="Aceites">Aceites</button>
                            <button class="filter-btn" data-category="Higiene">Higiene</button>
                        </div>
                    </div>

                    <div class="product-grid" id="full-product-list">
                        ${products.map(generateProductCard).join('')}
                    </div>
                </div>
            </section>
        `;

        attachCartListeners();

        // Lógica de filtrado
        const searchInput = document.getElementById('searchInput');
        const filterBtns = document.querySelectorAll('.filter-btn');
        const productList = document.getElementById('full-product-list');

        let currentCategory = 'all';
        let currentSearch = '';

        const updateGrid = () => {
            const filtered = products.filter(p => {
                const matchCategory = currentCategory === 'all' || p.category === currentCategory;
                const matchSearch = p.name.toLowerCase().includes(currentSearch.toLowerCase());
                return matchCategory && matchSearch;
            });

            if (filtered.length > 0) {
                productList.innerHTML = filtered.map(generateProductCard).join('');
            } else {
                productList.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: var(--text-muted);">No se han encontrado productos.</p>`;
            }
            attachCartListeners();
        };

        searchInput.addEventListener('input', (e) => {
            currentSearch = e.target.value;
            updateGrid();
        });

        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentCategory = btn.getAttribute('data-category');
                updateGrid();
            });
        });
    };

    const renderProductDetail = (id) => {
        const product = products.find(p => p.id === parseInt(id));
        
        if (!product) {
            appRoot.innerHTML = `<div class="container store-page" style="text-align:center;"><h2>Producto no encontrado</h2><br><a href="#tienda" class="btn btn-secondary">Volver a la tienda</a></div>`;
            return;
        }

        let imageContent = product.imagePath 
            ? `<img src="${product.imagePath}" alt="${product.name}" class="product-detail-img">` 
            : `<div class="product-detail-placeholder">${product.imagePlaceholder}</div>`;

        appRoot.innerHTML = `
            <section class="product-detail-page container">
                <a href="#tienda" class="back-link">← Volver a la tienda</a>
                
                <div class="product-detail-grid">
                    <div class="product-detail-image-wrapper">
                        ${imageContent}
                    </div>
                    
                    <div class="product-detail-info">
                        <span class="product-category">${product.category}</span>
                        <h1>${product.name}</h1>
                        <div class="product-price-large">${product.price.toFixed(2).replace('.', ',')} €</div>
                        
                        <div class="product-description">
                            <h3>Descripción</h3>
                            <p>${product.description || 'Una fórmula natural y artesanal de La Rosa del Páramo, elaborada con el máximo respeto por el medio ambiente.'}</p>
                        </div>
                        
                        ${product.ingredients ? `
                        <div class="product-ingredients">
                            <h3>Ingredientes Botánicos</h3>
                            <p>${product.ingredients}</p>
                        </div>` : ''}
                        
                        <div class="product-actions">
                            <button class="add-to-cart-btn btn-large" data-id="${product.id}">Añadir al carrito</button>
                        </div>
                    </div>
                </div>
            </section>
        `;
        attachCartListeners();
    };

    // --- 6. Enrutador SPA (Router) ---
    const router = () => {
        const hash = window.location.hash;
        
        // Actualizar clase activa en menú
        document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
        
        if (hash.startsWith('#producto-')) {
            const id = hash.split('-')[1];
            renderProductDetail(id);
            window.scrollTo(0, 0);
        } else if (hash === '#tienda') {
            document.querySelector('.nav-links a[href="#tienda"]')?.classList.add('active');
            renderStore();
        } else if (hash === '#nosotros') {
            document.querySelector('.nav-links a[href="#nosotros"]')?.classList.add('active');
            renderHome(); 
            setTimeout(() => {
                const aboutSection = document.querySelector('.about-section');
                if(aboutSection) {
                    window.scrollTo({
                        top: aboutSection.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            }, 50);
        } else if (hash === '#contacto') {
            document.querySelector('.nav-links a[href="#contacto"]')?.classList.add('active');
            renderHome();
            setTimeout(() => {
                const contactSection = document.getElementById('contacto');
                if(contactSection) {
                    window.scrollTo({
                        top: contactSection.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            }, 50);
        } else {
            document.querySelector('.nav-links a[href="#inicio"]')?.classList.add('active');
            renderHome();
            window.scrollTo(0, 0);
        }
    };

    // Listeners para navegación
    window.addEventListener('hashchange', router);
    
    // Delegación de eventos para botones que cambian de ruta manualmente
    document.body.addEventListener('click', (e) => {
        if(e.target.matches('[data-route]')) {
            e.preventDefault();
            window.location.hash = e.target.getAttribute('data-route');
        }
    });

    // Inicializar app y carrito
    renderCartDrawer();
    router();
});
