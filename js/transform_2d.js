/**
 * Created by lidanbin on 2017/3/27.
 */
(function (win) {
    win.transformCss = function (dom, cssName, value) {
        if (!dom.transform) {
            dom.transform = {};
        }
        //设置值
        //不能将判断条件设置为value 否则当value = 0时 不能通过
        if (arguments.length > 2) {
            dom.transform[cssName] = value;
            var result = "";
            for (var cssItem in dom.transform) {
                switch (cssItem) {
                    case 'rotate':
                    case  'skew':
                    case 'skewX':
                    case 'skewY':
                        //自定义的transform样式可能不止一个，所以需要进行拼串处理。
                        result += cssItem + "(" + dom.transform[cssItem] + "deg) ";
                        break;
                    case 'scale':
                    case 'scaleX':
                    case 'scaleY':
                        result += cssItem + "(" + dom.transform[cssItem] + ') ';
                        break;
                    case 'translate':
                    case 'translateX':
                    case 'translateY':
                        result += cssItem + "(" + dom.transform[cssItem] + "px) ";
                        break;
                }
            }
            dom.style.transform = result;
            //读取值
        } else {
            //如果读取的是一个未自定义过的transform样式，那么读取默认值
            if (!dom.transform[cssName]) {
                if (cssName == "scale" || cssName == "scaleX" || cssName == "scaleY") {
                    value = 1;
                } else {
                    value = 0;
                }
                //读取设定值
            } else {
                value = dom.transform[cssName];
            }
            return value;
        }
    };
    win.fastSlideScreen = function (sec_wrapDom, scrollDom) {
        var wrapDom = document.querySelector('.content');
        var sec_Height = sec_wrapDom.clientHeight;
        var wrapHeight = wrapDom.offsetHeight;
        var html_Height = document.documentElement.clientHeight;
        var headerHeight = document.querySelector('.header').offsetHeight;
        var scroll_scale = html_Height / wrapHeight;
        var startY; //手指滑动起始位置
        var startX;
        var nowY; //手指滑动终止位置
        var nowX;
        var isFirst = true;
        var isY = true;
        var top; //ul初始的位移位置
        var y; //ul最终的位移位置
        var startTime; //手指滑动开始时间
        var endTime; //手指滑动结束时间
        //定义一个模拟2d过渡效果函数
        var Tween = {
            Linear: function (t, b, c, d) {
                return c * t / d + b;
            },
            easeOut: function (t, b, c, d, s) {
                if (s == undefined) s = 1.70158;
                return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
            }
        };
        var timer;
        sec_wrapDom.addEventListener('touchstart', function (e) {
            clearInterval(timer);
            isFirst = true;
            isY = true;
            wrapDom.style.transition = 'none'; //取消上一次的滑动过渡效果
            startTime = new Date().getTime(); //获取手指滑动的开始时间
            startY = e.changedTouches[0].clientY; //获取手指的初始位置
            startX = e.changedTouches[0].clientX; //获取手指的初始位置
            nowY = e.changedTouches[0].clientY; //获取是指滑动的终止位置
            top = transformCss(wrapDom, 'translateY'); //获取ul的初始位移值:translateX
            scrollDom.style.opacity = '1'; //使滚动条出现
            transformCss(scrollDom, 'translateY', (-top-headerHeight) * scroll_scale); //设置滚动条的位置
        });
        sec_wrapDom.addEventListener('touchmove', function (e) {
            if (!isY) {
                return;
            }
            nowY = e.changedTouches[0].clientY; //获取是指滑动的终止位置
            nowX = e.changedTouches[0].clientX; //获取是指滑动的终止位置
            var disY = nowY - startY;
            var disX = nowX - startX;
            if (isFirst) {
                isFirst = !isFirst;
                if (Math.abs(disX) > Math.abs(disY)) {
                    isY = false;
                }
            }
            y = top + nowY - startY; //计算ul的最终位移:translateX
            var scale;
            if (y > 0) {
                scale = 1 - sec_Height / (wrapHeight - nowY);
                y = y * scale;
            }
            if (y < sec_Height - wrapHeight) {
                scale = 1 - sec_Height / (wrapHeight + nowY * 6);
                y = sec_Height - wrapHeight - (sec_Height - wrapHeight - y) * scale * 0.7;
            }
            transformCss(wrapDom, 'translateY', y);
            scrollDom.style.opacity = '1'; //使滚动条出现
            transformCss(scrollDom, 'translateY', (-y-headerHeight) * scroll_scale); //设置滚动条的位置
        });
        //设置回弹效果
        sec_wrapDom.addEventListener('touchend', function (e) {
            endTime = new Date().getTime(); //获取手指滑动的结束时间
            // nowY = e.changedTouches[0].clientY; //获取手指滑动的终止位置
            y = top + nowY - startY; //计算ul的最终位移:translateX
            var time = endTime - startTime; //手指滑动过程花费的时间
            var distance = nowY - startY; //手指滑动的距离
            var speed = distance / time; //计算手指滑动的平均速度
            // console.log("nowY=", nowY, "startY=", startY)
            // console.log('distance=', distance, 'time=', time)
            var realDistance = y + speed * 100; //计算ul滑动的实际距离 = ul的最终位移 + speed * 100
            // console.log("top=", top, "ul的最终位移=", y, "手指滑动的平均速度=", speed, "ul滑动的实际距离=", realDistance)
            var transition_time = Math.abs(speed) * 0.5; //速度越快speed值增大，回弹越快，过渡时间减小
            transition_time = transition_time > 0.5 ? 0.5 : transition_time;
            // var bezier = '';
            var type = 'Linear';
            if (realDistance >= 0) {
                realDistance = 0;
                // bezier = 'cubic-bezier(0,1.57,.41,1.73)'
                type = "easeOut";
            }
            if (realDistance < sec_Height - wrapHeight) {
                realDistance = sec_Height - wrapHeight;
                // bezier = 'cubic-bezier(0,1.57,.41,1.73)'
                type = "easeOut";
            }
            // wrapDom.style.transition = transition_time + 's ' + bezier;
            // transformCss(wrapDom, 'translateY', realDistance);
            moveHandle(realDistance, type, transition_time);
            scrollDom.style.opacity = '1'; //使滚动条出现
        });

        function moveHandle(realDistance, type, transition_time) {
            //s:回弹系数比例距离（s越大，回弹距离越远）
            //返回值：每次运动需要达到的距离
            var t = 0; //当前次数(一般从1开始)
            var b = transformCss(wrapDom, 'translateY'); //初始位置
            var c = realDistance - b; //初始位置与最终位置的差值
            var d = transition_time / 0.002; //总次数
            // console.log("初始位置=", b, "初始位置与最终位置的差值=", c);
            clearInterval(timer);
            timer = setInterval(function () {
                t++;
                if (t > d) {
                    clearInterval(timer);
                    scrollDom.style.opacity = 0; //使滚动条出现
                } else {
                    var point = Tween[type](t, b, c, d);
                    transformCss(wrapDom, 'translateY', point);
                    transformCss(scrollDom, 'translateY', (-point-headerHeight) * scroll_scale); //设置滚动条的位置
                }
            }, 0.1);
        }
    };
})(window);