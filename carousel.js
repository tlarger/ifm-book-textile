document.querySelectorAll('.carousel').forEach(carousel => {
    const images = carousel.querySelectorAll('.carousel__img');
    const nextBtn = carousel.querySelector('.carousel__arrow--next');
    const prevBtn = carousel.querySelector('.carousel__arrow--prev');
  
    let index = 0;
  
    function showImage(i) {
      images.forEach(img => img.classList.remove('active'));
      images[i].classList.add('active');
    }
  
    nextBtn.addEventListener('click', () => {
      index = (index + 1) % images.length;
      showImage(index);
    });
  
    prevBtn.addEventListener('click', () => {
      index = (index - 1 + images.length) % images.length;
      showImage(index);
    });
  });
  