(function (w) {
    w.transformCss = function (dom, name, value) {
        if (!dom.transform) {
            dom.transform = {};
        }
        if (arguments.length > 2) {
            //写
            dom.transform[name] = value;
            var result = '';
            for (var item in dom.transform) {
                switch (item) {
                    case 'rotate':
                    case 'skew':
                    case 'skewX':
                    case 'skewY':
                        result += item + '(' + dom.transform[item] + 'deg) '
                        break;
                    case 'scale':
                    case 'scaleX':
                    case 'scaleY':
                        result += item + '(' + dom.transform[item] + ') '
                        break;
                    case 'translate':
                    case 'translateX':
                    case 'translateY':
                        result += item + '(' + dom.transform[item] + 'px) '
                        break;
                }
            }
            dom.style.transform = result;

        } else {
            //读
            if (typeof dom.transform[name] == 'undefined') {
                //默认值
                if (name == 'scale' || name == 'scaleX' || name == 'scaleY') {
                    value = 1;
                } else {
                    value = 0;
                }
            } else {
                value = dom.transform[name];
            }
            return value;
        }

    }


})(window);





