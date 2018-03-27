/**
 * Created by lidanbin on 2017/3/28.
 */
//取消系统的默认行为
document.addEventListener('touchstart', function (e) {
    e.preventDefault()
});
//设置rem适配
(function () {
    var width = document.documentElement.clientWidth
    var styleDom = document.createElement('style')
    styleDom.innerHTML = "html{font-size: " + width / 16 + "px !important;}"
    document.head.appendChild(styleDom)
})();

//切换焦点
toggleFocus();
function toggleFocus() {
    var textDom = document.getElementById('text');
    textDom.addEventListener('touchstart', function (e) {
        this.focus();
        e.stopPropagation();
    });
    //PC端的事件在移动端有300ms的延时
    /*textDom.addEventListener('blur', function (e) {
     this.style.backgroundColor = '#999'
     })*/
    document.addEventListener('touchstart', function (e) {
        textDom.blur()
    });
}

//切换遮罩
toggleMask();
function toggleMask() {
    var menuDom = document.querySelector('#menu');
    var maskDom = document.querySelector('.mask');
    menuDom.addEventListener('touchstart', function (e) {
        var className = this.className;
        if (className == 'menuClose') {
            this.className = 'menuOpen';
            maskDom.style.display = 'block';
        } else {
            this.className = 'menuClose';
            maskDom.style.display = 'none';
        }
        //阻止冒泡
        e.stopPropagation();
        return false;
    });
    document.addEventListener('touchstart', function (e) {
        menuDom.className = 'menuClose';
        maskDom.style.display = 'none';
    });
    maskDom.addEventListener('touchstart', function (e) {
        e.stopPropagation();
    });
}

//拖拽导航条+横向快速滑屏
dragNavbar();
function dragNavbar() {
    var navbar = document.querySelector('.navbar');
    var ulDom = document.querySelector(".navbar ul");
    var htmlWidth = document.documentElement.clientWidth;
    var ulWidth = ulDom.offsetWidth;
    var startX; //手指滑动起始位置
    var nowX; //手指滑动终止位置
    var left; //ul初始的位移位置
    var x; //ul最终的位移位置
    var startTime; //手指滑动开始时间
    var endTime; //手指滑动结束时间
    navbar.addEventListener('touchstart', function (e) {
        ulDom.style.transition = 'none'; //取消上一次的滑动过渡效果
        startTime = new Date().getTime(); //获取手指滑动的开始时间
        startX = e.changedTouches[0].clientX; //获取手指的初始位置
        left = transformCss(ulDom, 'translateX'); //获取ul的初始位移值:translateX
    });
    navbar.addEventListener('touchmove', function (e) {
        nowX = e.changedTouches[0].clientX; //获取是指滑动的终止位置
        x = left + nowX - startX; //计算ul的最终位移:translateX
        var scale;
        if (x > 0) {
            scale = 1 - htmlWidth / (ulWidth - nowX);
            x = x * scale;
        }
        if (x < htmlWidth - ulWidth) {
            scale = 1 - htmlWidth / (ulWidth + nowX * 6);
            x = htmlWidth - ulWidth - (htmlWidth - ulWidth - x) * scale * 0.7;
        }
        transformCss(ulDom, 'translateX', x)
    });

    //设置回弹效果
    navbar.addEventListener('touchend', function (e) {
        endTime = new Date().getTime(); //获取手指滑动的结束时间
        nowX = e.changedTouches[0].clientX; //获取手指滑动的终止位置
        x = left + nowX - startX; //计算ul的最终位移:translateX
        var time = endTime - startTime; //手指滑动过程花费的时间
        var distance = nowX - startX; //手指滑动的距离
        var speed = distance / time; //计算手指滑动的平均速度
        var realDistance = x + speed * 100; //计算ul滑动的实际距离 = ul的最终位移 + speed * 100
        var transition_time = Math.abs(speed) * 0.5; //速度越快speed值增大，回弹越快，过渡时间减小
        transition_time = transition_time > 0.5 ? 0.5 : transition_time;
        var bezier = '';
        if (realDistance >= 0) {
            realDistance = 0;
            bezier = 'cubic-bezier(0,1.57,.41,1.73)'
        }
        if (realDistance < htmlWidth - ulWidth) {
            realDistance = htmlWidth - ulWidth;
            bezier = 'cubic-bezier(0,1.57,.41,1.73)'
        }
        ulDom.style.transition = transition_time + 's ' + bezier;
        transformCss(ulDom, 'translateX', realDistance);
    });
}

