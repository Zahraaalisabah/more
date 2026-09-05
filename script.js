document.addEventListener("DOMContentLoaded", function () {
    // 1. زر العودة للأعلى
    const backToTopBtn = document.getElementById("backToTop");

    window.addEventListener("scroll", function () {
        if (window.scrollY > 400) {
            backToTopBtn.style.display = "block";
        } else {
            backToTopBtn.style.display = "none";
        }
    });

    backToTopBtn.addEventListener("click", function () {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });

    // 2. تأثيرات الدخول عند التمرير (Intersection Observer)
    const fadeElements = document.querySelectorAll(".fade-in");

    const appearOnScroll = new IntersectionObserver(function (entries, appearOnScroll) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add("appear");
                appearOnScroll.unobserve(entry.target); // إيقاف المراقبة بعد الدخول لأول مرة لتوفير الأداء
            }
        });
    }, {
        threshold: 0.15, // يظهر العنصر عندما يدخل 15% منه في الشاشة
        rootMargin: "0px 0px -50px 0px"
    });

    fadeElements.forEach(element => {
        appearOnScroll.observe(element);
    });
});

document.addEventListener("DOMContentLoaded", function () {
    // ==========================================
    // 1. إدارة سلة التسوق (Cart Management)
    // ==========================================
    let cart = JSON.parse(localStorage.getItem("more_cart")) || [];

    const cartToggle = document.getElementById("cartToggle");
    const cartModal = document.getElementById("cartModal");
    const cartOverlay = document.getElementById("cartOverlay");
    const closeCart = document.getElementById("closeCart");
    const cartCount = document.getElementById("cartCount");
    const cartHeaderCount = document.getElementById("cartHeaderCount");
    const cartItems = document.getElementById("cartItems");
    const cartTotal = document.getElementById("cartTotal");
    const sendCartBtn = document.getElementById("sendCartToWhatsapp");

    // فتح السلة
    function openCartDrawer() {
        if (cartModal && cartOverlay) {
            cartModal.classList.add("open");
            cartOverlay.classList.add("active");
            document.body.style.overflow = "hidden"; // إيقاف التمرير الخلفي
        }
    }

    // إغلاق السلة
    function closeCartDrawer() {
        if (cartModal && cartOverlay) {
            cartModal.classList.remove("open");
            cartOverlay.classList.remove("active");
            document.body.style.overflow = "auto";
        }
    }

    if (cartToggle) cartToggle.addEventListener("click", openCartDrawer);
    if (closeCart) closeCart.addEventListener("click", closeCartDrawer);
    if (cartOverlay) cartOverlay.addEventListener("click", closeCartDrawer);

    // تحديث واجهة السلة بالكامل
    function updateCartUI() {
        const totalItemsCount = cart.reduce((sum, item) => sum + item.qty, 0);
        if (cartCount) cartCount.textContent = totalItemsCount;
        if (cartHeaderCount) cartHeaderCount.textContent = `${totalItemsCount} منتجات`;

        if (!cartItems) return;
        cartItems.innerHTML = "";

        if (cart.length === 0) {
            cartItems.innerHTML = `
                <div class="cart-empty-state">
                    <i class="fa-solid fa-basket-shopping"></i>
                    <p>سلتك فارغة حالياً</p>
                    <small>تصفح المنتجات واطلب فنجان قهوتك المفضل!</small>
                </div>
            `;
            if (cartTotal) cartTotal.textContent = "0 د.ع";
            localStorage.setItem("more_cart", JSON.stringify(cart));
            return;
        }

        let grandTotal = 0;

        cart.forEach((item, index) => {
            const priceNumeric = parseInt(item.price.replace(/[^0-9]/g, '')) || 0;
            const itemTotal = priceNumeric * item.qty;
            grandTotal += itemTotal;

            const cartItemDiv = document.createElement("div");
            cartItemDiv.className = "cart-item";
            cartItemDiv.innerHTML = `
                <img src="${item.image}" alt="${item.title}" class="cart-item-img">
                <div class="cart-item-info">
                    <h4 class="cart-item-title">${item.title}</h4>
                    <div class="cart-item-price">${item.price}</div>
                    <div class="cart-item-controls">
                        <button class="qty-btn" onclick="changeQty(${index}, -1)">-</button>
                        <span class="qty-count">${item.qty}</span>
                        <button class="qty-btn" onclick="changeQty(${index}, 1)">+</button>
                    </div>
                </div>
                <button class="cart-remove-btn" onclick="removeFromCart(${index})" title="حذف">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            `;
            cartItems.appendChild(cartItemDiv);
        });

        if (cartTotal) cartTotal.textContent = grandTotal.toLocaleString() + " د.ع";
        localStorage.setItem("more_cart", JSON.stringify(cart));
    }

    // إضافة منتج للسلة
    window.addToCart = function (title, price, image, subtitle = '') {
        const existingIndex = cart.findIndex(item => item.title === title);
        if (existingIndex > -1) {
            cart[existingIndex].qty += 1;
        } else {
            cart.push({ title, price, image, subtitle, qty: 1 });
        }
        updateCartUI();
        openCartDrawer();
    };

    // تغيير الكمية (+ أو -)
    window.changeQty = function (index, delta) {
        if (cart[index]) {
            cart[index].qty += delta;
            if (cart[index].qty <= 0) {
                cart.splice(index, 1);
            }
            updateCartUI();
        }
    };

    // حذف عنصر
    window.removeFromCart = function (index) {
        cart.splice(index, 1);
        updateCartUI();
    };

    // إرسال الطلب عبر الواتساب
    if (sendCartBtn) {
        sendCartBtn.addEventListener("click", function () {
            if (cart.length === 0) {
                alert("السلة فارغة! قم بإضافة بعض المنتجات أولاً.");
                return;
            }

            let message = "مرحباً متجر MORE ☕\nأرغب بتأكيد الطلب التالي:\n\n";
            cart.forEach((item, i) => {
                message += `${i + 1}. *${item.title}*\n`;
                if(item.subtitle) message += `   (${item.subtitle})\n`;
                message += `   العدد: ${item.qty} | السعر: ${item.price}\n------------------\n`;
            });
            message += `\n*المجموع الكلي:* ${cartTotal ? cartTotal.textContent : ''}`;

            const whatsappNumber = "9647868006090";
            const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, "_blank");
        });
    }

    // ==========================================
    // 2. تحميل المنتجات الديناميكية والتأثيرات
    // ==========================================
    fetch('products.json')
        .then(response => response.json())
        .then(products => {
            const grid = document.querySelector('.products-grid');
            if (grid && products.length > 0) {
                grid.innerHTML = '';
                products.forEach(prod => {
                    const stars = Array(prod.rating || 5).fill('<i class="fa-solid fa-star"></i>').join('');
                    const card = `
                        <div class="product-card">
                            <div class="product-img-wrapper">
                                <img src="${prod.image}" alt="${prod.title}">
                            </div>
                            <div class="rating">
                                ${stars}
                                <span>( ${prod.reviews || 0} )</span>
                            </div>
                            <div class="product-title">${prod.title}</div>
                            <div class="product-subtitle">${prod.subtitle || ''}</div>
                            <div style="text-align: center; font-weight: bold; color: #c5a880; margin: 8px 0; font-size: 16px;">${prod.price}</div>
                            <div class="product-footer" style="justify-content: center; gap: 8px;">
                                <button onclick="addToCart('${prod.title}', '${prod.price}', '${prod.image}', '${prod.subtitle || ''}')" class="btn-order" style="background: #c5a880; color: #000; border: none; padding: 10px 18px; border-radius: 6px; cursor: pointer; font-weight: bold; font-family: inherit; display: flex; align-items: center; gap: 8px;">
                                    <i class="fa-solid fa-cart-plus"></i> إضافة للسلة
                                </button>
                            </div>
                        </div>
                    `;
                    grid.innerHTML += card;
                });
            }
        })
        .catch(() => console.log('يعمل بالمنتجات المحلية الضمنية'));

    // زر العودة للأعلى وتأثير الظهور
    const backToTopBtn = document.getElementById("backToTop");
    if (backToTopBtn) {
        window.addEventListener("scroll", function () {
            backToTopBtn.style.display = window.scrollY > 400 ? "block" : "none";
        });
        backToTopBtn.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    // تشغيل السلة لأول مرة عند التحميل
    updateCartUI();
});







