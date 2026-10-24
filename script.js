// محرك التشغيل الديناميكي للبطاقة الذكية - يربط الواجهة بالبيانات تلقائياً
document.addEventListener("DOMContentLoaded", () => {
    
    // 1. تطبيق النظام اللوني المختار من ملف البيانات على الموقع بالكامل
    if (dynamicProfileConfig.metadata && dynamicProfileConfig.metadata.themeColor) {
        document.documentElement.style.setProperty('--main-blue', dynamicProfileConfig.metadata.themeColor);
    }

    // 2. قراءة وحقن البيانات الأساسية للهوية (الاسم، الوظيفة، النبذة، الصورة)
    document.getElementById("profile-name").textContent = dynamicProfileConfig.identity.name;
    document.getElementById("profile-title").textContent = dynamicProfileConfig.identity.subtitle;
    document.getElementById("profile-about").textContent = dynamicProfileConfig.identity.bio;
    document.getElementById("profile-img").src = dynamicProfileConfig.identity.logoOrAvatar;

    // 3. ربط أزرار الاتصال السريع بالقيم البرمجية الخاصة بها
    const contact = dynamicProfileConfig.quickContact;
    
    // ربط زر الاتصال المباشر
    if (contact.phone) {
        document.getElementById("btn-phone").href = `tel:${contact.phone}`;
    } else {
        document.getElementById("btn-phone").style.display = "none"; // إخفاء الزر إذا كان فارغاً
    }

    // ربط زر الواتساب المباشر
    if (contact.whatsapp) {
        document.getElementById("btn-whatsapp").href = `https://wa.me{contact.whatsapp}`;
    } else {
        document.getElementById("btn-whatsapp").style.display = "none";
    }

    // ربط زر البريد الإلكتروني
    if (contact.email) {
        document.getElementById("btn-email").href = `mailto:${contact.email}`;
    } else {
        document.getElementById("btn-email").style.display = "none";
    }

    // ربط زر الموقع الإلكتروني
    if (contact.website) {
        document.getElementById("btn-website").href = contact.website;
    } else {
        document.getElementById("btn-website").style.display = "none";
    }

    // 4. بناء أيقونات السوشيال ميديا ديناميكياً (تظهر فقط الشبكات الممتلئة بالروابط)
    const socialContainer = document.getElementById("social-container");
    
    // خريطة لربط اسم الشبكة بالأيقونة الخاصة بها من مكتبة FontAwesome
    const iconsMap = {
        facebook: "fa-brands fa-facebook-f",
        instagram: "fa-brands fa-instagram",
        linkedin: "fa-brands fa-linkedin-in",
        twitter: "fa-brands fa-x-twitter",
        tiktok: "fa-brands fa-tiktok",
        youtube: "fa-brands fa-youtube"
    };

    // المرور على كل شبكة في ملف البيانات وفحصها
    for (const [platform, url] of Object.entries(dynamicProfileConfig.socialLinks)) {
        if (url) { // إذا كان هناك رابط ممتلئ للشبكة
            const anchor = document.createElement("a");
            anchor.href = url;
            anchor.className = "social-circle";
            anchor.target = "_blank";
            anchor.innerHTML = `<i class="${iconsMap[platform]}"></i>`;
            socialContainer.appendChild(anchor); // إضافة الأيقونة للواجهة
        }
    }

    // 5. تحميل وقراءة مجلد المنتجات والخدمات وعرضها ككروت مصنفة
    const productsContainer = document.getElementById("products-container");
    if (dynamicProfileConfig.products && dynamicProfileConfig.products.length > 0) {
        dynamicProfileConfig.products.forEach(product => {
            productsContainer.innerHTML += `
                <div class="item-card">
                    <img src="${product.image}" alt="${product.title}">
                    <div class="card-content">
                        <h3>${product.title}</h3>
                        <p><strong>التصنيف:</strong> ${product.category}</p>
                        <p>${product.description}</p>
                        <p style="color: var(--main-blue); font-weight: bold; margin-top: 4px;">${product.price}</p>
                    </div>
                </div>
            `;
        });
    } else {
        productsContainer.innerHTML = "<p style='text-align:center; color:#9ca3af; font-size:0.85rem;'>لا توجد منتجات حالياً</p>";
    }

    // 6. تحميل وقراءة مجلد المقالات والمعلومات وعرضها ككروت
    const articlesContainer = document.getElementById("articles-container");
    if (dynamicProfileConfig.articles && dynamicProfileConfig.articles.length > 0) {
        dynamicProfileConfig.articles.forEach(article => {
            articlesContainer.innerHTML += `
                <div class="item-card">
                    <img src="${article.image}" alt="${article.title}">
                    <div class="card-content">
                        <h3>${article.title}</h3>
                        <p style="font-size:0.75rem; color:#9ca3af; margin-bottom:4px;">تاريخ النشر: ${article.date}</p>
                        <p>${article.summary}</p>
                    </div>
                </div>
            `;
        });
    } else {
        articlesContainer.innerHTML = "<p style='text-align:center; color:#9ca3af; font-size:0.85rem;'>لا توجد مقالات حالياً</p>";
    }

    // 7. استخدام رابط تجريبي مؤقت لضمان توليد الـ QR Code محلياً بشكل سليم
    new QRCode(document.getElementById("qrcode"), {
        text: "https://google.com", 
        width: 150,
        height: 150,
        colorDark : "#111827",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.M
    });
});

// دالة ميكانيكية للتنقل اللحظي السريع بين تبويبي المنتجات والمقالات (تم تعديل المسمى هنا لـ tab-btn)
function switchTab(tabId) {
    // إخفاء كل اللوحات وإزالة التنشيط عن كل الأزرار
    document.querySelectorAll(".tab-panel").forEach(panel => panel.classList.remove("active"));
    document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
    
    // تنشيط اللوحة المطلوبة والزر المضغوط عليه حالياً
    document.getElementById(tabId).classList.add("active");
    event.currentTarget.classList.add("active");
}