//点击切换导航按钮
toggleMenu();
function toggleMenu() {
    //解决误触
    var ulDom = document.querySelector(".navbar ul");
    var isMoved = false;
    ulDom.addEventListener('touchmove', function () {
        isMoved = true;
    });
    ulDom.addEventListener('touchend', function (e) {
        if (!isMoved) {
            var lis = document.querySelectorAll('.navbar li');
            var targetDom = e.changedTouches[0].target;
            if (targetDom.nodeName == 'UL') return;
            for (var i = 0; i < lis.length; i++) {
                lis[i].className = '';
            }
            if (targetDom.nodeName == 'LI') {
                targetDom.className = 'selected'
            }
            if (targetDom.nodeName == 'A') {
                targetDom.parentNode.className = 'selected'
            }
        }
        isMoved = false;
    });
}

// 轮播图
function playCarousel() {
    //设置ul li img的高度、宽度
    var ulDom = document.getElementById('list');
    ulDom.innerHTML += ulDom.innerHTML;
    var imgs = document.querySelectorAll('.banner_wrap #list img');
    var spans = document.querySelectorAll('.span_nav span');
    var width = document.documentElement.clientWidth;
    var len = imgs.length;
    ulDom.style.width = width * len + 'px';
    for (var i = 0; i < len; i++) {
        imgs[i].style.width = width + 'px';
    }
    var wrapDom = document.querySelector('.banner_wrap');
    wrapDom.style.height = ulDom.offsetHeight + 'px';
    //横向滑屏
    var startX; //手指触摸屏幕的初始位置的x坐标
    var left; //手指滑动前ul的位置
    var x = 0; //手指滑动后ul的位置
    var index = 0; //图片的索引
    var timer; //定义一个定时器
    //设置防抖动效果
    var startY; //手指触摸屏幕的终止位置的y坐标
    var isX = true; //定义是否发生translateX变换 初始值为true
    ulDom.addEventListener('touchstart', function (e) {
        isX = true; //重置isX
        clearInterval(timer);
        ulDom.style.transition = 'none';
        startX = e.changedTouches[0].clientX;
        startY = e.changedTouches[0].clientY;
        if (index == 0) index = spans.length;
        if (index == len - 1) index = spans.length - 1;
        x = -index * width;
        transformCss(ulDom, 'translateX', x);
        left = transformCss(ulDom, 'translateX');
    });
    ulDom.addEventListener('touchmove', function (e) {
        var nowX = e.changedTouches[0].clientX;
        var nowY = e.changedTouches[0].clientY;
        x = left + nowX - startX;
        if (Math.abs(nowX - startX) < Math.abs(nowY - startY)) isX = false; //若x方向上的位移小于y方向上的位移，isX置为false
        if (isX) transformCss(ulDom, 'translateX', x);
    });
    ulDom.addEventListener('touchend', function (e) {
        index = Math.round(-x / width);
        x = -index * width;
        ulDom.style.transition = '0.5s';
        transformCss(ulDom, 'translateX', x);
        //切换导航点
        for (var i = 0; i < spans.length; i++) {
            spans[i].className = '';
        }
        spans[index % spans.length].className = 'active';
        autoPlay();
    });
    //设置自动播放
    autoPlay();
    function autoPlay() {
        clearInterval(timer);
        timer = setInterval(function (e) {
            if (index == len - 1) {
                ulDom.style.transition = 'none'; //取消过渡效果
                index = spans.length - 1; //当在播放第二组的最后一张图片时，将索引设置为第一组的最后一个
                x = -index * width;
                transformCss(ulDom, 'translateX', x); //切换图片
            }
            setTimeout(function (e) {
                index++;
                x = -index * width;
                ulDom.style.transition = '0.5s';
                transformCss(ulDom, 'translateX', x);
                //切换导航点
                for (var i = 0; i < spans.length; i++) {
                    spans[i].className = '';
                }
                spans[index % spans.length].className = 'active';
            }, 20)
        }, 2000)
    }
}

