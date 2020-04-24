import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Collapsible extends Component {
  constructor(props) {
    super(props)

    this.timeout = undefined;

    // Bind class methods
    this.handleTriggerClick = this.handleTriggerClick.bind(this);
    this.handleTransitionEnd = this.handleTransitionEnd.bind(this);
    this.continueOpenCollapsible = this.continueOpenCollapsible.bind(this);
    this.setInnerRef = this.setInnerRef.bind(this);

    // Defaults the dropdown to be closed
    if (props.open) {
      this.state = {
        isClosed: false,
        shouldSwitchAutoOnNextCycle: false,
        height: 'auto',
        transition: 'none',
        hasBeenOpened: true,
        overflow: props.overflowWhenOpen,
        inTransition: false,
      }
    } else {
      this.state = {
        isClosed: true,
        shouldSwitchAutoOnNextCycle: false,
        height: 0,
        transition: `height ${props.transitionTime}ms ${props.easing}`,
        hasBeenOpened: false,
        overflow: 'hidden',
        inTransition: false,
      }
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.shouldOpenOnNextCycle) {
      this.continueOpenCollapsible();
    }

    if (prevState.height === 'auto' && this.state.shouldSwitchAutoOnNextCycle === true) {
      window.clearTimeout(this.timeout);
      this.timeout = window.setTimeout(() => { // Set small timeout to ensure a true re-render
        this.setState({
          height: 0,
          overflow: 'hidden',
          isClosed: true,
          shouldSwitchAutoOnNextCycle: false,
        });
      }, 50);
    }

    // If there has been a change in the open prop (controlled by accordion)
    if (prevProps.open !== this.props.open) {
      if (this.props.open === true) {
        this.openCollapsible();
        this.props.onOpening();
      } else {
        this.closeCollapsible();
        this.props.onClosing();
      }
    }
  }

  componentWillUnmount() {
    window.clearTimeout(this.timeout);
  }

  closeCollapsible() {
    this.setState({
      shouldSwitchAutoOnNextCycle: true,
      height: this.innerRef.scrollHeight,
      transition: `height ${this.props.transitionCloseTime ?
        this.props.transitionCloseTime : this.props.transitionTime}ms ${this.props.easing}`,
      inTransition: true,
    });
  }

  openCollapsible() {
    this.setState({
      inTransition: true,
      shouldOpenOnNextCycle: true,
    });
  }

  continueOpenCollapsible() {
    this.setState({
      height: this.innerRef.scrollHeight,
      transition: `height ${this.props.transitionTime}ms ${this.props.easing}`,
      isClosed: false,
      hasBeenOpened: true,
      inTransition: true,
      shouldOpenOnNextCycle: false,
    });
  }

  handleTriggerClick(event) {
    if (this.props.triggerDisabled) {
      return
    }

    event.preventDefault();


    if (this.props.handleTriggerClick) {
      this.props.handleTriggerClick(this.props.accordionPosition);
    } else {
      if (this.state.isClosed === true) {
        this.openCollapsible();
        this.props.onOpening();
      } else {
        this.closeCollapsible();
        this.props.onClosing();
      }
    }
  }

  renderNonClickableTriggerElement() {
    if (this.props.triggerSibling && typeof this.props.triggerSibling === 'string') {
      return (
        <span className={`${this.props.classParentString}__trigger-sibling`}>{this.props.triggerSibling}</span>
      )
    } else if (typeof this.props.triggerSibling === 'object') {
        return this.props.triggerSibling
    } else if (typeof this.props.triggerSibling === 'function') {
        return <this.props.triggerSibling />
    }
    return null;
  }

  handleTransitionEnd(e) {
    // only handle transitions that origin from the container of this component
    if (e.target !== this.innerRef) {
      return;
    }
    // Switch to height auto to make the container responsive
    if (!this.state.isClosed) {
      this.setState({ height: 'auto', overflow: this.props.overflowWhenOpen, inTransition: false });
      this.props.onOpen();
    } else {
      this.setState({ inTransition: false });
      this.props.onClose();
    }
  }

  setInnerRef(ref) {
    this.innerRef = ref
  }

  render() {
    const dropdownStyle = {
      height: this.state.height,
      WebkitTransition: this.state.transition,
      msTransition: this.state.transition,
      transition: this.state.transition,
      overflow: this.state.overflow,
    }

    var openClass = this.state.isClosed ? 'is-closed' : 'is-open';
    var disabledClass = this.props.triggerDisabled ? 'is-disabled' : '';

    //If user wants different text when tray is open
    var trigger = (this.state.isClosed === false) && (this.props.triggerWhenOpen !== undefined)
      ? this.props.triggerWhenOpen
      : this.props.trigger;

    const ContentContainerElement = this.props.contentContainerTagName;

    // If user wants a trigger wrapping element different than 'span'
    const TriggerElement = this.props.triggerTagName;

    // Don't render children until the first opening of the Collapsible if lazy rendering is enabled
    var children = this.props.lazyRender
      && !this.state.hasBeenOpened
      && this.state.isClosed
      && !this.state.inTransition ? null : this.props.children;

    // Construct CSS classes strings
    const headerClassString = `${this.props.classParentString}__header`;
    const triggerClassString = `${this.props.classParentString}__trigger ${openClass} ${disabledClass} ${
      this.state.isClosed ? this.props.triggerClassName : this.props.triggerOpenedClassName
      }`;
    const parentClassString = `${this.props.classParentString} ${
      this.state.isClosed ? this.props.className : this.props.openedClassName
      }`;
    const outerClassString = `${this.props.classParentString}__contentOuter ${this.props.contentOuterClassName}`;
    const innerClassString = `${this.props.classParentString}__contentInner ${this.props.contentInnerClassName}`;

    return (
      <ContentContainerElement className={parentClassString.trim()} {...this.props.containerElementProps} >
        <div className={headerClassString}>
            <TriggerElement
              className={triggerClassString.trim()}
              onClick={this.handleTriggerClick}
              style={this.props.triggerStyle && this.props.triggerStyle}
              onKeyPress={(event) => {
                const { key } = event;
                if (key === ' ' || key === 'Enter') {
                  this.handleTriggerClick(event);
                }
              }}
              tabIndex={this.props.tabIndex && this.props.tabIndex}
              {...this.props.triggerElementProps}
            >
              {trigger}
            </TriggerElement>

            {this.renderNonClickableTriggerElement()}
        </div>

        <div
          className={outerClassString.trim()}
          style={dropdownStyle}
          onTransitionEnd={this.handleTransitionEnd}
          ref={this.setInnerRef}
        >
          <div
            className={innerClassString.trim()}
          >
            {children}
          </div>
        </div>
      </ContentContainerElement>
    );
  }
}

