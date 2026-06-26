(() => {
  const params = new URLSearchParams(window.location.search);
  const language = params.get("lang") || localStorage.getItem("language") || "ko";
  const strings = window.infoTranslations?.[language];

  if (!strings) return;

  document.documentElement.lang = language;
  if (strings.title) document.title = strings.title;
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const value = strings[element.dataset.i18n];
    if (value) element.textContent = value;
  });
  document.querySelectorAll("a[data-language-link]").forEach((element) => {
    const url = new URL(element.getAttribute("href"), window.location.href);
    url.searchParams.set("lang", language);
    element.href = `${url.pathname.split("/").pop()}${url.search}`;
  });
})();