//选项卡横向滑屏
/*首先完成横向滑屏效果，在手指滑动过程中，2d变换位移，与普通的横向滑屏效果不同的是：
 当手指滑动的距离大于tabpane宽度的1/2：
 1、页面跳转到下一页（发生在touchmove事件中），开始显示loading页面，设置span的索引 设置防抖动效果
 2、模拟发送ajax请求（用transitionend/webkitTransitionEnd事件模拟），用setTimeout模拟服务器响应数据
 3、响应数据完成后 跳转到原页面，移动tab卡下方的span，loading页面消失，
 若手指离开屏幕时滑动的距离小于tabpane宽度的1/2，页面不跳转（发生在touchend事件中）*/
function dragTabs() {
    var tabsDom = document.querySelectorAll('.tab_detail');
    var menu_flags = document.querySelectorAll('.tab_menu_flag');
    var tabsLen = tabsDom.length;
    for (var i = 0; i < tabsLen; i++) {
        var tabPane_w = tabsDom[i].querySelector('.video_item_list').offsetWidth;
        transformCss(tabsDom[i], "translateX", -tabPane_w); //初始化选项卡的位置
        dragTab(tabsDom[i], menu_flags[i]);
    }
}
function dragTab(tabItem, menu_flag) {
    var tabsDom = document.querySelectorAll('.tab_detail');
    var tabPane_w = tabsDom[0].querySelector('.video_item_list').offsetWidth;
    var loadings = document.querySelectorAll('.loading');
    var menus = menu_flag.parentNode.getElementsByTagName('a');//获取该tab中所有的a
    var startX; //手指触摸屏幕的初始X坐标
    var startY; //手指触摸屏幕的初始Y坐标
    var left = 0; //tab的初始位置
    var x; //tab的最终位置
    var isX = true;
    var isFirst = true;
    var index; //tab移动页面的索引
    var distance; //手指在屏幕上滑动的距离差
    var isLoading = false; //是否为加载中……初始状态为false（是否已经发送ajax请求 但数据尚未加载完成）
    var menu_flag_index = 0; //span位置索引
    tabItem.addEventListener('touchstart', function (e) {
        isX = true;
        isFirst = true;
        if (isLoading) return; //如果是在ajax请求进行时，不能对tab进行任何操作？
        tabItem.style.transition = 'none';
        startX = e.changedTouches[0].clientX;
        startY = e.changedTouches[0].clientY;
        left = transformCss(tabItem, 'translateX');
    });
    tabItem.addEventListener('touchmove', function (e) {
        if (isLoading) return; //如果是在ajax请求进行时，不能对tab进行任何操作？
        var nowX = e.changedTouches[0].clientX;
        //防抖动效果
        var nowY = e.changedTouches[0].clientY;
        var disX = nowX - startX;
        var disY = nowY - startY;
        if (!isX) {
            return;
        }
        if (isFirst) {
            isFirst = false;
            if (Math.abs(disY) > Math.abs(disX)) {
                isX = false;
            }
        }
        distance = nowX - startX;
        x = left + nowX - startX;
        //向左滑动 nowX - startX < 0
        //向右滑动 nowX - startX > 0
        index = Math.round(-x / tabPane_w);
        tabItem.style.transition = '0.5s';
        transformCss(tabItem, 'translateX', x);
        if (Math.abs(distance) > tabPane_w / 2) {
            // 当手指移动距离过半，开始发送ajax请求 请求状态为true
            isLoading = true;
            for (var i = 0; i < loadings.length; i++) {
                loadings[i].style.opacity = '1';
            } //index = 0 1 2
            //设置tab选项菜单下方的标记
            if (distance < 0) menu_flag_index++;
            if (distance > 0) menu_flag_index--;
            if (menu_flag_index < 0) menu_flag_index = menus.length - 1;
            if (menu_flag_index > menus.length - 1) menu_flag_index = 0;
            transformCss(tabItem, 'translateX', -index * tabPane_w); //出现loading页面
            tabItem.addEventListener('transitonend', transitionEnd);
            tabItem.addEventListener('webkitTransitionEnd', transitionEnd);
        }
    });
    tabItem.addEventListener('touchend', function (e) {
        if (isLoading) return; //如果是在ajax请求进行时，不能对tab进行任何操作？
        tabItem.style.transition = '0.5s';
        transformCss(tabItem, 'translateX', -index * tabPane_w);
    });

    //过渡事件完成后的回调函数
    function transitionEnd() {
        //移除上一次的监听事件
        tabItem.removeEventListener('transitonend', transitionEnd);
        tabItem.removeEventListener('webkitTransitionEnd', transitionEnd);
        //请求完成
        setTimeout(function () {
            //loading状态设置为false
            isLoading = false;
            for (var i = 0; i < loadings.length; i++) {
                loadings[i].style.opacity = '0';
            }
            tabItem.style.transition = 'none';
            //将tab栏恢复原位
            transformCss(tabItem, 'translateX', -tabPane_w);
            //同步span的位置
            menu_flag.style.left = menus[menu_flag_index].offsetLeft + "px";
        }, 500)
    }

    //点击tab_menu切换选项卡
    toggleTab();
    function toggleTab() {
        for (var i = 0; i < menus.length; i++) {
            (function (i) {
                menus[i].addEventListener('touchstart', function () {
                    isLoading = true;
                    for (var i = 0; i < loadings.length; i++) {
                        loadings[i].style.opacity = '1';
                    }
                });
                menus[i].addEventListener('touchmove', function () {
                    //解决误触
                    if (!this.isMove) {
                        this.isMove = true;
                    }
                });
                menus[i].addEventListener('touchend', function (e) {
                    if (!this.isMove) {
                        transformCss(tabItem, 'translateX', 0);
                        setTimeout(function () {
                            //loading状态设置为false
                            isLoading = false;
                            for (var j = 0; j < loadings.length; j++) {
                                loadings[j].style.opacity = '0';
                            }
                            tabItem.style.transition = 'none';
                            //将tab栏恢复原位
                            transformCss(tabItem, 'translateX', -tabPane_w);
                            menu_flag_index = i;
                            menu_flag.style.left = menus[menu_flag_index].offsetLeft + "px";
                        }, 500)
                    }
                    this.isMove = false;
                })
            })(i)
        }
    }
}

