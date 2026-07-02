var loader = document.querySelector(".preloader");

export const setLoader = (status) => {
	if (status === true) {
		loader.classList.add('loader-visible');
		loader.classList.remove('loader-hidden');
    document.body.style.overflow = 'hidden';
	} else {
		loader.classList.add('loader-hidden');
		loader.classList.remove('loader-visible');
    document.body.style.overflow = '';
	}
};