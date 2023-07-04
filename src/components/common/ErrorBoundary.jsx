import React from 'react';
import NoRecord from './NoRecord';

export default class ErrorBoundary extends React.Component {
    static getDerivedStateFromError(error) {
        return {
            hasError: true
        }
    }
    componentDidCatch(error, errorInfo) {
        const isSpot = !!this.props.isSpot;
        if (window.Sentry) {
            if (window.location.port == '') {
                Sentry.captureException(error, {
                    extra: {
                        trade: isSpot ? 'spot' : 'future'
                    }
                })
            }
        }
    }
    render() {
        if (this.state.hasError) {
            return <div className='error_boundary_spot'>
                <NoRecord></NoRecord>
            </div>
        }
        return this.props.children
    }
    constructor(props) {
        super(props);
        this.state = {
            hasError: false
        }
    }
}