import _ from 'lodash';
import React, { PureComponent } from 'react';
import cx from 'classnames';
import Button from '/imports/ui/components/button/component';
import CaptionsButtonContainer from '/imports/ui/components/actions-bar/captions/container';
import withShortcutHelper from '/imports/ui/components/shortcut-help/service';
import { styles } from './styles.scss';
import ActionsDropdown from './actions-dropdown/container';
import ScreenshareButtonContainer from '/imports/ui/components/actions-bar/screenshare/container';
import AudioControlsContainer from '../audio/audio-controls/container';
import JoinVideoOptionsContainer from '../video-provider/video-button/container';
import PresentationOptionsContainer from './presentation-options/component';


import { ACTIONS, PANELS } from '../layout/enums';

const CHAT_CONFIG = Meteor.settings.public.chat;
const PUBLIC_CHAT_ID = CHAT_CONFIG.public_id;
class ActionsBar extends PureComponent {

  constructor(props) {
    super(props);
    this.pollId = _.uniqueId('action-item-');
  }

  handleClickToggleChat = () => {
    const {sidebarContentIsOpen,sidebarContentPanel,idChatOpen,layoutContextDispatch}=this.props;
    // Verify if chat panel is open

    if (sidebarContentIsOpen && sidebarContentPanel === PANELS.CHAT) {
      if (idChatOpen === 'public') {
        layoutContextDispatch({
          type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
          value: false,
        });
        layoutContextDispatch({
          type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
          value: PANELS.NONE,
        });
        layoutContextDispatch({
          type: ACTIONS.SET_ID_CHAT_OPEN,
          value: '',
        });
      } else {
        layoutContextDispatch({
          type: ACTIONS.SET_ID_CHAT_OPEN,
          value: 'public',
        });
      }
    } else {
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
        value: 'public',
      });
    }
  };

  openPoll=() => {
    const {layoutContextDispatch}=this.props;
    if (Session.equals('pollInitiated', true)) {
      Session.set('resetPollPanel', true);
    }
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
      value: true,
    });
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
      value: PANELS.POLL,
    });
    Session.set('forcePollOpen', true);
  }

  handleToggleUserList=() => {
    const {
      sidebarNavigation,
      sidebarContent,
      layoutContextDispatch,
    } = this.props;

    if (sidebarNavigation.isOpen) {
      if (sidebarContent.isOpen) {
        layoutContextDispatch({
          type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
          value: false,
        });
        layoutContextDispatch({
          type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
          value: PANELS.NONE,
        });
        layoutContextDispatch({
          type: ACTIONS.SET_ID_CHAT_OPEN,
          value: '',
        });
      }

      layoutContextDispatch({
        type: ACTIONS.SET_SIDEBAR_NAVIGATION_IS_OPEN,
        value: false,
      });
      layoutContextDispatch({
        type: ACTIONS.SET_SIDEBAR_NAVIGATION_PANEL,
        value: PANELS.NONE,
      });
    } else {
      layoutContextDispatch({
        type: ACTIONS.SET_SIDEBAR_NAVIGATION_IS_OPEN,
        value: true,
      });
      layoutContextDispatch({
        type: ACTIONS.SET_SIDEBAR_NAVIGATION_PANEL,
        value: PANELS.USERLIST,
      });
    }
  }

  openInviteList =()=>{
    //NoteService.toggleNotePanel(sidebarContentPanel, layoutContextDispatch)
    const {
      sidebarContentPanel,
      layoutContextDispatch,
    } = this.props;
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
      value: sidebarContentPanel !== PANELS.INVITE,
    });
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
      value: sidebarContentPanel === PANELS.INVITE
        ? PANELS.NONE
        : PANELS.INVITE,
    });
  }

  leaveSession() {
    makeCall('userLeftMeeting');
    // we don't check askForFeedbackOnLogout here,
    // it is checked in meeting-ended component
    Session.set('codeError', this.LOGOUT_CODE);
  }

  render() {
    const {
      amIPresenter,
      amIModerator,
      enableVideo,
      isLayoutSwapped,
      toggleSwapLayout,
      handleTakePresenter,
      intl,
      isSharingVideo,
      stopExternalVideoShare,
      isCaptionsAvailable,
      isMeteorConnected,
      isPollingEnabled,
      isSelectRandomUserEnabled,
      isRaiseHandButtonEnabled,
      isPresentationDisabled,
      isThereCurrentPresentation,
      allowExternalVideo,
      setEmojiStatus,
      currentUser,
      shortcuts,
      layoutContextDispatch,
      actionsBarStyle,
    } = this.props;

    return (
      <div
        className={styles.actionsbar}
        style={
          {
            height: actionsBarStyle.innerHeight,
          }
        }
      >
        <div className={styles.left}>
          <ActionsDropdown {...{
            amIPresenter,
            amIModerator,
            isPollingEnabled,
            isSelectRandomUserEnabled,
            allowExternalVideo,
            handleTakePresenter,
            intl,
            isSharingVideo,
            stopExternalVideoShare,
            isMeteorConnected,
          }}
          />
          {isCaptionsAvailable
            ? (
              <CaptionsButtonContainer {...{ intl }} />
            )
            : null}
        </div>
        <div className={styles.center}>
          <AudioControlsContainer />
          {enableVideo
            ? (
              <JoinVideoOptionsContainer />
            )
            : null}
          <ScreenshareButtonContainer {...{
            amIPresenter,
            isMeteorConnected,
          }}
          />

          <Button
            label='Public Chat'
            aria-label='Public Chat'
            icon="chat"
            onClick={this.handleClickToggleChat}
            ghost={this.props.idChatOpen!=='public'}
            hideLabel
            circle
            size="lg"
            color={this.props.idChatOpen==='public' ? 'primary' : 'default'}
            className={cx(this.props.idChatOpen==='public' || styles.btn)}
          />
          {amIPresenter && isPollingEnabled ?
          <Button 
            
            label='Start Poll'
            aria-label='Polling'
            icon="polling"
            onClick={this.openPoll}
            ghost={true}
            hideLabel
            circle
            size="lg"
            color={'default'}
            className={cx(styles.btn)}
          />
          :null
          }

          {/* <Button 
            
            label='Users'
            aria-label='User'
            icon="user"
            onClick={this.handleToggleUserList}
            ghost={true}
            hideLabel
            circle
            size="lg"
            color={'default'}
            className={cx(styles.btn)}
          />
          <Button 
            
            label='Users'
            aria-label='User'
            icon="user"
            onClick={this.openInviteList}
            ghost={true}
            hideLabel
            circle
            size="lg"
            color={'default'}
            className={cx(styles.btn)}
          /> */}

          <Button 
            
            label='Leave meeting'
            aria-label='Leave meeting'
            icon="logout"
            onClick={this.leaveSession}
            ghost={true}
            hideLabel
            circle
            size="lg"
            color={'danger'}
            className={cx(styles.btn)}
          />
          
        </div>
        <div className={styles.right}>
          {isLayoutSwapped && !isPresentationDisabled
            ? (
              <PresentationOptionsContainer
                toggleSwapLayout={toggleSwapLayout}
                layoutContextDispatch={layoutContextDispatch}
                isThereCurrentPresentation={isThereCurrentPresentation}
              />
            )
            : null}
          {isRaiseHandButtonEnabled
            ? (
              <Button
                icon="hand"
                label={intl.formatMessage({
                  id: `app.actionsBar.emojiMenu.${
                    currentUser.emoji === 'raiseHand'
                      ? 'lowerHandLabel'
                      : 'raiseHandLabel'
                  }`,
                })}
                accessKey={shortcuts.raisehand}
                color={currentUser.emoji === 'raiseHand' ? 'primary' : 'default'}
                data-test={currentUser.emoji === 'raiseHand' ? 'lowerHandLabel' : 'raiseHandLabel'}
                ghost={currentUser.emoji !== 'raiseHand'}
                className={cx(currentUser.emoji === 'raiseHand' || styles.btn)}
                hideLabel
                circle
                size="lg"
                onClick={() => {
                  setEmojiStatus(
                    currentUser.userId,
                    currentUser.emoji === 'raiseHand' ? 'none' : 'raiseHand',
                  );
                }}
              />
            )
            : null}
        </div>
      </div>
    );
  }
}

export default withShortcutHelper(ActionsBar, ['raiseHand']);
