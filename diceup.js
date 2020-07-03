function setup(url){
	start_button.disabled = true;
	//shows loading gif
	loading_gif.hidden = '';
	//hides error
	error = document.getElementById('error_alert');
	error.hidden = 'true';
	//gets image from url, and resolution from slider
	let slider = document.getElementById('slider');
	let n = -1*parseInt(slider.value);

	//loads image from url
	var org_im = new Image();
	org_im.crossOrigin = '';
	org_im.src = url;

	org_im.onload = function(){
	grey_data = getGreyscale(this, n);
	}

	org_im.onerror = function(){
		error.hidden = '';
		loading_gif.hidden = 'true';
		if (is_URL) start_button.disabled = false;
	}
}

function getGreyscale (image, n){
	// converts image into greyscale and returns ImageData
	var org_canvas = document.getElementById('org');
	org_canvas.height = image.height;
	org_canvas.width = image.width;
	var ctx = org_canvas.getContext('2d');
	ctx.drawImage(image, 0, 0 );
	var org_data = ctx.getImageData(0,0, image.width, image.height);
	var greyscale_arr = [];
	var row = [];

	for (let i = 0; i<org_data.data.length; i += 4){
		var greyscale = 0.34*org_data.data[i] + 0.5 * org_data.data[i+1] + 0.16 *org_data.data[i+2];
		if ((i/4)%image.width == 0 && i!=0){
			greyscale_arr.push(row);
			row = [];
		}
		row.push(greyscale);
	}
	greyscale_arr.push(row);
	ctx.putImageData(org_data, 0, 0);

	lowerResolution(greyscale_arr, n);
	return greyscale_arr;
}

function lowerResolution(imageData, n){
	// n is the size of ,,mean filter" - lower n = better quality
	let height = Math.floor(imageData.length/n); //h of lowered quality image
	let width = Math.floor(imageData[0].length/n);
	let lower_array = [];
	// min and max values of lower resolution pixels
	let min_val = 300;
	let max_val = -1;
	// iterate
	for (let i=0; i<height; i++){
		let row = [];
		for(let j=0; j<width; j++){
			let pixel = 0;
			//small square
			for(let k=0; k<n; k++){
				for(let l=0; l<n; l++){
					pixel += imageData[i*n+k][j*n+l];
				}
			}
			pixel = pixel/(n*n);
			row.push(pixel);
			if (pixel > max_val) max_val = pixel;
			if (pixel < min_val) min_val = pixel;
		}
		lower_array.push(row);
		row = [];
	}
	createResult(lower_array, min_val, max_val);
}

function createResult(lrData, min_val, max_val){
	//lrData is ,,lowered resolution" image data lrData - rows, lrData[x] - columns

	//canvas has size limiatations - we need smaller dice for larger images
	var dice_size = getDiceSize(lrData.length, lrData[0].length);

	// load dice images (50x50px)
	var d1 = document.getElementById('1');
	var d2 = document.getElementById('2');
	var d3 = document.getElementById('3');
	var d4 = document.getElementById('4');
	var d5 = document.getElementById('5');
	var d6 = document.getElementById('6');

	// prepare result canvas
	var result_canvas = document.getElementById('result');
	result_canvas.height = lrData.length*dice_size;
	result_canvas.width = lrData[0].length*dice_size;
	var ctx = result_canvas.getContext('2d');

	var compartment = Math.floor((max_val - min_val)/6);

	// draw result
	for (let h=0; h<lrData.length; h++){
		for (let w=0; w<lrData[0].length; w++){
			let pixel = lrData[h][w]
			if (pixel <= min_val+compartment*1){
				ctx.drawImage(d6, w*dice_size, h*dice_size, dice_size, dice_size);
			} else if(pixel <= min_val+compartment*2){
				ctx.drawImage(d5, w*dice_size, h*dice_size, dice_size, dice_size);
			} else if(pixel <= min_val+compartment*3){
				ctx.drawImage(d4, w*dice_size, h*dice_size, dice_size, dice_size);
			} else if(pixel <= min_val+compartment*4){
				ctx.drawImage(d3, w*dice_size, h*dice_size, dice_size, dice_size);
			} else if(pixel <= min_val+compartment*5){
				ctx.drawImage(d2, w*dice_size, h*dice_size, dice_size, dice_size);
			} else {
				ctx.drawImage(d1, w*dice_size, h*dice_size, dice_size, dice_size);
			}
		}
	}

	// approximation
	var approximation = document.getElementById('approximation');
	approximation.innerHTML = 'Dice used: ' + (lrData.length*lrData[0].length).toString() + '<br>';
	approximation.innerHTML += 'Dimensions (assuming 8mm dice): ' + (Math.round(lrData.length*0.8)/100).toString() + 'x' + (Math.round(lrData[0].length*0.8)/100).toString() + 'm<br>';
	approximation.innerHTML += 'Weight: ' + (Math.round(lrData.length*lrData[0].length*0.052)/100).toString() +'kg';
	approximation.hidden = '';

	loading_gif.hidden = 'true';
	if (is_URL) start_button.disabled = false;
}

