import React from 'react'
import Tooltips from './Tooltips';

const DragComponent = ({ position = 'left' }) => {
    return <div className="rgl-drag-zone">
        <Tooltips
            position={position}
            label={lang_string('按住可移动')}
        >
            <div className="rgl-drag-container">
                <div className="rgl-drag"></div>
            </div>
        </Tooltips>
    </div>
}

export default DragComponent;