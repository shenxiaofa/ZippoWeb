$.extend($, {
    inputFocus: false,
    isUpdateImage: false,
    imgSrc: "",
    imgAddress: "",
    count: 0,
    gameTimer: null,
    init: function () {
        // $.preventTouchDefault();
        $.useRem();
        $.forceScreenDir();
        // $.share();
        // $.fixedInput();
    },
    preventTouchDefault: function () {
        $(document).on('touchstart', function (e) {
            e.preventDefault();
        });
        $('input').on('touchstart', function (e) {
            e.stopPropagation();
        });
        $('button').on('touchstart', function (e) {
            e.stopPropagation();
        });
    },
    useRem: function () {
        var dElem = document.documentElement;
        var rem = $(document).width() / 20;
        $(dElem).css('fontSize', rem);
        $(window).off("resize").on("resize", function () {
            $.useRem();
            $.forceScreenDir();
        });
    },
    forceScreenDir: function () {
        var portrait = $('.portrait').not('.spc');
        var landscape = $('.landscape').not('.spc');
        if (window.isForce === "portrait" || typeof window.isForce === "undefined") {
            if (!$.inputFocus) {
                if ($(window).width() < $(window).height()) {
                    portrait.removeClass('hide');
                    landscape.addClass('hide');
                } else {
                    portrait.addClass('hide');
                    landscape.removeClass('hide');
                }
            }
        } else if (window.isForce === "landscape") {
            if ($(window).width() < $(window).height()) {
                portrait.removeClass('hide');
                landscape.addClass('hide');
            } else {
                landscape.removeClass('hide');
                portrait.addClass('hide');
            }
        }
    },
    submitUserInfo: function (callback) {
        $('.submit').on('click', function () {
            var name = $('.name');
            var phone = $('.phone');
            var address = $('.address');
            var shop = $('.shop');
            var top = $(window).height * 0.45;
            if (name.val() === "" || typeof name === "undefined") {
                layer.open({
                    content: '请填写姓名',
                    skin: 'msg',
                    style: 'background-color:#09C1FF; color:#fff; border:none;',
                    time: 2,
                    fixed: false
                });
                return;
            } else if (!/^1[34578]\d{9}$/.test(phone.val())) {
                layer.open({
                    content: '请填写正确的手机号码',
                    skin: 'msg',
                    style: 'background-color:#09C1FF; color:#fff; border:none;',
                    time: 2,
                    fixed: false
                });
                return;
            } else if (address.val() === "" || typeof address === "undefined") {
                layer.open({
                    content: '请填写地址',
                    skin: 'msg',
                    style: 'background-color:#09C1FF; color:#fff; border:none;',
                    time: 2,
                    fixed: false
                });
                return;
            } else if (shop.val() === "" || typeof shop === "undefined") {
                layer.open({
                    content: '请填写购买店铺',
                    skin: 'msg',
                    style: 'background-color:#09C1FF; color:#fff; border:none;',
                    time: 2,
                    fixed: false
                });
                return;
            } else if (!$.isUpdateImage) {
                layer.open({
                    content: '请上传照片',
                    skin: 'msg',
                    style: 'background-color:#09C1FF; color:#fff; border:none;',
                    time: 2,
                    fixed: false
                });
                return;
            }

            $.get("https://wag.i-h5.cn/lgy_game/zippo/api.php?a=submit", {
                username: name.val(),
                phone: phone.val(),
                addr: address.val(),
                store: shop.val(),
                imgurl: $.imgAddress
            }, function (result) {
                if (result.error == 0) {
                    //alert("提交成功！");
                    callback && callback();
                }
                else if (result.error == 1){
                    alert(result.info);
                }
            })

            
        });
    },
    clearTimer: function () {
        clearInterval($.gameTimer);
    },
    countDown: function (count) {
        var num = $('.time').find('.count');
        var count = typeof count === "undefined" ? 30 : count;
        $.count = count;
        num.html('00:' + ($.count < 10 ? '0' + $.count : $.count));
        clearInterval($.gameTimer);
        $.gameTimer = setInterval(function () {
            $.count--;
            if ($.count === 0) {
                clearInterval($.gameTimer);
                // alert('时间到，游戏结束了');
                $('.page-4').removeClass('hide spc');
                $('.page-4').find('img').removeClass('active');
                $('.page-4').find('img').addClass('active');
                $('.page-7').addClass('hide spc');
                $('#renderGameCanvas').addClass('hide');
                // location.href = ""
            }
            num.html('00:' + ($.count < 10 ? '0' + $.count : $.count));
        }, 1000);
    },
    updatePhoto: function (callback) {
        var photo = $('.photo');
        var photoInput = $('.photo-input');
        var user = $('.user');
        photo.on("click", function () {
            photoInput.click();
        });
        photoInput.on('change', function () {
            var reader = new FileReader();
            reader.onload = function (e) {
                compress(this.result);
            };
            reader.readAsDataURL(this.files[0]);
        });
        var compress = function (res) {
            var img = new Image();
            var maxH = 500;
            img.onload = function () {
                var w = this.width;
                var h = this.height;
                var max = Math.max(w, h);
                var cvs = $('.user').get(0),
                    ctx = cvs.getContext('2d');
                if (h > maxH) {
                    w *= maxH / h;
                    h = maxH;
                }
                cvs.width = w;
                cvs.height = h;
                ctx.clearRect(0, 0, cvs.width, cvs.height);
                ctx.drawImage(this, 0, 0, w, h);
                $.imgSrc = cvs.toDataURL('image/jpeg', 0.6);
                $.post("https://wag.i-h5.cn/lgy_game/zippo/upload.php?a=upload_base64",
                    { "img": $.imgSrc }, function (result) {
                        if (result.error == 0) {
                            //alert("提交成功 地址："+result.data.imgurl)
                            $.imgAddress = result.data.imgurl;
                            $.isUpdateImage = true;
                            callback && callback();
                        }
                        else {
                            alert("图片上传失败！");
                        }
                    })
            }
            img.src = res;
        }
    },
    canvCountDown: function () {
        var circle = $('.schedule');
        var w = circle.width();
        var h = circle.height();
        var c = circle.get(0);
        c.width = w;
        c.height = h;
        var gc = c.getContext('2d');
        gc.clearRect(0, 0, w, h);
        gc.globalAlpha = 0.6;
        var canvCount = $.count;

        drawCircle(w / 2, h / 2, w / 2, 30, 330, 330);
        clearInterval(timerCanv);
        var timerCanv = setInterval(function () {
            gc.clearRect(0, 0, w, h);
            var deg = $.count * (330 - 30) / canvCount;
            drawCircle(w / 2, h / 2, w / 2, 30, 330, 30 + deg);
            if ($.count === 0) {
                clearInterval(timerCanv);
            }
        }, 1000);
        function drawArc(x, y, r, sa, ea, w, c, d) {
            gc.beginPath();
            gc.arc(x, y, r, sa * Math.PI / 180, ea * Math.PI / 180, d);
            gc.lineWidth = w;
            gc.strokeStyle = c;
            gc.lineCap = "round";
            gc.stroke();
        }
        function drawCircle(x, y, r, startDeg, endDeg, md) {
            var dis = 4;
            var deg = startDeg;
            var outer = r;
            var inner = r - dis;
            var disX = dis / 2 * Math.cos(deg * Math.PI / 180);
            var disY = dis / 2 * Math.sin(deg * Math.PI / 180);
            var minX = x + outer * Math.cos(deg * Math.PI / 180) - disX;
            var minY1 = y + outer * Math.sin(deg * Math.PI / 180) - disY;
            var minY2 = y - outer * Math.sin(deg * Math.PI / 180) + disY;
            var borderW = 1;
            var barW = (dis - 2 * borderW) * 0.6;
            var borderC = "#fff";
            var barC = "#1addf4";
            var divC = "#d198fe";
            //轮廓
            drawArc(x, y, outer, startDeg, endDeg, borderW, borderC, false);
            drawArc(x, y, inner, startDeg, endDeg, borderW, borderC, false);
            drawArc(minX, minY1, dis / 2, deg, 360 - (180 - deg), borderW, borderC, true);
            drawArc(minX, minY2, dis / 2, 360 - deg, 180 - deg, borderW, borderC, false);
            //进度条
            drawArc(x, y, inner + dis / 2, startDeg, md, barW, barC, false);
        }
    },
    fixedInput: function () {
        var clientHeight = document.body.clientHeight;
        var _focusElem = null;
        document.body.addEventListener("focus", function(e) {
            _focusElem = e.target || e.srcElement;
        }, true);
        window.addEventListener("resize", function() {
            if (_focusElem && document.body.clientHeight < clientHeight) {
                _focusElem.scrollIntoView(false);
            }
        });
        $('.form').find('input').on("focus", function () {
            $.inputFocus = true;
        });
        $('.form').find('input').on("blur", function () {
            setTimeout(function () {
                $.inputFocus = false;
            }, 500);
        });
    },
    // scrollIntoView: function() {
    // 	var fullHeight = $(window).height();
    // 	var scrollList = {
    // 		originHeight: $('.scroll-list').height(),
    // 		originTop: $('.scroll-list').css('top')
    // 	};
    // 	var scrollBtn = {
    // 		originHeight: $('.scroll-btn').height(),
    // 		originBtm: $('.scroll-btn').css('bottom')
    // 	};
    // 	$(window).resize(function() {
    // 		var nowHeight = $(window).height();
    // 		if ( fullHeight > nowHeight) {
    // 			$('.scroll-list').css('top', nowHeight - scrollList.originHeight);
    // 			$('.scroll-btn').css('bottom', -scrollBtn.originHeight);
    // 		} else {
    // 			$('.scroll-list').css('top', scrollList.originTop);
    // 			$('.scroll-btn').css('bottom', scrollBtn.originBtm);
    // 		}
    // 	});
    // }
});

$.init();