function getDiceSize(dimension1, dimension2){
	// max canvas width/height is 32767px, and 268435456px total
	// I'll set it as 10000 for w/h just to be safe

	let pixel1 = Math.floor(10000/dimension1);
	let pixel2 = Math.floor(10000/dimension2);
	if (Math.min(pixel1,pixel2) >= 50){
		return 50;
	}
	return Math.min(pixel1,pixel2);
}

function swapToFile(){
	//Swaps to "From FILE" option
	to_file_link.className = 'nav-link active';
	to_URL_link.className = 'nav-link';
	url_form.hidden = 'true';
	file_form.hidden = '';
	file_label.hidden = '';
	start_button.disabled = 'true';
	is_URL = false;
}

function swapToURL(){
	//Swaps to "From URL" option
	to_file_link.className = 'nav-link';
	to_URL_link.className = 'nav-link active';
	url_form.hidden = '';
	file_form.hidden = 'true';
	file_label.hidden = 'true';
	start_button.disabled = '';
	is_URL = true;
}

//adds event listeners to swap links
var to_file_link = document.getElementById('toFile');
to_file_link.onclick = function(event){
	event.preventDefault();
	swapToFile();
}

var to_URL_link = document.getElementById('toURL');
to_URL_link.onclick = function(event){
	event.preventDefault();
	swapToURL();
}


var file_form = document.getElementById('file');
var file_label = document.getElementById('file_label');

// loads file from user
file_form.onchange = function(event){
	var target = event.target || window.event.srcElement,
	files = target.files;

	if (FileReader && files && files.length){
		var fr = new FileReader();
		fr.onload = function(){
			url_link = fr.result;
			setup(fr.result);
		}
		fr.readAsDataURL(files[0]);
	}
}


var start_button = document.getElementById('start_button');
var url_form = document.getElementById('url_form');
var url_link = '';
var loading_gif = document.getElementById('loading_gif');
var size_switch = document.getElementById('size_switch');
var is_URL = true;

size_switch.addEventListener("change", function(){
	let result_container = document.getElementById('result_container');
	if (size_switch.checked) result_container.className = '';
	else result_container.className = 'container';
})

// submit url with enter key
url_form.addEventListener("keyup", function(event){
	if (event.keyCode == 13){
		event.preventDefault();
		start_button.click();
	}
})

// chnages display name in file input
file_form.addEventListener("change", function(){
	document.getElementById('file_name').innerHTML = file_form.files[0].name;
});

// button that starts it all
start_button.addEventListener("click", function(){
	url_link = url_form.value;
	setup(url_link);
});

// do setup when slider value has changed
document.getElementById('slider').addEventListener("change", function(){
	if (url_link) setup(url_link);
});
