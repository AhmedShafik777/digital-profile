const byId = (id) => document.getElementById(id);

function setText(id, value) {
  byId(id).textContent = value || "";
}

function setExternalLink(element, url) {
  if (!url) {
    element.hidden = true;
    return;
  }
  element.href = url;
}

function escapeVCard(value) {
  return String(value || "")
    .trim()
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function createVCard() {
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    "N;CHARSET=UTF-8:;;;;",
    `FN;CHARSET=UTF-8:${escapeVCard(profile.name)}`
  ];

  if (profile.type === "company") {
    lines.push(`ORG;CHARSET=UTF-8:${escapeVCard(profile.name)}`);
  }
  if (profile.title) lines.push(`TITLE;CHARSET=UTF-8:${escapeVCard(profile.title)}`);
  if (profile.phone) lines.push(`TEL;TYPE=CELL:${escapeVCard(profile.phone)}`);
  if (profile.email) lines.push(`EMAIL;TYPE=INTERNET:${escapeVCard(profile.email)}`);
  if (profile.website) lines.push(`URL:${escapeVCard(profile.website)}`);

  lines.push("END:VCARD");
  return `${lines.join("\r\n")}\r\n`;
}

function renderProfile() {
  document.title = `${profile.name} | الملف الرقمي`;
  setText("profileName", profile.name);
  setText("profileTitle", profile.title);
  setText("profileAbout", profile.about);
  setText("currentYear", new Date().getFullYear());

  const image = byId("profileImage");
  image.src = profile.type === "company" ? profile.logo : profile.photo;
  image.alt = profile.type === "company"
    ? `شعار ${profile.name}`
    : `صورة ${profile.name}`;
  image.classList.toggle("company-logo", profile.type === "company");

  const logoUrl = profile.logo?.trim();
  document.querySelectorAll(".brand-mark").forEach((mark) => {
    const logo = mark.querySelector(".brand-logo");
    if (!logo || !logoUrl) return;
    mark.classList.add("has-logo");
    logo.addEventListener("error", () => mark.classList.remove("has-logo"), { once: true });
    logo.src = logoUrl;
  });

  setExternalLink(byId("callBtn"), profile.phone ? `tel:${profile.phone}` : "");
  setExternalLink(byId("whatsappBtn"), profile.whatsapp
    ? `https://wa.me/${profile.whatsapp.replace(/\D/g, "")}`
    : "");
  setExternalLink(byId("emailBtn"), profile.email ? `mailto:${profile.email}` : "");
  setExternalLink(byId("websiteBtn"), profile.website);
  setExternalLink(byId("locationBtn"), profile.location);
  const vcardButton = byId("vcardBtn");
  vcardButton.href = URL.createObjectURL(
    new Blob([createVCard()], { type: "text/vcard;charset=utf-8" })
  );
  vcardButton.download = "contact.vcf";

  const socialLabels = {
    facebook: "فيسبوك",
    instagram: "إنستغرام",
    linkedin: "لينكدإن",
    x: "X",
    tiktok: "تيك توك",
    youtube: "يوتيوب"
  };
  const socialContainer = byId("socialLinks");

  Object.entries(profile.social || {}).forEach(([network, url]) => {
    if (!url || !socialLabels[network]) return;
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = socialLabels[network];
    socialContainer.appendChild(link);
  });
}

function createCardImage(src, alt, className = "card-image") {
  const image = document.createElement("img");
  image.className = className;
  image.src = src;
  image.alt = alt || "";
  image.loading = "lazy";
  image.addEventListener("error", () => {
    image.hidden = true;
  }, { once: true });
  return image;
}

function showMessage(id, message) {
  const element = byId(id);
  element.textContent = message;
  element.hidden = false;
}