Collapsible.propTypes = {
  transitionTime: PropTypes.number,
  transitionCloseTime: PropTypes.number,
  triggerTagName: PropTypes.string,
  easing: PropTypes.string,
  open: PropTypes.bool,
  containerElementProps: PropTypes.object,
  triggerElementProps: PropTypes.object,
  classParentString: PropTypes.string,
  openedClassName: PropTypes.string,
  triggerStyle: PropTypes.object,
  triggerClassName: PropTypes.string,
  triggerOpenedClassName: PropTypes.string,
  contentOuterClassName: PropTypes.string,
  contentInnerClassName: PropTypes.string,
  accordionPosition: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  handleTriggerClick: PropTypes.func,
  onOpen: PropTypes.func,
  onClose: PropTypes.func,
  onOpening: PropTypes.func,
  onClosing: PropTypes.func,
  trigger: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element
  ]),
  triggerWhenOpen: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element
  ]),
  triggerDisabled: PropTypes.bool,
  lazyRender: PropTypes.bool,
  overflowWhenOpen: PropTypes.oneOf([
    'hidden',
    'visible',
    'auto',
    'scroll',
    'inherit',
    'initial',
    'unset',
  ]),
  triggerSibling: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.func,
  ]),
  tabIndex: PropTypes.number,
  contentContainerTagName: PropTypes.string,
}

Collapsible.defaultProps = {
  transitionTime: 400,
  transitionCloseTime: null,
  triggerTagName: 'span',
  easing: 'linear',
  open: false,
  classParentString: 'Collapsible',
  triggerDisabled: false,
  lazyRender: false,
  overflowWhenOpen: 'hidden',
  openedClassName: '',
  triggerStyle: null,
  triggerClassName: '',
  triggerOpenedClassName: '',
  contentOuterClassName: '',
  contentInnerClassName: '',
  className: '',
  triggerSibling: null,
  onOpen: () => { },
  onClose: () => { },
  onOpening: () => { },
  onClosing: () => { },
  tabIndex: null,
  contentContainerTagName: 'div',
};

export default Collapsible;
