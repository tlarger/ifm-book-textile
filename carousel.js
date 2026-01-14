document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".carousel").forEach((carousel) => {
    const images = carousel.querySelectorAll(".carousel__img");
    const nextBtn = carousel.querySelector(".carousel__arrow--next");
    const prevBtn = carousel.querySelector(".carousel__arrow--prev");

    if (!images.length) return;

    let index = 0;

    function showImage(i) {
      images.forEach((img) => img.classList.remove("active"));
      images[i].classList.add("active");
    }

    // Affiche la première image si aucune n’est active
    if (!carousel.querySelector(".carousel__img.active")) {
      showImage(0);
    } else {
      // si une image est déjà active dans le HTML, synchronise l'index
      index = Array.from(images).findIndex((img) => img.classList.contains("active"));
      if (index < 0) index = 0;
    }

    // Si pas de boutons, on ne casse pas la page
    if (!nextBtn || !prevBtn) return;

    nextBtn.addEventListener("click", () => {
      index = (index + 1) % images.length;
      showImage(index);
    });

    prevBtn.addEventListener("click", () => {
      index = (index - 1 + images.length) % images.length;
      showImage(index);
    });
  });
});