function renderProducts(data) {
  const categories = Array.isArray(data.categories) ? data.categories : [];
  const categoryButtons = byId("categoryButtons");
  const productsList = byId("productsList");

  if (categories.length === 0) {
    showMessage("productsMessage", "لا توجد خدمات معروضة حاليًا.");
    return;
  }

  function showCategory(category) {
    productsList.replaceChildren();
    category.items.forEach((product) => {
      const card = document.createElement("article");
      card.className = "product-card";
      card.appendChild(createCardImage(product.image, product.title));

      const content = document.createElement("div");
      content.className = "card-content";
      const label = document.createElement("span");
      label.className = "card-label";
      label.textContent = category.name;
      const title = document.createElement("h3");
      title.textContent = product.title;
      const description = document.createElement("p");
      description.textContent = product.description;
      content.append(label, title, description);

      if (product.price) {
        const price = document.createElement("p");
        price.className = "card-label";
        price.textContent = product.price;
        content.appendChild(price);
      }

      if (product.link) {
        const link = document.createElement("a");
        link.className = "card-link";
        link.href = product.link;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "اكتشف الخدمة ";
        const arrow = document.createElement("span");
        arrow.setAttribute("aria-hidden", "true");
        arrow.textContent = "↗";
        link.appendChild(arrow);
        content.appendChild(link);
      }

      card.appendChild(content);
      productsList.appendChild(card);
    });
  }

  categories.forEach((category, index) => {
    const button = document.createElement("button");
    button.className = "category-btn";
    button.type = "button";
    button.textContent = category.name;
    button.setAttribute("aria-pressed", String(index === 0));
    if (index === 0) button.classList.add("active");
    button.addEventListener("click", () => {
      categoryButtons.querySelectorAll(".category-btn").forEach((item) => {
        item.classList.remove("active");
        item.setAttribute("aria-pressed", "false");
      });
      button.classList.add("active");
      button.setAttribute("aria-pressed", "true");
      showCategory(category);
    });
    categoryButtons.appendChild(button);
  });

  showCategory(categories[0]);
}

function formatDate(dateValue) {
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateValue || "";
  return new Intl.DateTimeFormat("ar", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(date);
}

function renderArticles(data) {
  const articles = Array.isArray(data.articles) ? data.articles : [];
  const articlesList = byId("articlesList");

  if (articles.length === 0) {
    showMessage("articlesMessage", "لا توجد مقالات منشورة حاليًا.");
    return;
  }

  articles.forEach((article) => {
    const card = document.createElement("article");
    card.className = "article-card";
    card.appendChild(createCardImage(article.image, article.title));

    const content = document.createElement("div");
    content.className = "card-content";
    const date = document.createElement("time");
    date.className = "article-date";
    date.dateTime = article.date || "";
    date.textContent = formatDate(article.date);
    const title = document.createElement("h3");
    title.textContent = article.title;
    const summary = document.createElement("p");
    summary.textContent = article.content;
    content.append(date, title, summary);
    card.appendChild(content);
    articlesList.appendChild(card);
  });
}

async function loadJson(path, render, messageId) {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`تعذر تحميل ${path}: ${response.status}`);
    }
    render(await response.json());
  } catch (error) {
    console.error(error);
    showMessage(messageId, "تعذر تحميل المحتوى. تأكد من تشغيل الموقع عبر خادم ويب.");
  }
}

function renderQrCode() {
  if (typeof QRCode === "undefined") {
    showMessage("shareFeedback", "تعذر تحميل أداة رمز QR. تحقق من اتصال الإنترنت.");
    return;
  }

  new QRCode(byId("qrcode"), {
    text: window.location.href,
    width: 132,
    height: 132,
    colorDark: "#254736",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H
  });
}

function setupShare() {
  const feedback = byId("shareFeedback");
  byId("shareLink").addEventListener("click", async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: profile.name,
          text: "تعرّف على الملف الرقمي",
          url: window.location.href
        });
        feedback.textContent = "تم فتح خيارات المشاركة.";
        return;
      }
      await navigator.clipboard.writeText(window.location.href);
      feedback.textContent = "تم نسخ رابط الملف إلى الحافظة.";
    } catch (error) {
      if (error.name === "AbortError") return;
      console.error("تعذرت مشاركة رابط الملف.", error);
      feedback.textContent = "تعذرت المشاركة. يمكنك نسخ رابط الصفحة من المتصفح.";
    }
  });

  byId("downloadQr").addEventListener("click", () => {
    const canvas = byId("qrcode").querySelector("canvas");
    const image = byId("qrcode").querySelector("img");
    const downloadLink = document.createElement("a");
    downloadLink.download = "ahmed-digital-profile-qr.png";

    if (canvas) {
      downloadLink.href = canvas.toDataURL("image/png");
    } else if (image) {
      downloadLink.href = image.src;
    } else {
      feedback.textContent = "رمز QR غير جاهز للتحميل بعد.";
      return;
    }

    downloadLink.click();
  });
}

renderProfile();
renderQrCode();
setupShare();
loadJson("products.json", renderProducts, "productsMessage");
loadJson("articles.json", renderArticles, "articlesMessage");
