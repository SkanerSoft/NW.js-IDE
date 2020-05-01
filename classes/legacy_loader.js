(function () {
	'use strict';

	var GO = function (tag) {
		var imgs = window.document.getElementsByTagName(tag), i = 0;
		for (;i<imgs.length;i+=1) {
			imgs[i].addEventListener('error', function (e) {
				console.error(this.getAttribute('src')+' not found');
			});
		}
		imgs = null;
	};

	GO('img');
	GO('script');
})();