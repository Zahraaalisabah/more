// ==========================================
// MORE - JavaScript
// إدارة الموقع + السلة + لوحة التحكم + Supabase
// ==========================================


// ==========================================
// 1. إعداد الاتصال بـ Supabase
// ==========================================

const SUPABASE_URL = "https://maxrlrhelqgszjxhizgl.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_E71VdNUu5WqVdLlBt6Z8kg_snM-MUdj";

let supabaseClient = null;


// محاولة إنشاء اتصال Supabase
try {

    if (
        window.supabase &&
        typeof window.supabase.createClient === "function"
    ) {

        supabaseClient = window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY
        );

        console.log("✅ Supabase connected successfully");

    } else {

        console.warn(
            "⚠️ Supabase library not loaded"
        );

    }

} catch (error) {

    console.error(
        "❌ Supabase connection error:",
        error
    );

}


// ==========================================
// 2. تشغيل الموقع بعد تحميل الصفحة
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    console.log("✅ MORE website loaded");


    // ==========================================
    // 3. زر العودة للأعلى
    // ==========================================

    const backToTopBtn =
        document.getElementById("backToTop");


    if (backToTopBtn) {

        window.addEventListener(
            "scroll",
            function () {

                if (window.scrollY > 400) {

                    backToTopBtn.style.display =
                        "block";

                } else {

                    backToTopBtn.style.display =
                        "none";

                }

            }
        );


        backToTopBtn.addEventListener(
            "click",
            function () {

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            }
        );

    }


    // ==========================================
    // 4. تأثيرات الظهور
    // ==========================================

    if ("IntersectionObserver" in window) {

        const fadeElements =
            document.querySelectorAll(".fade-in");


        const appearOnScroll =
            new IntersectionObserver(
                function (entries, observer) {

                    entries.forEach(
                        function (entry) {

                            if (
                                entry.isIntersecting
                            ) {

                                entry.target.classList.add(
                                    "appear"
                                );

                                observer.unobserve(
                                    entry.target
                                );

                            }

                        }
                    );

                },
                {
                    threshold: 0.15,
                    rootMargin:
                        "0px 0px -50px 0px"
                }
            );


        fadeElements.forEach(
            function (element) {

                appearOnScroll.observe(
                    element
                );

            }
        );

    }


    // ==========================================
    // 5. إدارة سلة التسوق
    // ==========================================

    let cart = [];


    try {

        cart =
            JSON.parse(
                localStorage.getItem(
                    "more_cart"
                )
            ) || [];

    } catch (error) {

        console.error(
            "❌ Cart loading error:",
            error
        );

        cart = [];

    }


    const cartToggle =
        document.getElementById(
            "cartToggle"
        );


    const cartModal =
        document.getElementById(
            "cartModal"
        );


    const cartOverlay =
        document.getElementById(
            "cartOverlay"
        );


    const closeCart =
        document.getElementById(
            "closeCart"
        );


    const cartCount =
        document.getElementById(
            "cartCount"
        );


    const cartHeaderCount =
        document.getElementById(
            "cartHeaderCount"
        );


    const cartItems =
        document.getElementById(
            "cartItems"
        );


    const cartTotal =
        document.getElementById(
            "cartTotal"
        );


    const sendCartBtn =
        document.getElementById(
            "sendCartToWhatsapp"
        );


    // ==========================================
    // فتح السلة
    // ==========================================

    function openCartDrawer() {

        if (
            !cartModal ||
            !cartOverlay
        ) {

            return;

        }


        cartModal.classList.add(
            "open"
        );


        cartOverlay.classList.add(
            "active"
        );


        document.body.style.overflow =
            "hidden";

    }


    // ==========================================
    // إغلاق السلة
    // ==========================================

    function closeCartDrawer() {

        if (
            !cartModal ||
            !cartOverlay
        ) {

            return;

        }


        cartModal.classList.remove(
            "open"
        );


        cartOverlay.classList.remove(
            "active"
        );


        document.body.style.overflow =
            "auto";

    }


    if (cartToggle) {

        cartToggle.addEventListener(
            "click",
            openCartDrawer
        );

    }


    if (closeCart) {

        closeCart.addEventListener(
            "click",
            closeCartDrawer
        );

    }


    if (cartOverlay) {

        cartOverlay.addEventListener(
            "click",
            closeCartDrawer
        );

    }


    // ==========================================
    // تحديث واجهة السلة
    // ==========================================

    function updateCartUI() {

        const totalItemsCount =
            cart.reduce(
                function (sum, item) {

                    return (
                        sum +
                        (
                            Number(item.qty) ||
                            0
                        )
                    );

                },
                0
            );


        if (cartCount) {

            cartCount.textContent =
                totalItemsCount;

        }


        if (cartHeaderCount) {

            cartHeaderCount.textContent =
                `${totalItemsCount} منتجات`;

        }


        if (!cartItems) {

            return;

        }


        cartItems.innerHTML = "";


        // ==========================================
        // السلة فارغة
        // ==========================================

        if (cart.length === 0) {

            cartItems.innerHTML = `

                <div
                    class="cart-empty-state"
                    style="
                        text-align:center;
                        padding:30px;
                        color:#888;
                    "
                >

                    <i
                        class="fa-solid fa-basket-shopping"
                        style="
                            font-size:40px;
                            margin-bottom:10px;
                            color:#c5a880;
                        "
                    ></i>

                    <p
                        style="
                            margin:5px 0;
                            font-weight:bold;
                        "
                    >
                        سلتك فارغة حالياً
                    </p>

                    <small>
                        تصفح المنتجات واطلب فنجان قهوتك المفضل!
                    </small>

                </div>

            `;


            if (cartTotal) {

                cartTotal.textContent =
                    "0 د.ع";

            }


            localStorage.setItem(
                "more_cart",
                JSON.stringify(cart)
            );


            return;

        }


        // ==========================================
        // حساب مجموع السلة
        // ==========================================

        let grandTotal = 0;


        cart.forEach(
            function (item, index) {

                const priceNumeric =
                    parseInt(
                        String(
                            item.price || ""
                        ).replace(
                            /[^0-9]/g,
                            ""
                        )
                    ) || 0;


                const quantity =
                    Number(item.qty) || 1;


                const itemTotal =
                    priceNumeric *
                    quantity;


                grandTotal +=
                    itemTotal;


                const cartItemDiv =
                    document.createElement(
                        "div"
                    );


                cartItemDiv.className =
                    "cart-item";


                cartItemDiv.innerHTML = `

                    <img
                        src="${item.image || ""}"
                        alt="${item.title || ""}"
                        class="cart-item-img"
                    >

                    <div
                        class="cart-item-info"
                    >

                        <h4
                            class="cart-item-title"
                        >
                            ${item.title || ""}
                        </h4>

                        <div
                            class="cart-item-price"
                        >
                            ${item.price || ""}
                        </div>

                        <div
                            class="cart-item-controls"
                        >

                            <button
                                class="qty-btn"
                                onclick="changeQty(${index}, -1)"
                            >
                                -
                            </button>

                            <span
                                class="qty-count"
                            >
                                ${quantity}
                            </span>

                            <button
                                class="qty-btn"
                                onclick="changeQty(${index}, 1)"
                            >
                                +
                            </button>

                        </div>

                    </div>

                    <button
                        class="cart-remove-btn"
                        onclick="removeFromCart(${index})"
                        title="حذف"
                    >

                        <i
                            class="fa-solid fa-trash-can"
                        ></i>

                    </button>

                `;


                cartItems.appendChild(
                    cartItemDiv
                );

            }
        );


        if (cartTotal) {

            cartTotal.textContent =
                grandTotal.toLocaleString() +
                " د.ع";

        }


        localStorage.setItem(
            "more_cart",
            JSON.stringify(cart)
        );

    }


    // ==========================================
    // إضافة منتج للسلة
    // ==========================================

    window.addToCart =
        function (
            title,
            price,
            image,
            subtitle = ""
        ) {

            const existingIndex =
                cart.findIndex(
                    function (item) {

                        return (
                            item.title ===
                            title
                        );

                    }
                );


            if (
                existingIndex >
                -1
            ) {

                cart[
                    existingIndex
                ].qty += 1;

            } else {

                cart.push({

                    title:
                        title,

                    price:
                        price,

                    image:
                        image,

                    subtitle:
                        subtitle,

                    qty:
                        1

                });

            }


            updateCartUI();

            openCartDrawer();

        };


    // ==========================================
    // زيادة / تقليل الكمية
    // ==========================================

    window.changeQty =
        function (
            index,
            delta
        ) {

            if (
                !cart[index]
            ) {

                return;

            }


            cart[index].qty +=
                delta;


            if (
                cart[index].qty <=
                0
            ) {

                cart.splice(
                    index,
                    1
                );

            }


            updateCartUI();

        };


    // ==========================================
    // حذف منتج من السلة
    // ==========================================

    window.removeFromCart =
        function (index) {

            if (
                !cart[index]
            ) {

                return;

            }


            cart.splice(
                index,
                1
            );


            updateCartUI();

        };


    // ==========================================
    // إرسال الطلب للواتساب
    // ==========================================

    if (sendCartBtn) {

        sendCartBtn.addEventListener(
            "click",
            function () {

                if (
                    cart.length ===
                    0
                ) {

                    alert(
                        "السلة فارغة! قم بإضافة بعض المنتجات أولاً."
                    );

                    return;

                }


                let message =
                    "مرحباً متجر MORE ☕\n" +
                    "أرغب بتأكيد الطلب التالي:\n\n";


                cart.forEach(
                    function (
                        item,
                        i
                    ) {

                        message +=
                            `${i + 1}. *${item.title}*\n`;


                        if (
                            item.subtitle
                        ) {

                            message +=
                                `   (${item.subtitle})\n`;

                        }


                        message +=
                            `   العدد: ${item.qty} | السعر: ${item.price}\n`;


                        message +=
                            "------------------\n";

                    }
                );


                message +=
                    `\n*المجموع الكلي:* ${
                        cartTotal
                            ? cartTotal.textContent
                            : ""
                    }`;


                const whatsappNumber =
                    "9647868006090";


                const whatsappUrl =
                    `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                        message
                    )}`;


                window.open(
                    whatsappUrl,
                    "_blank"
                );

            }
        );

    }


    updateCartUI();


    // ==========================================
    // 6. لوحة التحكم
    // ==========================================

    const openAdminBtn =
        document.getElementById(
            "openAdminBtn"
        );


    const closeAdminBtn =
        document.getElementById(
            "closeAdminBtn"
        );


    const adminModal =
        document.getElementById(
            "adminModal"
        );


    const loginAdminBtn =
        document.getElementById(
            "loginAdminBtn"
        );


    const adminPasswordInput =
        document.getElementById(
            "adminPasswordInput"
        );


    const adminAuthBox =
        document.getElementById(
            "adminAuthBox"
        );


    const adminPanelContent =
        document.getElementById(
            "adminPanelContent"
        );


    const authErrorMsg =
        document.getElementById(
            "authErrorMsg"
        );


    const logoutAdminBtn =
        document.getElementById(
            "logoutAdminBtn"
        );


    const fileInput =
        document.getElementById(
            "adminImageFile"
        );


    const imagePreview =
        document.getElementById(
            "imagePreview"
        );


    const imagePreviewContainer =
        document.getElementById(
            "imagePreviewContainer"
        );


    // ==========================================
    // كلمة سر لوحة التحكم
    // ==========================================

    const ADMIN_PASSWORD =
        "123";


    // ==========================================
    // فتح لوحة التحكم
    // ==========================================

    if (openAdminBtn) {

        openAdminBtn.addEventListener(
            "click",
            function () {

                console.log(
                    "✅ Admin button clicked"
                );


                if (adminModal) {

                    adminModal.style.display =
                        "flex";

                }

            }
        );

    } else {

        console.error(
            "❌ openAdminBtn not found"
        );

    }


    // ==========================================
    // إغلاق لوحة التحكم
    // ==========================================

    if (closeAdminBtn) {

        closeAdminBtn.addEventListener(
            "click",
            function () {

                if (adminModal) {

                    adminModal.style.display =
                        "none";

                }

            }
        );

    }


    // ==========================================
    // تسجيل دخول المشرف
    // ==========================================

    if (loginAdminBtn) {

        loginAdminBtn.addEventListener(
            "click",
            function () {

                if (
                    !adminPasswordInput
                ) {

                    return;

                }


                if (
                    adminPasswordInput.value ===
                    ADMIN_PASSWORD
                ) {

                    if (
                        adminAuthBox
                    ) {

                        adminAuthBox.style.display =
                            "none";

                    }


                    if (
                        adminPanelContent
                    ) {

                        adminPanelContent.style.display =
                            "block";

                    }


                    if (
                        authErrorMsg
                    ) {

                        authErrorMsg.style.display =
                            "none";

                    }


                    adminPasswordInput.value =
                        "";

                } else {

                    if (
                        authErrorMsg
                    ) {

                        authErrorMsg.style.display =
                            "block";

                    }

                }

            }
        );

    }


    // ==========================================
    // السماح بالضغط على Enter لكلمة السر
    // ==========================================

    if (adminPasswordInput) {

        adminPasswordInput.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key ===
                    "Enter"
                ) {

                    event.preventDefault();

                    if (loginAdminBtn) {

                        loginAdminBtn.click();

                    }

                }

            }
        );

    }


    // ==========================================
    // تسجيل الخروج
    // ==========================================

    if (logoutAdminBtn) {

        logoutAdminBtn.addEventListener(
            "click",
            function () {

                if (
                    adminPanelContent
                ) {

                    adminPanelContent.style.display =
                        "none";

                }


                if (
                    adminAuthBox
                ) {

                    adminAuthBox.style.display =
                        "block";

                }

            }
        );

    }


    // ==========================================
    // معاينة صورة المنتج
    // ==========================================

    if (fileInput) {

        fileInput.addEventListener(
            "change",
            function () {

                const file =
                    this.files[0];


                if (!file) {

                    return;

                }


                const reader =
                    new FileReader();


                reader.onload =
                    function (event) {

                        if (
                            imagePreview
                        ) {

                            imagePreview.src =
                                event.target.result;

                        }


                        if (
                            imagePreviewContainer
                        ) {

                            imagePreviewContainer.style.display =
                                "block";

                        }

                    };


                reader.readAsDataURL(
                    file
                );

            }
        );

    }


    // ==========================================
    // 7. إضافة منتج جديد إلى Supabase
    // ==========================================

    const addProductForm =
        document.getElementById(
            "addProductForm"
        );


    if (addProductForm) {

        addProductForm.addEventListener(
            "submit",
            async function (e) {

                e.preventDefault();


                // التأكد من وجود Supabase
                if (
                    !supabaseClient
                ) {

                    alert(
                        "لم يتم الاتصال بقاعدة البيانات.\nتأكد من تحميل مكتبة Supabase."
                    );

                    return;

                }


                const titleInput =
                    document.getElementById(
                        "adminTitle"
                    );


                const subtitleInput =
                    document.getElementById(
                        "adminSubtitle"
                    );


                const priceInput =
                    document.getElementById(
                        "adminPrice"
                    );


                const ratingInput =
                    document.getElementById(
                        "adminRating"
                    );


                const title =
                    titleInput
                        ? titleInput.value.trim()
                        : "";


                const subtitle =
                    subtitleInput
                        ? subtitleInput.value.trim()
                        : "";


                const price =
                    priceInput
                        ? priceInput.value.trim()
                        : "";


                const rating =
                    ratingInput
                        ? ratingInput.value
                        : "5";


                const submitBtn =
                    e.target.querySelector(
                        "button[type='submit']"
                    );


                // التأكد من اختيار الصورة
                if (
                    !fileInput ||
                    !fileInput.files[0]
                ) {

                    alert(
                        "يرجى اختيار صورة للمنتج"
                    );

                    return;

                }


                const file =
                    fileInput.files[0];


                const cleanFileName =
                    file.name.replace(
                        /[^a-zA-Z0-9.-]/g,
                        "_"
                    );


                const fileName =
                    `${Date.now()}_${cleanFileName}`;


                if (submitBtn) {

                    submitBtn.disabled =
                        true;


                    submitBtn.innerText =
                        "جاري رفع الصورة والمنتج...";

                }


                try {

                    // ==================================
                    // رفع الصورة إلى Storage
                    // ==================================

                    const {
                        error: imgError
                    } =
                        await supabaseClient
                            .storage
                            .from("more")
                            .upload(
                                fileName,
                                file
                            );


                    if (
                        imgError
                    ) {

                        throw imgError;

                    }


                    // ==================================
                    // الحصول على رابط الصورة
                    // ==================================

                    const {
                        data: urlData
                    } =
                        supabaseClient
                            .storage
                           .from("more")
                            .getPublicUrl(
                                fileName
                            );


                    const imageUrl =
                        urlData.publicUrl;


                    // ==================================
                    // حفظ المنتج داخل جدول products
                    // ==================================

                    const {
                        error: dbError
                    } =
                        await supabaseClient
                            .from("More")
                            .insert([
                                {

                                    title:
                                        title,

                                    subtitle:
                                        subtitle,

                                    price:
                                        price,

                                    rating:
                                        parseInt(
                                            rating
                                        ) || 5,

                                    image: imageUrl,
                                    
                                    is_active:
                                        true

                                }
                            ]);


                    if (
                        dbError
                    ) {

                        throw dbError;

                    }


                    // ==================================
                    // نجاح
                    // ==================================

                    alert(
                        "تمت إضافة المنتج بنجاح وظهر لجميع الزوار!"
                    );


                    // تفريغ الفورم
                    addProductForm.reset();


                    // إخفاء المعاينة
                    if (
                        imagePreviewContainer
                    ) {

                        imagePreviewContainer.style.display =
                            "none";

                    }


                    // إغلاق لوحة التحكم
                    if (
                        adminModal
                    ) {

                        adminModal.style.display =
                            "none";

                    }


                    // تحميل المنتجات من جديد
                    loadSupabaseProducts();


                } catch (error) {

                    console.error(
                        "❌ Supabase error:",
                        error
                    );


                    alert(
                        "فشل رفع المنتج:\n\n" +
                        (
                            error.message ||
                            error.error_description ||
                            "خطأ غير معروف"
                        )
                    );


                } finally {

                    if (
                        submitBtn
                    ) {

                        submitBtn.disabled =
                            false;


                        submitBtn.innerHTML =
                            '<i class="fa-solid fa-check"></i> حفظ ونشر المنتج';

                    }

                }

            }
        );

    }


    // ==========================================
    // 8. جلب المنتجات من Supabase
    // ==========================================

    async function loadSupabaseProducts() {

        // إذا Supabase غير متصل
        // لا نسوي أي تغيير بالموقع

        if (
            !supabaseClient
        ) {

            console.warn(
                "⚠️ Supabase غير متصل - المنتجات الأصلية ستبقى كما هي."
            );

            return;

        }


        const productsGrid =
            document.querySelector(
                ".products-grid"
            );


        if (
            !productsGrid
        ) {

            return;

        }


        try {

            const {
                data: products,
                error
            } =
                await supabaseClient
                    .from("More")
                    .select("*")
                    .eq(
                        "is_active",
                        true
                    )
                    .order(
                        "created_at",
                        {
                            ascending: false
                        }
                    );


            if (
                error
            ) {

                throw error;

            }


            if (
                !products ||
                products.length === 0
            ) {

                console.log(
                    "ℹ️ لا توجد منتجات في Supabase حالياً."
                );

                return;

            }


            // ==========================================
            // إضافة المنتجات الجديدة بدون حذف الأصلية
            // ==========================================

            products.forEach(
                function (product) {

                    // منع التكرار
                    const existingProduct =
                        document.getElementById(
                            `supabase-prod-${product.id}`
                        );


                    if (
                        existingProduct
                    ) {

                        return;

                    }


                    const productCard =
                        document.createElement(
                            "div"
                        );


                    productCard.className =
                        "product-card";


                    productCard.id =
                        `supabase-prod-${product.id}`;


                    // ==================================
                    // النجوم
                    // ==================================

                    let starsHTML =
                        "";


                    const ratingCount =
                        Math.min(
                            5,
                            Math.max(
                                1,
                                parseInt(
                                    product.rating
                                ) || 5
                            )
                        );


                    for (
                        let i = 0;
                        i < ratingCount;
                        i++
                    ) {

                        starsHTML +=
                            '<i class="fa-solid fa-star"></i>';

                    }


                    // ==================================
                    // حماية النصوص
                    // ==================================

                    const title =
                        String(
                            product.title ||
                            ""
                        );


                    const subtitle =
                        String(
                            product.subtitle ||
                            ""
                        );


                    const price =
                        String(
                            product.price ||
                            ""
                        );


                const imageUrl =
    String(
        product.image ||
        ""
    );


                    // معالجة علامة '
                    const safeTitle =
                        title.replace(
                            /'/g,
                            "\\'"
                        );


                    const safeSubtitle =
                        subtitle.replace(
                            /'/g,
                            "\\'"
                        );


                    const safePrice =
                        price.replace(
                            /'/g,
                            "\\'"
                        );


                    // ==================================
                    // إنشاء كارت المنتج
                    // ==================================

                    productCard.innerHTML = `

                        <div class="product-img-wrapper">

                            <img
                                src="${imageUrl}"
                                alt="${title}"
                            >

                        </div>


                        <div class="rating">

                            ${starsHTML}

                        </div>


                        <div class="product-title">

                            ${title}

                        </div>


                        <div class="product-subtitle">

                            ${subtitle}

                        </div>


                        <div
                            class="product-price"
                            style="
                                text-align:center;
                                font-weight:bold;
                                color:#c5a880;
                                margin:8px 0;
                                font-size:16px;
                            "
                        >

                            ${price}

                        </div>


                        <div
                            class="product-footer"
                            style="
                                justify-content:center;
                            "
                        >

                            <button

                                onclick="addToCart(
                                    '${safeTitle}',
                                    '${safePrice}',
                                    '${imageUrl}',
                                    '${safeSubtitle}'
                                )"

                                class="btn-order"

                                style="
                                    background:#c5a880;
                                    color:#000;
                                    border:none;
                                    padding:10px 18px;
                                    border-radius:6px;
                                    cursor:pointer;
                                    font-weight:bold;
                                    font-family:inherit;
                                    display:flex;
                                    align-items:center;
                                    gap:8px;
                                "
                            >

                                <i
                                    class="fa-solid fa-cart-plus"
                                ></i>

                                إضافة للسلة

                            </button>

                        </div>

                    `;


                    productsGrid.appendChild(
                        productCard
                    );

                }
            );


            console.log(
                `✅ تم تحميل ${products.length} منتج من Supabase`
            );


        } catch (error) {

            console.error(
                "❌ خطأ أثناء جلب المنتجات من Supabase:",
                error
            );

            // مهم:
            // لا نحذف المنتجات الأصلية
            // ولا نوقف الموقع إذا Supabase فيه مشكلة

        }

    }


    // ==========================================
    // 9. تحميل منتجات Supabase عند فتح الموقع
    // ==========================================

    loadSupabaseProducts();


});
