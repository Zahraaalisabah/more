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
// 1. إعداد الاتصال بـ Supabase
// ==========================================
const SUPABASE_URL = "https://maxrlrhelqgszjxhizgl.supabase.co";
const SUPABASE_KEY = "sb_publishable_E71VdNUu5WqVdLlBt6Z8kg_snM-MUdj"; // استبدل هذا النص بالمفتاح

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ==========================================
// 2. دالة إضافة ونشر المنتج الجديد
// ==========================================
document.getElementById("addProductForm")?.addEventListener("submit", async function (e) {
    e.preventDefault();

    const title = document.getElementById("adminTitle").value;
    const subtitle = document.getElementById("adminSubtitle").value;
    const price = document.getElementById("adminPrice").value;
    const rating = document.getElementById("adminRating").value;
    const fileInput = document.getElementById("adminImageFile");
    const submitBtn = e.target.querySelector("button[type='submit']");

    if (!fileInput.files[0]) {
        alert("يرجى اختيار صورة للمنتج");
        return;
    }

    const file = fileInput.files[0];
    // تنظيف اسم الملف وإضافة طابع زمني لتجنب تكرار أسماء الصور
    const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;

    // تغيير حالة الزر أثناء الرفع
    submitBtn.disabled = true;
    submitBtn.innerText = "جاري رفع الصورة والمنتج...";

    try {
        // أ) رفع الصورة إلى حاوية Storage
        const { data: imgData, error: imgError } = await supabase.storage
            .from('products')
            .upload(fileName, file);

        if (imgError) throw imgError;

        // ب) الحصول على الرابط العام المباشر للصورة
        const { data: urlData } = supabase.storage
            .from('products')
            .getPublicUrl(fileName);

        const imageUrl = urlData.publicUrl;

        // ج) حفظ تفاصيل المنتج في جدول قاعدة البيانات
        const { error: dbError } = await supabase
            .from('products')
            .insert([
                { 
                    title: title, 
                    subtitle: subtitle, 
                    price: price, 
                    rating: rating, 
                    image: imageUrl 
                }
            ]);

        if (dbError) throw dbError;

        alert("تمت إضافة المنتج بنجاح وظهر لجميع الزوار!");
        
        // إعادة إعادة تعيين النموذج وإغلاق النافذة
        document.getElementById("addProductForm").reset();
        const modal = document.getElementById("adminModal");
        if (modal) modal.style.display = "none";

        // إعادة تحميل المنتجات فوراً في الصفحة
        loadSupabaseProducts();

    } catch (error) {
        console.error("حدث خطأ أثناء الإضافة:", error);
        alert("فشل رفع المنتج: " + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> حفظ ونشر المنتج';
    }
});

// ==========================================
// 3. دالة جلب المنتجات وعرضها للزوار تلقائياً
// ==========================================
async function loadSupabaseProducts() {
    const productsGrid = document.querySelector(".products-grid") || document.querySelector(".products-container");
    if (!productsGrid) return;

    try {
        // جلب جميع المنتجات مرتبة من الأحدث إلى الأقدم
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        products.forEach(product => {
            // تجنب تكرار رسم الكارت إذا كان معروضاً سابقاً
            if (document.getElementById(`prod-${product.id}`)) return;

            const productCard = document.createElement("div");
            productCard.className = "product-card";
            productCard.id = `prod-${product.id}`;

            // إنشاء نجوم التقييم بناءً على العدد المخزن
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
                    <button onclick="addToCart('${product.title}', '${product.price}', '${product.image}', '${product.subtitle}')" class="btn-order" style="background: #c5a880; color: #000; border: none; padding: 10px 18px; border-radius: 6px; cursor: pointer; font-weight: bold; font-family: inherit; display: flex; align-items: center; gap: 8px;">
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

// تشغيل جلب البيانات فور تحميل الصفحة
document.addEventListener("DOMContentLoaded", loadSupabaseProducts);
