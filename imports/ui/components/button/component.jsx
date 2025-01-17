import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import TooltipContainer from '/imports/ui/components/tooltip/container';
import { styles } from './styles';
import Icon from '../icon/component';
import BaseButton from './base/component';
import ButtonEmoji from './button-emoji/ButtonEmoji';

const SIZES = [
  'jumbo', 'lg', 'md', 'sm',
];

const COLORS = [
  'default', 'primary', 'danger', 'warning', 'success', 'dark', 'offline','green'
];

const propTypes = {
  ...BaseButton.propTypes,
  /**
   * Defines the button size style
   * @type {("lg"|"md"|"sm")}
   * @defaultValue 'md'
   */
  size: PropTypes.oneOf(SIZES),

  /**
   * Defines the button color style
   * @type {("default"|"primary"|"danger"|"success")}
   * @defaultValue 'md'
   */
  color: PropTypes.oneOf(COLORS),

  /**
   * Defines if the button should be styled as a ghost (outline)
   * @defaultValue false
   */
  ghost: PropTypes.bool,

  /**
   * Defines if the button should be styled as circle
   * @defaultValue false
   */
  circle: PropTypes.bool,

  /**
   * Defines if the button should have `display: block`
   * @defaultValue false
   */
  block: PropTypes.bool,

  /**
   * Defines the button icon
   * @defaultValue undefined
   */
  icon: PropTypes.string,

  /**
   * Defines the button icon is on the right side
   * @defaultValue false
   */
  iconRight: PropTypes.bool,

  /**
   * Defines the button label should be visible
   * @defaultValue false
   */
  hideLabel: PropTypes.bool,

  /**
   * Optional SVG / html object can be passed to the button as an icon
   * Has to be styled before being sent to the Button
   * (e.g width, height, position and percentage-based object's coordinates)
   * @defaultvalue undefined
   */
  customIcon: PropTypes.node,
};

const defaultProps = {
  ...BaseButton.defaultProps,
  size: 'md',
  color: 'default',
  ghost: false,
  circle: false,
  block: false,
  iconRight: false,
  hideLabel: false,
  tooltipLabel: '',
};

export default class Button extends BaseButton {
  _getClassNames() {
    const {
      size,
      color,
      ghost,
      circle,
      block,
    } = this.props;

    const propClassNames = {};

    propClassNames[styles.button] = true;
    propClassNames[styles[size]] = true;
    propClassNames[styles[color]] = true;
    propClassNames[styles.ghost] = ghost;
    propClassNames[styles.circle] = circle;
    propClassNames[styles.block] = block;

    return propClassNames;
  }

  _cleanProps(otherProps) {
    const remainingProps = Object.assign({}, otherProps);
    delete remainingProps.icon;
    delete remainingProps.customIcon;
    delete remainingProps.size;
    delete remainingProps.color;
    delete remainingProps.ghost;
    delete remainingProps.circle;
    delete remainingProps.block;
    delete remainingProps.hideLabel;
    delete remainingProps.tooltipLabel;

    return remainingProps;
  }

  hasButtonEmojiComponent() {
    const { children } = this.props;

    if (!children) return false;

    const buttonEmoji = React.Children.only(children);

    return (buttonEmoji && buttonEmoji.type && buttonEmoji.type.name)
      ? (buttonEmoji.type.name === ButtonEmoji.name)
      : false;
  }

  render() {
    const {
      circle,
      hideLabel,
      label,
      'aria-label': ariaLabel,
      'aria-expanded': ariaExpanded,
      tooltipLabel,
    } = this.props;

    const renderFuncName = circle ? 'renderCircle' : 'renderDefault';

    if ((hideLabel && !ariaExpanded) || tooltipLabel) {
      const buttonLabel = label || ariaLabel;
      return (
        <TooltipContainer
          title={tooltipLabel || buttonLabel}
        >
          {this[renderFuncName]()}
        </TooltipContainer>
      );
    }

    return this[renderFuncName]();
  }

  renderDefault() {
    const {
      className,
      iconRight,
      ...otherProps
    } = this.props;

    const remainingProps = this._cleanProps(otherProps);

    /* TODO: We can change this and make the button with flexbox to avoid html
      changes */
    const renderLeftFuncName = !iconRight ? 'renderIcon' : 'renderLabel';
    const renderRightFuncName = !iconRight ? 'renderLabel' : 'renderIcon';

    return (
      <BaseButton
        className={cx(this._getClassNames(), className)}
        {...remainingProps}
      >
        {this[renderLeftFuncName]()}
        {this[renderRightFuncName]()}
      </BaseButton>
    );
  }

  renderCircle() {
    const {
      className,
      size,
      iconRight,
      children,
      ...otherProps
    } = this.props;

    const remainingProps = this._cleanProps(otherProps);

    return (
      <BaseButton
        className={cx(styles[size], styles.buttonWrapper, className)}
        {...remainingProps}
      >
        {this.renderButtonEmojiSibling()}
        {!iconRight ? null : this.renderLabel()}
        <span className={cx(this._getClassNames())}>
          {this.renderIcon()}
        </span>
        {iconRight ? null : this.renderLabel()}
        {this.hasButtonEmojiComponent() ? children : null}
      </BaseButton>
    );
  }

  renderButtonEmojiSibling() {
    if (!this.hasButtonEmojiComponent()) {
      return null;
    }

    return (<span className={styles.emojiButtonSibling} />);
  }

  renderIcon() {
    const {
      icon: iconName,
      customIcon,
    } = this.props;

    if (iconName) {
      return (<Icon className={styles.icon} iconName={iconName} />);
    } if (customIcon) {
      return customIcon;
    }

    return null;
  }

  renderLabel() {
    const { label, hideLabel } = this.props;

    const classNames = {};

    classNames[styles.label] = true;
    classNames[styles.hideLabel] = hideLabel;

    return (
      <span className={cx(classNames)}>
        {label}
        {!this.hasButtonEmojiComponent() ? this.props.children : null}
      </span>
    );
  }
}

Button.propTypes = propTypes;
Button.defaultProps = defaultProps;