// ==========================================
// لوحة التحكم المتقدمة (رفع الصور + كلمة السر)
// ==========================================

// كلمة السر الافتراضية للوحة التحكم (يمكن تغييرها هنا)
const ADMIN_PASSWORD = "1234";

// حالة تسجيل الدخول للمشرف
let isAdminLoggedIn = false;

// القائمة الافتراضية للمنتجات
const defaultProducts = [
    { title: "Manual Coffee Grinder", subtitle: "طاحونة القهوة اليدوية", price: "25,000 د.ع", image: "images/protect1.png", rating: 5, reviews: 128 },
    { title: "Multi-Styler Hair Tool", subtitle: "جهاز تصفيف الشعر متعدد الملحقات", price: "45,000 د.ع", image: "images/product3.png", rating: 5, reviews: 94 },
    { title: "Professional Hair Dryer", subtitle: "مجفف الشعر الاحترافي", price: "35,000 د.ع", image: "images/product5.png", rating: 5, reviews: 67 },
    { title: "Multi-Styler Hair Tool Pro", subtitle: "جهاز تصفيف الشعر الاحترافي", price: "50,000 د.ع", image: "images/product7.png", rating: 5, reviews: 82 },
    { title: "Coffee Gift Box", subtitle: "باقة هدايا القهوة", price: "40,000 د.ع", image: "images/product8.png", rating: 4, reviews: 81 },
    { title: "Italian Moka Coffee Set", subtitle: "مجموعة الموكا الإيطالية", price: "30,000 د.ع", image: "images/product9.png", rating: 5, reviews: 85 },
    { title: "Wooden Coffee Mill", subtitle: "طاحونة البن الخشبية", price: "28,000 د.ع", image: "images/product10.png", rating: 5, reviews: 112 },
    { title: "Coffee Brewing Kit", subtitle: "عدة تحضير القهوة", price: "60,000 د.ع", image: "images/product11.png", rating: 4, reviews: 77 }
];

