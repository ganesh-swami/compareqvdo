import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Session } from 'meteor/session';
import Button from '/imports/ui/components/button/component';
import { defineMessages, injectIntl } from 'react-intl';
import { styles } from './styles';
import cx from 'classnames';

const intlMessages = defineMessages({
  confirmLabel: {
    id: 'app.audioModal.yes',
    description: 'Hear yourself yes',
  },
  disconfirmLabel: {
    id: 'app.audioModal.no',
    description: 'Hear yourself no',
  },
  confirmAriaLabel: {
    id: 'app.audioModal.yes.arialabel',
    description: 'provides better context for yes btn label',
  },
  disconfirmAriaLabel: {
    id: 'app.audioModal.no.arialabel',
    description: 'provides better context for no btn label',
  },
});

const propTypes = {
  handleYes: PropTypes.func.isRequired,
  handleNo: PropTypes.func.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
};

class EchoTest extends Component {
  constructor(props) {
    super(props);
    this.state = {
      disabled: false,
    };
    this.handleYes = props.handleYes.bind(this);
    this.handleNo = props.handleNo.bind(this);
  }

  componentDidMount() {
    Session.set('inEchoTest', true);
  }

  componentWillUnmount() {
    Session.set('inEchoTest', false);
  }

  render() {
    const {
      intl,
    } = this.props;
    const { disabled } = this.state;
    const disableYesButtonClicked = (callback) => () => {
      this.setState({ disabled: true }, callback);
    };
    return (
      <span className={styles.echoTest}>
        <Button
          className={cx(styles.button,'imsechotest')}
          label={intl.formatMessage(intlMessages.confirmLabel)}
          aria-label={intl.formatMessage(intlMessages.confirmAriaLabel)}
          icon="thumbs_up"
          disabled={disabled}
          circle
          color="green"
          size="jumbo"
          onClick={disableYesButtonClicked(this.handleYes)}
        />
        <Button
          className={cx(styles.button,'imsechotest')}
          label={intl.formatMessage(intlMessages.disconfirmLabel)}
          aria-label={intl.formatMessage(intlMessages.disconfirmAriaLabel)}
          icon="thumbs_down"
          circle
          color="green"
          size="jumbo"
          onClick={this.handleNo}
        />
      </span>
    );
  }
}

export default injectIntl(EchoTest);

EchoTest.propTypes = propTypes;
