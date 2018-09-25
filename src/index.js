import React, { Component } from 'react';
import ReactDOM from 'react-dom';

/**
*
* Import all the .js files in the /fx directory. This needs a babel plugin to function properly.
* TODO: Replace with babel-plugin-macros
*
**/
import * as fx from "./fx/*.js";

/**
*
* The withNeon HoC wrapper.
* Neon works by taking a React component and returning a new component that includes a canvas element as well.
* This should really be using a portal though, so expect it to change soon.
*
**/
const withNeon = (NeonComponent, effect) => {
    
    return class extends Component {

        /**
        *
        * Use React's nice new createRef() method to generate some refs for the component and canvas
        *
        **/
        componentref = React.createRef();
        canvasref = React.createRef();

        /**
        *
        * The resize callback needs to run in the context of this class
        *
        **/
        resize = this.resize.bind(this);

        constructor(props) {
            super(props);

            /**
            *
            * The effect plugin that's passed in from the withNeon HoC
            *
            **/
            this.fx = effect;

            /**
            *
            * ro is a resizeObserver. This calls the resize callback once the page is ready, and again
            * every time the component is resized (eg by the window changing, or the content)
            *
            **/
            this.ro = new window.ResizeObserver(this.resize);
        }

        /**
        *
        * The resize callback takes a parameter, c, that contains the current component element (in an array).
        *
        **/
        resize(c) {

            /**
            *
            * Stop the current animation, otherwise it'll be run twice when the resize event completes
            *
            **/
            this.fx.cancel();

            /**
            *
            * getBoundingClientRect() returns an immutable DOMRect object, so we need to get the data from the
            * DOM and then turn it in to a more useful set of properties. Destructuring for the win.
            *
            **/
            const bb = c[0].target.getBoundingClientRect();
            let { top, left, width, height } = bb;

            /**
            *
            * If the effect needs to draw outside of the region defined by the component it'll have a padding
            * value set. We double the padding (so it's equal on all sides) and then subtract the padding from
            * the top and left to move the origin to the right position.
            *
            **/
            if (this.fx.padding > 0) {
                width += this.fx.padding * 2;
                height += this.fx.padding * 2;
                top -= this.fx.padding;
                left -= this.fx.padding;
            }

            /**
            *
            * Update the CSS styles of the canvas using the new size and position data.
            * NOTE: This is what makes the canvas visible (display: 'block').
            * NOTE: The pointerEvents: 'none' setting stops the canvas getting any mouse events.
            *
            **/
            Object.assign(this.canvasref.current.style, {
                display: 'block',
                position: 'absolute',
                width: width+'px',
                height: height+'px',
                top: top+'px',
                left: left+'px',
                zIndex: 999,
                pointerEvents: 'none'
            });

            /**
            *
            * HTML5's canvas element uses the width and height attributes to define what size canvas we can draw on.
            * If these are different to the element's CSS style we get horrible rescaling artefacts.
            *
            **/
            this.canvasref.current.width = width;
            this.canvasref.current.height = height;

            /**
            *
            * Right now we use a 2d context for everything, but in the future this will change to a value defined
            * by the plugin so we can have 3d contexts for shaders.
            *
            **/
            const ctx = this.canvasref.current.getContext('2d');

            /**
            *
            * Finally we attach to the effect passing in the component element, the canvas context and the 
            * bounding box data.
            *
            **/
            this.fx.attach(ReactDOM.findDOMNode(this.componentref.current), ctx, { top, left, width, height });
            this.fx.draw();

        }

        /**
        *
        * componentDidMount() runs when the element has been attached to the DOM. At this point we can set up our
        * event listeners (eg clicking and mouse movement on the component). We couldn't do that until the element
        * is part of the DOM.
        * We also need to set the ResizeObserver to observe the new element. When this happens the resize callback
        * runs which does things like updating the CSS styles to make the canvas visible.
        *
        **/
        componentDidMount(){
            this.fx.listeners(ReactDOM.findDOMNode(this.componentref.current));
            this.ro.observe(ReactDOM.findDOMNode(this.componentref.current));
        }

        /**
        *
        * The withNeon render() function renders the component that's being wrapped along with a canvas. The canvas
        * isn't displayed to start with - we want it to only be visible once the resize observer has been run.
        *
        **/
        render() {
            return (
                <React.Fragment>
                    <NeonComponent ref={this.componentref} />
                    <canvas ref={this.canvasref} style={{ display: 'none' }} />
                </React.Fragment>
            )
        }
    }

}

/**
*
* Export the withNeon HoC as the default and the fx library. This way users who have their own effect can import
* the withNeon function on it's own.
*
**/
export { withNeon as default, fx };
