import React from "react";
function a(a) {
    var b = "undefined" == typeof window ? "undefined" == typeof self ? global : self : window;
    var c = "undefined" != typeof document && document.attachEvent;
    if (!c) {
        var d = function() {
            var a = b.requestAnimationFrame || b.mozRequestAnimationFrame || b.webkitRequestAnimationFrame || function(a) {
                return b.setTimeout(a, 20)
            }
            ;
            return function(b) {
                return a(b)
            }
        }()
          , f = function() {
            var a = b.cancelAnimationFrame || b.mozCancelAnimationFrame || b.webkitCancelAnimationFrame || b.clearTimeout;
            return function(b) {
                return a(b)
            }
        }()
          , g = function(a) {
            var b = a.__resizeTriggers__
              , c = b.firstElementChild
              , d = b.lastElementChild
              , e = c.firstElementChild;
            d.scrollLeft = d.scrollWidth,
            d.scrollTop = d.scrollHeight,
            e.style.width = c.offsetWidth + 1 + "px",
            e.style.height = c.offsetHeight + 1 + "px",
            c.scrollLeft = c.scrollWidth,
            c.scrollTop = c.scrollHeight
        }
          , j = function(a) {
            return a.offsetWidth != a.__resizeLast__.width || a.offsetHeight != a.__resizeLast__.height
        }
          , k = function(a) {
            if (!(0 > a.target.className.indexOf("contract-trigger") && 0 > a.target.className.indexOf("expand-trigger"))) {
                var b = this;
                g(this),
                this.__resizeRAF__ && f(this.__resizeRAF__),
                this.__resizeRAF__ = d(function() {
                    j(b) && (b.__resizeLast__.width = b.offsetWidth,
                    b.__resizeLast__.height = b.offsetHeight,
                    b.__resizeListeners__.forEach(function(c) {
                        c.call(b, a)
                    }))
                })
            }
        }
          , l = !1
          , m = ""
          , n = "animationstart"
          , o = ["Webkit", "Moz", "O", "ms"]
          , p = ["webkitAnimationStart", "animationstart", "oAnimationStart", "MSAnimationStart"]
          , q = "";
        {
            var r = document.createElement("fakeelement");
            if (void 0 !== r.style.animationName && (l = !0),
            !1 === l)
                for (var s = 0; s < o.length; s++)
                    if (void 0 !== r.style[o[s] + "AnimationName"]) {
                        q = o[s],
                        m = "-" + q.toLowerCase() + "-",
                        n = p[s],
                        l = !0;
                        break
                    }
        }
        var t = "resizeanim"
          , u = "@" + m + "keyframes resizeanim { from { opacity: 0; } to { opacity: 0; } } "
          , v = m + "animation: 1ms resizeanim; "
    }
    var w = function(b) {
        if (!b.getElementById("detectElementResize")) {
            var c = (u ? u : "") + ".resize-triggers { " + (v ? v : "") + "visibility: hidden; opacity: 0; } .resize-triggers, .resize-triggers > div, .contract-trigger:before { content: \" \"; display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; z-index: -1; } .resize-triggers > div { background: #eee; overflow: auto; } .contract-trigger:before { width: 200%; height: 200%; }"
              , d = b.head || b.getElementsByTagName("head")[0]
              , e = b.createElement("style");
            e.id = "detectElementResize",
            e.type = "text/css",
            null != a && e.setAttribute("nonce", a),
            e.styleSheet ? e.styleSheet.cssText = c : e.appendChild(b.createTextNode(c)),
            d.appendChild(e)
        }
    }
      , x = function(a, d) {
        if (c)
            a.attachEvent("onresize", d);
        else {
            if (!a.__resizeTriggers__) {
                var e = a.ownerDocument
                  , f = b.getComputedStyle(a);
                f && "static" == f.position && (a.style.position = "relative"),
                w(e),
                a.__resizeLast__ = {},
                a.__resizeListeners__ = [],
                (a.__resizeTriggers__ = e.createElement("div")).className = "resize-triggers",
                a.__resizeTriggers__.innerHTML = "<div class=\"expand-trigger\"><div></div></div><div class=\"contract-trigger\"></div>",
                a.appendChild(a.__resizeTriggers__),
                g(a),
                a.addEventListener("scroll", k, !0),
                n && (a.__resizeTriggers__.__animationListener__ = function(b) {
                    b.animationName == t && g(a)
                }
                ,
                a.__resizeTriggers__.addEventListener(n, a.__resizeTriggers__.__animationListener__))
            }
            a.__resizeListeners__.push(d)
        }
    }
      , y = function(a, b) {
        if (c)
            a.detachEvent("onresize", b);
        else if (a.__resizeListeners__.splice(a.__resizeListeners__.indexOf(b), 1),
        !a.__resizeListeners__.length) {
            a.removeEventListener("scroll", k, !0),
            a.__resizeTriggers__.__animationListener__ && (a.__resizeTriggers__.removeEventListener(n, a.__resizeTriggers__.__animationListener__),
            a.__resizeTriggers__.__animationListener__ = null);
            try {
                a.__resizeTriggers__ = !a.removeChild(a.__resizeTriggers__)
            } catch (a) {}
        }
    };
    return {
        addResizeListener: x,
        removeResizeListener: y
    }
}

