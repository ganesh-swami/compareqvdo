import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages } from 'react-intl';
import Icon from '/imports/ui/components/icon/component';
import _ from 'lodash';
import { styles } from './styles';
import cx from 'classnames';
import { PANELS, ACTIONS } from '../../../../../layout/enums';


const messages = defineMessages({
  presenter: {
    id: 'app.userList.presenter',
    description: 'Text for identifying presenter user',
  },
  you: {
    id: 'app.userList.you',
    description: 'Text for identifying your user',
  },
  locked: {
    id: 'app.userList.locked',
    description: 'Text for identifying locked user',
  },
  moderator: {
    id: 'app.userList.moderator',
    description: 'Text for identifying moderator user',
  },
  mobile: {
    id: 'app.userList.mobile',
    description: 'Text for identifying mobile user',
  },
  guest: {
    id: 'app.userList.guest',
    description: 'Text for identifying guest user',
  },
  menuTitleContext: {
    id: 'app.userList.menuTitleContext',
    description: 'adds context to userListItem menu title',
  },
  sharingWebcam: {
    id: 'app.userList.sharingWebcam',
    description: 'Text for identifying who is sharing webcam',
  },
  userAriaLabel: {
    id: 'app.userList.userAriaLabel',
    description: 'aria label for each user in the userlist',
  },
});

const propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }).isRequired,
  compact: PropTypes.bool.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  isThisMeetingLocked: PropTypes.bool.isRequired,
  isMe: PropTypes.func.isRequired,
  userAriaLabel: PropTypes.string.isRequired,
  isActionsOpen: PropTypes.bool.isRequired,
};

const LABEL = Meteor.settings.public.user.label;
const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

const UserName = (props) => {
  const {
    intl,
    compact,
    isThisMeetingLocked,
    userAriaLabel,
    isActionsOpen,
    isMe,
    user,
    voiceUser,
    allowPrivateChat,
    allowsetPresenter,
    currentUser,
    getGroupChatPrivate,
    assignPresenter,
    layoutContextDispatch
  } = props;

  if (compact) {
    return null;
  }

  const userNameSub = [];

  if (compact) {
    return null;
  }

  console.log('[user-name] user ',user);

  if (user.isSharingWebcam && LABEL.sharingWebcam) {
    userNameSub.push(
      <span key={_.uniqueId('video-')}>
        <Icon iconName="video" />
        &nbsp;
        {intl.formatMessage(messages.sharingWebcam)}
      </span>,
    );
  }

  if (isThisMeetingLocked && user.locked && user.role !== ROLE_MODERATOR) {
    userNameSub.push(
      <span key={_.uniqueId('lock-')}>
        <Icon iconName="lock" />
        &nbsp;
        {intl.formatMessage(messages.locked)}
      </span>,
    );
  }

  if (user.role === ROLE_MODERATOR) {
    if (LABEL.moderator) userNameSub.push(intl.formatMessage(messages.moderator));
  }

  if (user.mobile) {
    if (LABEL.mobile) userNameSub.push(intl.formatMessage(messages.mobile));
  }

  if (user.guest) {
    if (LABEL.guest) userNameSub.push(intl.formatMessage(messages.guest));
  }

  return (
    <div
      className={styles.userName}
      role="button"
      aria-label={userAriaLabel}
      aria-expanded={isActionsOpen}
    >
      <span aria-hidden className={styles.userNameMain}>
        <span>
          {user.name} 
          <i>{(isMe(user.userId)) ? `(${intl.formatMessage(messages.you)})` : ''}</i>
          &nbsp;
        </span>
        
          <div className={styles.horiactions}>
              <div className={cx(styles.horiaction, voiceUser.isMuted || !voiceUser.isVoiceUser ? styles.red : styles.green )}
                // className={cx(styles.horiaction, {
                //   [styles.red]: voiceUser.isMuted || !voiceUser.isVoiceUser,
                //   [styles.presenter]: presenter,
                //   [styles.whiteboardAccess]: whiteboardAccess && !presenter,
                //   [styles.muted]: muted,
                //   [styles.listenOnly]: listenOnly,
                //   [styles.voice]: voice,
                //   [styles.noVoice]: noVoice && !listenOnly,
                // }, className)}
              >
                {voiceUser.isVoiceUser && voiceUser.isMuted ? <Icon iconName="mute" /> : null}
                {voiceUser.isListenOnly ? <Icon iconName="listen" /> : null}
                {voiceUser.isVoiceUser && !voiceUser.isMuted ? <Icon iconName="unmute" /> : null}
                {!voiceUser.isVoiceUser && !voiceUser.isListenOnly ? <Icon iconName="audio_off" /> : null}
              </div>
              
              {user.isSharingWebcam && LABEL.sharingWebcam ? 
                <div className={cx(styles.horiaction,styles.green)}><Icon iconName="video" /> </div>
              : null}
              
              {
                //!isMe(user.userId) && 
                allowPrivateChat ? 
                <div className={styles.horiaction}
                onClick={ () => {
                    //this.handleClose();
                    getGroupChatPrivate(currentUser.userId, user);
                    layoutContextDispatch({
                      type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
                      value: true,
                    });
                    layoutContextDispatch({
                      type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
                      value: PANELS.CHAT,
                    });
                    layoutContextDispatch({
                      type: ACTIONS.SET_ID_CHAT_OPEN,
                      value: user.userId,
                    });
                  }
                }
                
                >
                  <Icon iconName="chat" />
                </div>
                : null
              }

              {
                allowsetPresenter ? 
                <div className={styles.horiaction}
                onClick={ () => {
                    assignPresenter(user.userId);
                  }
                }
                >
                  <Icon iconName="presentation" />
                </div>
                : null
              }
          </div>
      </span>
      {
        userNameSub.length
          ? (
            <span
              aria-hidden
              className={styles.userNameSub}
              data-test={user.mobile ? 'mobileUser' : undefined}
            >
              {userNameSub.reduce((prev, curr) => [prev, ' | ', curr])}
            </span>
          )
          : null
      }
    </div>
  );
};

UserName.propTypes = propTypes;
export default UserName;
