import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Resizable from 're-resizable';
import { ACTIONS, PANELS } from '../layout/enums';
import ChatContainer from '/imports/ui/components/chat/container';
import InviteContainer from '/imports/ui/components/invite/container';
import NoteContainer from '/imports/ui/components/note/container';
import PollContainer from '/imports/ui/components/poll/container';
import CaptionsContainer from '/imports/ui/components/captions/pad/container';
import BreakoutRoomContainer from '/imports/ui/components/breakout-room/container';
import WaitingUsersPanel from '/imports/ui/components/waiting-users/container';
import { styles } from '/imports/ui/components/app/styles';

import { defineMessages, injectIntl } from 'react-intl';
import Icon from '/imports/ui/components/icon/component';

import UserNotesContainer from '../user-list/user-list-content/user-notes/container';

import UserParticipantsContainer from '../user-list/user-list-content/user-participants/container'


const CHAT_CONFIG = Meteor.settings.public.chat;
const PUBLIC_CHAT_KEY = CHAT_CONFIG.public_id;

const propTypes = {
  top: PropTypes.number.isRequired,
  left: PropTypes.number,
  right: PropTypes.number,
  zIndex: PropTypes.number.isRequired,
  minWidth: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  maxWidth: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  isResizable: PropTypes.bool.isRequired,
  resizableEdge: PropTypes.objectOf(PropTypes.bool).isRequired,
  layoutContextDispatch: PropTypes.func.isRequired,
};

const intlMessages = defineMessages({
  breakoutTitle: {
    id: 'app.createBreakoutRoom.title',
    description: 'breakout title',
  },
});

const defaultProps = {
  left: null,
  right: null,
};

const SidebarContent = (props) => {
  const {
    intl,
    top,
    left,
    right,
    zIndex,
    minWidth,
    width,
    maxWidth,
    minHeight,
    height,
    maxHeight,
    isResizable,
    resizableEdge,
    layoutContextDispatch,
    sidebarContentPanel,
  } = props;

  const [resizableWidth, setResizableWidth] = useState(width);
  const [resizableHeight, setResizableHeight] = useState(height);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStartWidth, setResizeStartWidth] = useState(0);
  const [resizeStartHeight, setResizeStartHeight] = useState(0);

  useEffect(() => {
    if (!isResizing) {
      setResizableWidth(width);
      setResizableHeight(height);
    }
  }, [width, height]);

  useEffect(() => {
  }, [resizeStartWidth, resizeStartHeight]);

  const setSidebarContentSize = (dWidth, dHeight) => {
    const newWidth = resizeStartWidth + dWidth;
    const newHeight = resizeStartHeight + dHeight;

    setResizableWidth(newWidth);
    setResizableHeight(newHeight);

    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_SIZE,
      value: {
        width: newWidth,
        height: newHeight,
        browserWidth: window.innerWidth,
        browserHeight: window.innerHeight,
      },
    });
  };


  const handleClickToggleChat = () => {
    // Verify if chat panel is open
    console.log('[sidebar-content] @vdo PUBLIC_CHAT_KEY',PUBLIC_CHAT_KEY)
    if (sidebarContentPanel === PANELS.CHAT) {
      
        layoutContextDispatch({
          type: ACTIONS.SET_ID_CHAT_OPEN,
          value: PUBLIC_CHAT_KEY//chat.chatId,
        });
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
        value: PUBLIC_CHAT_KEY//chat.chatId,
      });
    }
  };

  const handleClickToggleUsers = () =>{
    if (sidebarContentPanel !== PANELS.USERLIST) {
      
        layoutContextDispatch({
          type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
          value: PANELS.USERLIST
        });
    }
  }
  return (
    <Resizable
      minWidth={minWidth}
      maxWidth={maxWidth}
      minHeight={minHeight}
      maxHeight={maxHeight}
      size={{
        width,
        height,
      }}
      enable={{
        top: isResizable && resizableEdge.top,
        left: isResizable && resizableEdge.left,
        bottom: isResizable && resizableEdge.bottom,
        right: isResizable && resizableEdge.right,
      }}
      handleWrapperClass="resizeSidebarContentWrapper"
      onResizeStart={() => {
        setIsResizing(true);
        setResizeStartWidth(resizableWidth);
        setResizeStartHeight(resizableHeight);
      }}
      onResize={(...[, , , delta]) => setSidebarContentSize(delta.width, delta.height)}
      onResizeStop={() => {
        setIsResizing(false);
        setResizeStartWidth(0);
        setResizeStartHeight(0);
      }}
      style={{
        position: 'absolute',
        top,
        left,
        right,
        zIndex,
        width,
        height,
      }}
    >
      <div className={styles.sidebarMainCont}>
        <div className={styles.sidebarTopnav}>
            <div
              role="button"
              tabIndex={0}
              onClick={handleClickToggleUsers}
              data-test="breakoutRoomsItem"
              className={styles.listItem}
              aria-label="Users"
              onKeyPress={() => {}}
            >
              <Icon iconName="user" />
              <span aria-hidden>Users</span>
            </div>
            <div
              role="button"
              tabIndex={0}
              onClick={handleClickToggleChat}
              data-test="breakoutRoomsItem"
              className={styles.listItem}
              aria-label="Chat"
              onKeyPress={() => {}}
            >
              <Icon iconName="group_chat" />
              <span aria-hidden>Chat</span>
            </div>
            <UserNotesContainer
              {...{
                intl,
              }}
            />
        </div>
        {sidebarContentPanel === PANELS.CHAT && <ChatContainer />}
        {sidebarContentPanel === PANELS.SHARED_NOTES && <NoteContainer />}
        {sidebarContentPanel === PANELS.CAPTIONS && <CaptionsContainer />}
        {sidebarContentPanel === PANELS.USERLIST && <UserParticipantsContainer
          // {...{
          //   compact,
          //   intl,
          //   currentUser,
          //   setEmojiStatus,
          //   clearAllEmojiStatus,
          //   roving,
          //   requestUserInformation,
          // }}
        />}

        
        {sidebarContentPanel === PANELS.POLL
          && (
            <div className={styles.poll} style={{ minWidth, top: '0' }} id="pollPanel">
              <PollContainer />
            </div>
          )}
        {sidebarContentPanel === PANELS.BREAKOUT && <BreakoutRoomContainer />}
        {sidebarContentPanel === PANELS.WAITING_USERS && <WaitingUsersPanel />}
        {/* {sidebarContentPanel === PANELS.INVITE && <InviteContainer />} */}
      </div>
    </Resizable>
  );
};

SidebarContent.propTypes = propTypes;
SidebarContent.defaultProps = defaultProps;
export default injectIntl(SidebarContent);