function getStoredProducts() {
    const saved = localStorage.getItem("more_store_products");
    return saved ? JSON.parse(saved) : defaultProducts;
}

// عرض المنتجات في المتجر
function renderProductsGrid() {
    const grid = document.querySelector('.products-grid');
    if (!grid) return;

    const products = getStoredProducts();
    grid.innerHTML = '';

    products.forEach((prod, index) => {
        const stars = Array(parseInt(prod.rating) || 5).fill('<i class="fa-solid fa-star"></i>').join('');
        
        // يظهر زر الحذف فقط إذا كان المشرف مسجلاً دخوله
        const deleteBtnHtml = isAdminLoggedIn ? 
            `<button onclick="deleteProduct(${index})" title="حذف المنتج" style="background: rgba(255,0,0,0.15); color: #ff5555; border: none; padding: 10px; border-radius: 6px; cursor: pointer;"><i class="fa-solid fa-trash"></i></button>` : '';

        const card = `
            <div class="product-card">
                <div class="product-img-wrapper">
                    <img src="${prod.image}" alt="${prod.title}" onerror="this.src='images/logo.png'">
                </div>
                <div class="rating">
                    ${stars}
                    <span>( ${prod.reviews || 12} )</span>
                </div>
                <div class="product-title">${prod.title}</div>
                <div class="product-subtitle">${prod.subtitle || ''}</div>
                <div style="text-align: center; font-weight: bold; color: #c5a880; margin: 8px 0; font-size: 16px;">${prod.price}</div>
                <div class="product-footer" style="justify-content: center; gap: 8px;">
                    <button onclick="addToCart('${prod.title}', '${prod.price}', '${prod.image}', '${prod.subtitle || ''}')" class="btn-order" style="background: #c5a880; color: #000; border: none; padding: 10px 18px; border-radius: 6px; cursor: pointer; font-weight: bold; font-family: inherit; display: flex; align-items: center; gap: 8px;">
                        <i class="fa-solid fa-cart-plus"></i> إضافة للسلة
                    </button>
                    ${deleteBtnHtml}
                </div>
            </div>
        `;
        grid.innerHTML += card;
    });
}

