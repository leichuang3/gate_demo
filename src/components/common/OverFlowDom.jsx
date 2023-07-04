import React, { useEffect, useRef, useState } from 'react';
import jiantouXia from '../../assets/images/jiantou_xia.svg'
const OverFlowDom = ({ len = 3, children, step = 50, space = 40, shouldReCompute = false }) => {
    const [overflow, setOverflow] = useState(false);
    const [distanceX, setDistanceX] = useState(0);
    const [showLeft, setShowLeft] = useState(true);
    const [showRight, setShowRight] = useState(true);
    const time = useRef(null);
    const ref42 = useRef(null);
    const dis = useRef(null);
    const parentRef = useRef(null);
    const srollRef = useRef(null);
    const observerDom = useRef(null);
    useEffect(() => {
        setTimeout(() => init(), 100);
        ref42.current && (ref42.current.style.transition = 'all 0.3s')
    }
        , [len]);
    useEffect(() => {
        try {
            if (observerDom.current)
                return;
            observerDom.current = new ResizeObserver(entries => {
                for (const entry of entries) {
                    switch (entry.target) {
                        case parentRef.current:
                            resize();
                            break
                    }
                }
            }
            );
            observerDom.current.observe(parentRef.current)
        } catch (error) {
            console.log(err, 'ResizeObserver error')
        }
    }
        , []);
    const resize = () => {
        time.current && clearTimeout(time.current);
        time.current = setTimeout(() => init(), 500)
    }
        ;
    const init = () => {
        dis.current = 0;
        ref42.current && (ref42.current.style.transform = `translateX(0px)`);
        const parentWidth = parentRef.current && parentRef.current.offsetWidth;
        let srollWidth = srollRef.current && srollRef.current.scrollWidth;
        if (srollWidth > parentWidth) {
            setOverflow(true);
            setShowRight(true);
            setShowLeft(false);
            setDistanceX(srollWidth - parentWidth + space)
        } else {
            setOverflow(false)
        }
    }
        ;
    const translateDom = type => {
        let target = type;
        if (is_ar) {
            switch (type) {
                case 'right':
                    target = 'left';
                    break;
                case 'left':
                    target = 'right';
                    break
            }
        }
        if (!is_ar && target === 'right' || is_ar && target === 'left') {
            if (Math.abs(dis.current) > distanceX) {
                return
            }
            setShowLeft(true);
            dis.current = dis.current - step;
            let distance = dis.current;
            if (is_ar) {
                distance = -distance
            }
            ref42.current.style.transform = `translateX(${distance + 'px'})`;
            if (Math.abs(distance) > distanceX)
                setShowRight(false)
        } else {
            if (dis.current + step > 0) {
                dis.current = 0
            } else {
                dis.current = dis.current + step
            }
            let distance = dis.current;
            if (is_ar) {
                distance = -distance
            }
            setShowRight(true);
            ref42.current.style.transform = `translateX(${distance + 'px'})`;
            if (distance === 0)
                setShowLeft(false)
        }
    };
    const showArrow = type => {
        if (!overflow)
            return;
        return (
            <div
                onClick={() => translateDom(type)}
                className={`com_overflow_icon ${type === 'left' ? 'icon_left' : 'icon_right'}`}>
                <jiantouXia className='icon overflow_arrow' style={{ transform: type === 'right' ? is_ar ? 'rotate(90deg)' : 'rotate(-90deg)' : is_ar ? 'rotate(-90deg)' : 'rotate(90deg)' }}></jiantouXia>
                <div className={`com_overflow_shadow ${type === 'left' ? 'shadow_left' : 'shadow_right'}`}></div>
            </div>
        )
    };
    const show_class_left = overflow && !showLeft ? 'show_left_class' : '';
    const show_class_rigth = overflow && !showRight ? 'show_right_class' : '';
    return (
        <div className='com_overflow' ref={refs => parentRef.current = refs}>
            {showLeft && showArrow('left')}
            <div ref={refs => srollRef.current = refs}
                className={`com_overflow_wrap ${overflow ? `position ${show_class_left} ${show_class_rigth}` : ''}`}>
                <div className='com_overflow_box' ref={refs => ref42.current = refs}>
                    {children}
                </div>
            </div>
            {showRight && showArrow('right')}
        </div>
    )
}

export default OverFlowDom