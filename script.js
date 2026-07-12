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