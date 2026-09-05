// ==========================================
// 1. إعداد الاتصال بـ Supabase
// ==========================================
const SUPABASE_URL = "https://maxrlrhelqgszjxhizgl.supabase.co";
// استخدم مفتاح anon public الخاص بمشروعك هنا
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1heHJscmhlbHFnc3pqeGhpemdscyIsInJvbGUiOiJhb24iLCJpYXQiOjE3MDkyMTU2MDAsImV4cCI6MjAyNDc5MTYwMH0.example"; 

let supabase = null;
if (window.supabase) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

document.addEventListener("DOMContentLoaded", function () {

    // ==========================================
    // 2. زر العودة للأعلى والتمرير
    // ==========================================
    const backToTopBtn = document.getElementById("backToTop");
    if (backToTopBtn) {
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
    }

    // تأثيرات الظهور (Intersection Observer)
    const fadeElements = document.querySelectorAll(".fade-in");
    const appearOnScroll = new IntersectionObserver(function (entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("appear");
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    });

    fadeElements.forEach(element => {
        appearOnScroll.observe(element);
    });

    // ==========================================
    // 3. إدارة سلة التسوق (Cart Management)
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

    function openCartDrawer() {
        if (cartModal && cartOverlay) {
            cartModal.classList.add("open");
            cartOverlay.classList.add("active");
            document.body.style.overflow = "hidden";
        }
    }

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

    function updateCartUI() {
        const totalItemsCount = cart.reduce((sum, item) => sum + item.qty, 0);
        if (cartCount) cartCount.textContent = totalItemsCount;
        if (cartHeaderCount) cartHeaderCount.textContent = `${totalItemsCount} منتجات`;

        if (!cartItems) return;
        cartItems.innerHTML = "";

        if (cart.length === 0) {
            cartItems.innerHTML = `
                <div class="cart-empty-state" style="text-align: center; padding: 30px; color: #888;">
                    <i class="fa-solid fa-basket-shopping" style="font-size: 40px; margin-bottom: 10px; color: #c5a880;"></i>
                    <p style="margin: 5px 0; font-weight: bold;">سلتك فارغة حالياً</p>
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

    // إتاحة الدوال للنافذة العامة
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

    window.changeQty = function (index, delta) {
        if (cart[index]) {
            cart[index].qty += delta;
            if (cart[index].qty <= 0) {
                cart.splice(index, 1);
            }
            updateCartUI();
        }
    };

    window.removeFromCart = function (index) {
        cart.splice(index, 1);
        updateCartUI();
    };

    if (sendCartBtn) {
        sendCartBtn.addEventListener("click", function () {
            if (cart.length === 0) {
                alert("السلة فارغة! قم بإضافة بعض المنتجات أولاً.");
                return;
            }

            let message = "مرحباً متجر MORE ☕\nأرغب بتأكيد الطلب التالي:\n\n";
            cart.forEach((item, i) => {
                message += `${i + 1}. *${item.title}*\n`;
                if (item.subtitle) message += `   (${item.subtitle})\n`;
                message += `   العدد: ${item.qty} | السعر: ${item.price}\n------------------\n`;
            });
            message += `\n*المجموع الكلي:* ${cartTotal ? cartTotal.textContent : ''}`;

            const whatsappNumber = "9647868006090";
            const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, "_blank");
        });
    }

    updateCartUI();

    // ==========================================
    // 4. إدارة لوحة التحكّم (Admin Modal & Auth)
    // ==========================================
    const openAdminBtn = document.getElementById("openAdminBtn");
    const closeAdminBtn = document.getElementById("closeAdminBtn");
    const adminModal = document.getElementById("adminModal");
    const loginAdminBtn = document.getElementById("loginAdminBtn");
    const adminPasswordInput = document.getElementById("adminPasswordInput");
    const adminAuthBox = document.getElementById("adminAuthBox");
    const adminPanelContent = document.getElementById("adminPanelContent");
    const authErrorMsg = document.getElementById("authErrorMsg");
    const logoutAdminBtn = document.getElementById("logoutAdminBtn");
    const fileInput = document.getElementById("adminImageFile");
    const imagePreview = document.getElementById("imagePreview");
    const imagePreviewContainer = document.getElementById("imagePreviewContainer");

    const ADMIN_PASSWORD = "123"; // استبدلها بكلمة سر المشرف المطلوبة

    if (openAdminBtn) {
        openAdminBtn.addEventListener("click", () => {
            adminModal.style.display = "flex";
        });
    }

    if (closeAdminBtn) {
        closeAdminBtn.addEventListener("click", () => {
            adminModal.style.display = "none";
        });
    }

    if (loginAdminBtn) {
        loginAdminBtn.addEventListener("click", () => {
            if (adminPasswordInput.value === ADMIN_PASSWORD) {
                adminAuthBox.style.display = "none";
                adminPanelContent.style.display = "block";
                authErrorMsg.style.display = "none";
                adminPasswordInput.value = "";
            } else {
                authErrorMsg.style.display = "block";
            }
        });
    }

    if (logoutAdminBtn) {
        logoutAdminBtn.addEventListener("click", () => {
            adminPanelContent.style.display = "none";
            adminAuthBox.style.display = "block";
        });
    }

    // معاينة الصورة عند الاختيار
    if (fileInput) {
        fileInput.addEventListener("change", function () {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    imagePreview.src = e.target.result;
                    imagePreviewContainer.style.display = "block";
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // ==========================================
    // 5. رفع المنتجات إلى Supabase
    // ==========================================
    const addProductForm = document.getElementById("addProductForm");
    if (addProductForm) {
        addProductForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            if (!supabase) {
                alert("لم يتم الاتصال بقاعدة البيانات بشكل صحيح.");
                return;
            }

            const title = document.getElementById("adminTitle").value;
            const subtitle = document.getElementById("adminSubtitle").value;
            const price = document.getElementById("adminPrice").value;
            const rating = document.getElementById("adminRating").value;
            const submitBtn = e.target.querySelector("button[type='submit']");

            if (!fileInput.files[0]) {
                alert("يرجى اختيار صورة للمنتج");
                return;
            }

            const file = fileInput.files[0];
            const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const fileName = `${Date.now()}_${cleanFileName}`;

            submitBtn.disabled = true;
            submitBtn.innerText = "جاري رفع الصورة والمنتج...";

            try {
                // 1. رفع الصورة إلى الحاوية (Storage Bucket)
                const { data: imgData, error: imgError } = await supabase.storage
                    .from('products')
                    .upload(fileName, file);

                if (imgError) throw imgError;

                // 2. الحصول على رابط الصورة
                const { data: urlData } = supabase.storage
                    .from('products')
                    .getPublicUrl(fileName);

                const imageUrl = urlData.publicUrl;

                // 3. إضافة البيانات إلى الجدول
                const { error: dbError } = await supabase
                    .from('products')
                    .insert([
                        { title, subtitle, price, rating, image: imageUrl }
                    ]);

                if (dbError) throw dbError;

                alert("تمت إضافة المنتج بنجاح وظهر لجميع الزوار!");

                addProductForm.reset();
                if (imagePreviewContainer) imagePreviewContainer.style.display = "none";
                if (adminModal) adminModal.style.display = "none";

                loadSupabaseProducts();

            } catch (error) {
                console.error("حدث خطأ أثناء الإضافة:", error);
                alert("فشل رفع المنتج: " + (error.message || error.error_description || "خطأ غير معروف"));
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> حفظ ونشر المنتج';
            }
        });
    }

    // ==========================================
    // 6. جلب المنتجات وعرضها في الصفحة
    // ==========================================
    async function loadSupabaseProducts() {
        if (!supabase) return;

        const productsGrid = document.querySelector(".products-grid");
        if (!productsGrid) return;

        try {
            const { data: products, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            products.forEach(product => {
                if (document.getElementById(`prod-${product.id}`)) return;

                const productCard = document.createElement("div");
                productCard.className = "product-card";
                productCard.id = `prod-${product.id}`;

                let starsHTML = '';
                const ratingCount = parseInt(product.rating) || 5;
                for (let i = 0; i < ratingCount; i++) {
                    starsHTML += '<i class="fa-solid fa-star"></i>';
                }

                productCard.innerHTML = `
                    <div class="product-img-wrapper">
                        <img src="${product.image}" alt="${product.title}">
                    </div>
                    <div class="rating">
                        ${starsHTML}
                    </div>
                    <div class="product-title">${product.title}</div>
                    <div class="product-subtitle">${product.subtitle}</div>
                    <div class="product-price" style="text-align: center; font-weight: bold; color: #c5a880; margin: 8px 0; font-size: 16px;">${product.price}</div>
                    <div class="product-footer" style="justify-content: center;">
                        <button onclick="addToCart('${product.title.replace(/'/g, "\\'")}', '${product.price}', '${product.image}', '${product.subtitle.replace(/'/g, "\\'")}')" class="btn-order" style="background: #c5a880; color: #000; border: none; padding: 10px 18px; border-radius: 6px; cursor: pointer; font-weight: bold; font-family: inherit; display: flex; align-items: center; gap: 8px;">
                            <i class="fa-solid fa-cart-plus"></i> إضافة للسلة
                        </button>
                    </div>
                `;

                productsGrid.appendChild(productCard);
            });
        } catch (err) {
            console.error("خطأ أثناء جلب المنتجات من Supabase:", err);
        }
    }

    // جلب المنتجات فور فتح الصفحة
    loadSupabaseProducts();
});