// إعداد أحداث لوحة التحكم عند فتح الصفحة
document.addEventListener("DOMContentLoaded", function () {
    renderProductsGrid();

    const openAdminBtn = document.getElementById("openAdminBtn");
    const closeAdminBtn = document.getElementById("closeAdminBtn");
    const adminModal = document.getElementById("adminModal");
    const adminAuthBox = document.getElementById("adminAuthBox");
    const adminPanelContent = document.getElementById("adminPanelContent");
    const loginAdminBtn = document.getElementById("loginAdminBtn");
    const logoutAdminBtn = document.getElementById("logoutAdminBtn");
    const adminPasswordInput = document.getElementById("adminPasswordInput");
    const authErrorMsg = document.getElementById("authErrorMsg");
    
    const adminImageFile = document.getElementById("adminImageFile");
    const imagePreviewContainer = document.getElementById("imagePreviewContainer");
    const imagePreview = document.getElementById("imagePreview");
    let base64ImageString = "";

    // فتح وإغلاق المودال
    if (openAdminBtn) {
        openAdminBtn.addEventListener("click", () => {
            adminModal.style.display = "flex";
            if (!isAdminLoggedIn) {
                adminAuthBox.style.display = "block";
                adminPanelContent.style.display = "none";
            }
        });
    }

    if (closeAdminBtn) closeAdminBtn.addEventListener("click", () => adminModal.style.display = "none");

    // التحقق من كلمة السر
    if (loginAdminBtn) {
        loginAdminBtn.addEventListener("click", function () {
            if (adminPasswordInput.value === ADMIN_PASSWORD) {
                isAdminLoggedIn = true;
                adminAuthBox.style.display = "none";
                adminPanelContent.style.display = "block";
                authErrorMsg.style.display = "none";
                adminPasswordInput.value = "";
                renderProductsGrid(); // إعادة التحديث لإظهار أزرار الحذف للمشرف
            } else {
                authErrorMsg.style.display = "block";
            }
        });
    }

    // تسجيل الخروج
    if (logoutAdminBtn) {
        logoutAdminBtn.addEventListener("click", function () {
            isAdminLoggedIn = false;
            adminAuthBox.style.display = "block";
            adminPanelContent.style.display = "none";
            renderProductsGrid();
            adminModal.style.display = "none";
        });
    }

    // معالجة اختيار صورة من الاستوديو/الموبايل
    if (adminImageFile) {
        adminImageFile.addEventListener("change", function (e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (event) {
                    base64ImageString = event.target.result;
                    imagePreview.src = base64ImageString;
                    imagePreviewContainer.style.display = "block";
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // إضافة المنتج عند إرسال النماذج
    const addProductForm = document.getElementById("addProductForm");
    if (addProductForm) {
        addProductForm.addEventListener("submit", function (e) {
            e.preventDefault();

            if (!base64ImageString) {
                alert("يرجى اختيار صورة للمنتج من جهازك أولاً");
                return;
            }

            const newProduct = {
                title: document.getElementById("adminTitle").value.trim(),
                subtitle: document.getElementById("adminSubtitle").value.trim(),
                price: document.getElementById("adminPrice").value.trim(),
                rating: parseInt(document.getElementById("adminRating").value) || 5,
                image: base64ImageString, // حفظ الصورة المشفرة
                reviews: Math.floor(Math.random() * 30) + 10
            };

            const products = getStoredProducts();
            products.unshift(newProduct);

            localStorage.setItem("more_store_products", JSON.stringify(products));
            renderProductsGrid();

            // إعادة ضبط النموذج
            addProductForm.reset();
            imagePreviewContainer.style.display = "none";
            base64ImageString = "";
            adminModal.style.display = "none";
            alert("تم رفع الصورة وإضافة المنتج للمتجر بنجاح! 🎉");
        });
    }

    // إعادة القائمة الافتراضية
    const resetProductsBtn = document.getElementById("resetProductsBtn");
    if (resetProductsBtn) {
        resetProductsBtn.addEventListener("click", function () {
            if (confirm("هل تريد مسح المنتجات المضافة وإرجاع قائمة المتجر الافتراضية؟")) {
                localStorage.removeItem("more_store_products");
                renderProductsGrid();
                adminModal.style.display = "none";
            }
        });
    }
});

// حذف منتج (متاح فقط للمشرف)
window.deleteProduct = function (index) {
    if (confirm("هل تريد حذف هذا المنتج من المتجر؟")) {
        const products = getStoredProducts();
        products.splice(index, 1);
        localStorage.setItem("more_store_products", JSON.stringify(products));
        renderProductsGrid();
    }
};