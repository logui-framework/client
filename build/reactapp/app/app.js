import React from 'react';

class Clock extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            time: new Date().toISOString().substr(11, 8),
        };
        
        this.clockTick = this.clockTick.bind(this);
    }

    componentDidMount() {
        this.tick = setInterval(
            this.clockTick,
            1000
        );
    }

    componentWillUnmount() {
        clearInterval(this.tick);
    }

    clockTick() {
        this.setState({
            time: new Date().toISOString().substr(11, 8)
        });
    }

    render() {
        return (
            <div id="test-reactapp-clock">
                {this.state.time}
            </div>);
    }

}

class RootComponent extends React.Component {

    render() {
        return (
            <div>
                <hr />
                <Clock sampleProp="propertyValue!" />
                Hover over the ticking clock to log the <code>Clock</code> state in a mouseover event.
            </div>
        );
    }

}

export default RootComponent;