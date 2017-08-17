
var img_div = document.getElementById('img');
var img_canvas = img_div.getContext('2d');
var txt_div = document.getElementById('txt');
var txt_canvas = txt_div.getContext('2d');
var fileBtn = document.getElementById("up-button");

var img = new Image();
img.src = './img/nxn.jpg';
img.onload = init; // init
fileBtn.onchange = getImg;

//generate txt according to gray value
function toText(g) {
    if (g <= 30) {
        return '8';
    } else if (g > 30 && g <= 60) {
        return '&';
    } else if (g > 60 && g <= 120) {
        return '$';
    }  else if (g > 120 && g <= 150) {
        return '*';
    } else if (g > 150 && g <= 180) {
        return 'o';
    } else if (g > 180 && g <= 210) {
        return '!';
    } else if (g > 210 && g <= 240) {
        return ';';
    }  else {
        return '.';
    }
}


//convert rgb to gray
function getGray(r, g, b) {
    return 0.299 * r + 0.578 * g + 0.114 * b;
}

//img2txt
function init() {
    txt_div.width = img.width;
    txt_div.height = img.height;
    txt_canvas.font = "1px Courier New";
    txt_canvas.fillStyle = "blue";


    
    img_div.width = img.width;
    img_div.height = img.height;
    img_canvas.drawImage(img, 0, 0);
    var imgData = img_canvas.getImageData(0, 0, img.width, img.height);
    var imgDataArr = imgData.data;
    var imgDataWidth = imgData.width;
    var imgDataHeight = imgData.height;
    for (h = 0; h < imgDataHeight; h += 4) {
        for (w = 0; w < imgDataWidth; w += 2) {
            var index = (w + imgDataWidth * h) * 4;
            var r = imgDataArr[index + 0];
            var g = imgDataArr[index + 1];
            var b = imgDataArr[index + 2];
            var gray = getGray(r, g, b);
            txt_canvas.fillText(toText(gray), w, h);
        }
    }
}

// 获取图片
function getImg(file) {
    var reader = new FileReader();
    reader.readAsDataURL(fileBtn.files[0]);
    reader.onload = function () {
        img.src = reader.result;
    }
}
