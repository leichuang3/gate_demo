import React from 'react';

const LoadingComponent = ({ rectWidth = 8, rectHeight = 8, fill = '#2354E6' }) => {
    const svgWidth = rectWidth * 5;
    return <div className="loading-page-wrapper">
        <div className="loading-page-wrapper-bounce">
            <svg x="0px"
                y="0px"
                width={svgWidth}
                height={rectHeight}
                viewBox={`0 0 ${svgWidth} ${rectHeight}`}>
                <rect
                    x="0"
                    y="0"
                    width={rectWidth}
                    height={rectHeight}
                    viewBox={`0 0 ${rectWidth} ${rectHeight}`}
                    fill={fill}
                >
                    <animate
                        attributeName="opacity"
                        attributeType="XML"
                        values="1; .3; 1"
                        begin="0s"
                        dur="0.8s"
                        repeatCount="indefinite"
                    >

                    </animate>
                </rect>

                <rect
                    x={rectWidth * 2}
                    y="0"
                    width={rectWidth}
                    height={rectHeight}
                    viewBox={`0 0 ${rectWidth} ${rectHeight}`}
                    fill={fill}
                >
                    <animate
                        attributeName="opacity"
                        attributeType="XML"
                        values="1; .3; 1"
                        begin="0.27s"
                        dur="0.8s"
                        repeatCount="indefinite"
                    >

                    </animate>
                </rect>

                <rect
                    x={rectWidth * 4}
                    y="0"
                    width={rectWidth}
                    height={rectHeight}
                    viewBox={`0 0 ${rectWidth} ${rectHeight}`}
                    fill={fill}
                >
                    <animate
                        attributeName="opacity"
                        attributeType="XML"
                        values="1; .3; 1"
                        begin="0.54s"
                        dur="0.8s"
                        repeatCount="indefinite"
                    >

                    </animate>
                </rect>
            </svg>
        </div>
    </div>
}

export default LoadingComponent