export default class AutoSizerBrowser extends React.PureComponent {
    constructor(...a) {
        super(...a),
            this.state = {
                height: this.props.defaultHeight || 0,
                width: this.props.defaultWidth || 0
            },
            this._onResize = () => {
                const { disableHeight: a, disableWidth: b, onResize: c } = this.props;
                if (this._parentNode) {
                    const d = this._parentNode.offsetHeight || 0
                        , e = this._parentNode.offsetWidth || 0
                        , f = window.getComputedStyle(this._parentNode) || {}
                        , g = parseInt(f.paddingLeft, 10) || 0
                        , i = parseInt(f.paddingRight, 10) || 0
                        , j = parseInt(f.paddingTop, 10) || 0
                        , k = parseInt(f.paddingBottom, 10) || 0;
                    (a || this.state.height === d - j - k) && (b || this.state.width === e - g - i) || (this.setState({
                        height: d - j - k,
                        width: e - g - i
                    }),
                        c({
                            height: d,
                            width: e
                        }))
                }
            }
            ,
            this._setRef = a => {
                this._autoSizer = a
            }
    }
    componentDidMount() {
        const { nonce: b } = this.props;
        this._autoSizer && this._autoSizer.parentNode && this._autoSizer.parentNode.ownerDocument && this._autoSizer.parentNode.ownerDocument.defaultView && this._autoSizer.parentNode instanceof this._autoSizer.parentNode.ownerDocument.defaultView.HTMLElement && (this._parentNode = this._autoSizer.parentNode,
            this._detectElementResize = a(b),
            this._detectElementResize.addResizeListener(this._parentNode, this._onResize),
            this._onResize())
    }
    componentWillUnmount() {
        this._detectElementResize && this._parentNode && this._detectElementResize.removeResizeListener(this._parentNode, this._onResize)
    }
    render() {
        const { children: a, className: b, disableHeight: c, disableWidth: d, style: e } = this.props
            , { height: f, width: g } = this.state
            , i = {
                overflow: "visible"
            }
            , j = {};
        let k = !1;
        return c || (0 === f && (k = !0),
            i.height = 0,
            j.height = f),
            d || (0 === g && (k = !0),
                i.width = 0,
                j.width = g),
            (
                <div className={b} ref={this._setRef} style={{ ...i, ...e }}>
                    {!k && a(j)}
                </div>
            )
    }
}

AutoSizerBrowser.defaultProps = {
    onResize: ()=>{}
    ,
    disableHeight: !1,
    disableWidth: !1,
    style: {}
}