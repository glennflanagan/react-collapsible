import React from 'react';


var Collapsible = React.createClass({

  //Set validation for prop types
  propTypes: {
    transitionTime: React.PropTypes.number,
    easing: React.PropTypes.string,
    open: React.PropTypes.bool,
    classParentString: React.PropTypes.string,
    openedClassName: React.PropTypes.string,
    triggerClassName: React.PropTypes.string,
    triggerOpenedClassName: React.PropTypes.string,
    contentOuterClassName: React.PropTypes.string,
    contentInnerClassName: React.PropTypes.string,
    accordionPosition: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.number]),
    handleTriggerClick: React.PropTypes.func,
    onOpen: React.PropTypes.func,
    onClose: React.PropTypes.func,
    trigger: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.element
    ]),
    triggerWhenOpen:React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.element
    ]),
    triggerDisabled: React.PropTypes.bool,
    lazyRender: React.PropTypes.bool,
    overflowWhenOpen: React.PropTypes.oneOf([
      'hidden',
      'visible',
      'auto',
      'scroll',
      'inherit',
      'initial',
      'unset',
    ]),
    triggerSibling: React.PropTypes.element
  },

  //If no transition time or easing is passed then default to this
  getDefaultProps: function() {
    return {
      transitionTime: 400,
      easing: 'linear',
      open: false,
      classParentString: 'Collapsible',
      triggerDisabled: false,
      lazyRender: false,
      overflowWhenOpen: 'hidden',
      openedClassName: '',
      triggerClassName: '',
      triggerOpenedClassName: '',
      contentOuterClassName: '',
      contentInnerClassName: '',
      className: '',
      triggerSibling: null,
      onOpen: () => {},
      onClose: () => {},
    };
  },

  //Defaults the dropdown to be closed
  getInitialState: function(){

    if(this.props.open){
      return {
        isClosed: false,
        shouldSwitchAutoOnNextCycle: false,
        height: 'auto',
        transition: 'none',
        hasBeenOpened: true,
        overflow: this.props.overflowWhenOpen
      }
    }
    else{
      return {
        isClosed: true,
        shouldSwitchAutoOnNextCycle: false,
        height: 0,
        transition: 'height ' + this.props.transitionTime + 'ms ' + this.props.easing,
        hasBeenOpened: false,
        overflow: 'hidden'
      }
    }
  },

  // Taken from https://github.com/EvandroLG/transitionEnd/
  // Determines which prefixed event to listen for
  whichTransitionEnd: function(element){
      var transitions = {
          'WebkitTransition' : 'webkitTransitionEnd',
          'MozTransition'    : 'transitionend',
          'OTransition'      : 'oTransitionEnd otransitionend',
          'transition'       : 'transitionend'
      };

      for(var t in transitions){
          if(element.style[t] !== undefined){
              return transitions[t];
          }
      }
  },

  componentDidMount: function() {
    //Set up event listener to listen to transitionend so we can switch the height from fixed pixel to auto for much responsiveness;
    //TODO:  Once Synthetic transitionend events have been exposed in the next release of React move this funciton to a function handed to the onTransitionEnd prop

    this.refs.outer.addEventListener(this.whichTransitionEnd(this.refs.outer), (event) => {
      if(this.state.isClosed === false){
        this.setState({
          shouldSwitchAutoOnNextCycle: true
        });
      }
      this.setState({
        inTransition: false
      })
    });
  },


  componentDidUpdate: function(prevProps) {

    if(this.state.shouldOpenOnNextCycle){
      this.continueOpenCollapsible();
    }

    if(this.state.shouldSwitchAutoOnNextCycle === true && this.state.isClosed === false) {
      //Set the height to auto to make compoenent re-render with the height set to auto.
      //This way the dropdown will be responsive and also change height if there is another dropdown within it.
      this.makeResponsive();
    }

    if(this.state.shouldSwitchAutoOnNextCycle === true && this.state.isClosed === true) {
      this.prepareToOpen();
    }

    //If there has been a change in the open prop (controlled by accordion)
    if(prevProps.open !== this.props.open) {
      if(this.props.open === true) {
        this.openCollapsible();
      }
      else {
        this.closeCollapsible();
      }
    }
  },


  handleTriggerClick: function(event) {

    event.preventDefault();

    if(this.props.triggerDisabled) {
      return
    }

    if(this.props.handleTriggerClick) {
      this.props.handleTriggerClick(this.props.accordionPosition);
    }
    else{

      if(this.state.isClosed === true){
        this.openCollapsible();
      }
      else {
        this.closeCollapsible();
      }
    }

  },

  closeCollapsible: function() {
    this.setState({
      isClosed: true,
      shouldSwitchAutoOnNextCycle: true,
      height: this.refs.inner.offsetHeight,
      overflow: 'hidden',
      inTransition: true
    }, this.props.onClose);
  },

  openCollapsible: function() {
    this.setState({
      shouldOpenOnNextCycle: true,
      inTransition: true
    });
  },

  continueOpenCollapsible: function() {
    this.setState({
      shouldOpenOnNextCycle: false,
      height: this.refs.inner.offsetHeight,
      transition: 'height ' + this.props.transitionTime + 'ms ' + this.props.easing,
      isClosed: false,
      hasBeenOpened: true,
      inTransition: true
    }, this.props.onOpen);
  },

  makeResponsive: function() {
    this.setState({
      height: 'auto',
      transition: 'none',
      shouldSwitchAutoOnNextCycle: false,
      overflow: this.props.overflowWhenOpen
    });
  },

  prepareToOpen: function() {
    //The height has been changes back to fixed pixel, we set a small timeout to force the CSS transition back to 0 on the next tick.
    window.setTimeout(() => {
      this.setState({
        height: 0,
        shouldSwitchAutoOnNextCycle: false,
        transition: 'height ' + this.props.transitionTime + 'ms ' + this.props.easing
      });
    }, 50);
  },

  renderNonClickableTriggerElement: function () {
    if (this.props.triggerSibling) {
      return (
        <span className={this.props.classParentString  + "__trigger-sibling"}>{this.props.triggerSibling}</span>
      )
    }

    return null;
  },

  render: function () {

    var dropdownStyle = {
      height: this.state.height,
      WebkitTransition: this.state.transition,
      msTransition: this.state.transition,
      transition: this.state.transition,
      overflow: this.state.overflow
    }

    var openClass = this.state.isClosed ? 'is-closed' : 'is-open';
    var disabledClass = this.props.triggerDisabled ? 'is-disabled' : ''

    //If user wants different text when tray is open
    var trigger = (this.state.isClosed === false) && (this.props.triggerWhenOpen !== undefined) ? this.props.triggerWhenOpen : this.props.trigger;

    // Don't render children until the first opening of the Collapsible if lazy rendering is enabled
    var children = this.props.children;
    if(this.props.lazyRender)
      if(this.state.isClosed && !this.state.inTransition)
        children = null;

    let triggerClassName = this.props.classParentString + "__trigger" + ' ' + openClass + ' ' + disabledClass;

    if (this.state.isClosed) {
      triggerClassName = triggerClassName + ' ' + this.props.triggerClassName;
    } else {
      triggerClassName = triggerClassName + ' ' + this.props.triggerOpenedClassName;
    }

    return(
      <div className={this.props.classParentString + ' ' + (this.state.isClosed ? this.props.className : this.props.openedClassName)}>
        <span className={triggerClassName.trim()} onClick={this.handleTriggerClick}>{trigger}</span>

        {this.renderNonClickableTriggerElement()}

        <div className={this.props.classParentString + "__contentOuter" + ' ' + this.props.contentOuterClassName } ref="outer" style={dropdownStyle}>
          <div className={this.props.classParentString + "__contentInner" + ' ' + this.props.contentInnerClassName} ref="inner">
              {children}
          </div>
        </div>
      </div>
    );
  }
});

export default Collapsible;