//设置滚动条的高度
/*关键在于计算body的高度与内容区的高度的比例：scale = body的高度/内容区的高度
 滚动条的高度 = body的高度 * scale*/
scrollBar();
function scrollBar() {
    var htmlHeight = document.documentElement.clientHeight;
    var wrapHeight = document.querySelector('.wrap').offsetHeight;
    var scale = htmlHeight / wrapHeight;
    var scroll = document.querySelector('.scrollBar');
    scroll.style.height = htmlHeight * scale + 'px';
}

//竖向快速滑屏+回弹效果+即点即停效果+设置自定义滚动条
/*竖向的快速滑屏和回弹效果的思路与横向滑屏相似
 封装一个竖向滑屏函数fastSlideScreen，传入两个参数（需滑屏的元素、滚动条元素）
 1、即点即停效果的实现需要使用一个函数moveHandle来模拟translateY和transition过渡属性，该函数在
 touchend事件中调用，并传入三个参数（过渡类型:linear easeOut、过渡距离、过渡时间） 开启定时器
 2、在手指触摸屏幕时、在页面滑动时滚动条出现并跟随页面滚动（将opacity置为1），
 当前次数大于总次数时滚动条消失（将opacity置为0）关闭定时器
 3、滚动条的位置（也就是top值）= -页面的位置(translateY值) * scale*/
function slideScreen() {
    var sec_wrapDom = document.querySelector('.sec_wrap');
    var scrollDom = document.querySelector('.scrollBar');
    var htmlHeight = document.documentElement.clientHeight;
    var headerHeight = document.querySelector('.header').offsetHeight;
    sec_wrapDom.style.height = htmlHeight - headerHeight + 'px';
    fastSlideScreen(sec_wrapDom, scrollDom);
}

//for循环执行在js代码初始化时，资源可能还未加载完成，封装在外部的函数无法使用
window.onload = function () {
    playCarousel();
    dragTabs();
    slideScreen();
};























