import React, { Component } from 'react';
import { defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
import { styles } from '/imports/ui/components/user-list/user-list-content/styles';
import _ from 'lodash';
import { findDOMNode } from 'react-dom';
import {
  List,
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
} from 'react-virtualized';
import UserListItemContainer from './user-list-item/container';
import UserOptionsContainer from './user-options/container';
import Settings from '/imports/ui/services/settings';
import WaitingUsersPanel from '/imports/ui/components/waiting-users/container';
import Dropdown from '/imports/ui/components/dropdown/component';
import cx from 'classnames';
import BBBMenu from "/imports/ui/components/menu/component";
import Button from '/imports/ui/components/button/component';
import CaptionsService from '/imports/ui/components/captions/service';




const propTypes = {
  compact: PropTypes.bool,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  currentUser: PropTypes.shape({}).isRequired,
  users: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  setEmojiStatus: PropTypes.func.isRequired,
  clearAllEmojiStatus: PropTypes.func.isRequired,
  roving: PropTypes.func.isRequired,
  requestUserInformation: PropTypes.func.isRequired,
};

const defaultProps = {
  compact: false,
};

const intlMessages = defineMessages({
  usersTitle: {
    id: 'app.userList.usersTitle',
    description: 'Title for the Header',
  },
  optionsLabel: {
    id: 'app.userList.userOptions.manageUsersLabel',
    description: 'Manage user label',
  },
  clearAllLabel: {
    id: 'app.userList.userOptions.clearAllLabel',
    description: 'Clear all label',
  },
  clearAllDesc: {
    id: 'app.userList.userOptions.clearAllDesc',
    description: 'Clear all description',
  },
  muteAllLabel: {
    id: 'app.userList.userOptions.muteAllLabel',
    description: 'Mute all label',
  },
  muteAllDesc: {
    id: 'app.userList.userOptions.muteAllDesc',
    description: 'Mute all description',
  },
  unmuteAllLabel: {
    id: 'app.userList.userOptions.unmuteAllLabel',
    description: 'Unmute all label',
  },
  unmuteAllDesc: {
    id: 'app.userList.userOptions.unmuteAllDesc',
    description: 'Unmute all desc',
  },
  lockViewersLabel: {
    id: 'app.userList.userOptions.lockViewersLabel',
    description: 'Lock viewers label',
  },
  lockViewersDesc: {
    id: 'app.userList.userOptions.lockViewersDesc',
    description: 'Lock viewers description',
  },
  guestPolicyLabel: {
    id: 'app.userList.userOptions.guestPolicyLabel',
    description: 'Guest policy label',
  },
  guestPolicyDesc: {
    id: 'app.userList.userOptions.guestPolicyDesc',
    description: 'Guest policy description',
  },
  muteAllExceptPresenterLabel: {
    id: 'app.userList.userOptions.muteAllExceptPresenterLabel',
    description: 'Mute all except presenter label',
  },
  muteAllExceptPresenterDesc: {
    id: 'app.userList.userOptions.muteAllExceptPresenterDesc',
    description: 'Mute all except presenter description',
  },
  createBreakoutRoom: {
    id: 'app.actionsBar.actionsDropdown.createBreakoutRoom',
    description: 'Create breakout room option',
  },
  createBreakoutRoomDesc: {
    id: 'app.actionsBar.actionsDropdown.createBreakoutRoomDesc',
    description: 'Description of create breakout room option',
  },
  activityReportLabel: {
    id: 'app.activity-report.label',
    description: 'Activity Report label',
  },
  activityReportDesc: {
    id: 'app.activity-report.description',
    description: 'Activity Report description',
  },
  invitationItem: {
    id: 'app.invitation.title',
    description: 'invitation to breakout title',
  },
  saveUserNames: {
    id: 'app.actionsBar.actionsDropdown.saveUserNames',
    description: 'Save user name feature description',
  },
  captionsLabel: {
    id: 'app.actionsBar.actionsDropdown.captionsLabel',
    description: 'Captions menu toggle label',
  },
  captionsDesc: {
    id: 'app.actionsBar.actionsDropdown.captionsDesc',
    description: 'Captions menu toggle description',
  },
  savedNamesListTitle: {
    id: 'app.userList.userOptions.savedNames.title',
    description: '',
  },
  sortedFirstNameHeading: {
    id: 'app.userList.userOptions.sortedFirstName.heading',
    description: '',
  },
  sortedLastNameHeading: {
    id: 'app.userList.userOptions.sortedLastName.heading',
    description: '',
  },
});


const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

class UserParticipants extends Component {
  constructor() {
    super();

    this.cache = new CellMeasurerCache({
      fixedWidth: true,
      keyMapper: () => 1,
    });

    this.state = {
      selectedUser: null,
      isOpen: false,
      scrollArea: false,
    };

    this.userRefs = [];

    this.getScrollContainerRef = this.getScrollContainerRef.bind(this);
    this.rove = this.rove.bind(this);
    this.changeState = this.changeState.bind(this);
    this.rowRenderer = this.rowRenderer.bind(this);
    this.handleClickSelectedUser = this.handleClickSelectedUser.bind(this);
    this.selectEl = this.selectEl.bind(this);
  }

  componentDidMount() {
    const { compact } = this.props;
    if (!compact) {
      this.refScrollContainer.addEventListener(
        'keydown',
        this.rove,
      );

      this.refScrollContainer.addEventListener(
        'click',
        this.handleClickSelectedUser,
      );
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const isPropsEqual = _.isEqual(this.props, nextProps);
    const isStateEqual = _.isEqual(this.state, nextState);
    return !isPropsEqual || !isStateEqual;
  }

  selectEl(el) {
    if (!el) return null;
    if (el.getAttribute('tabindex')) return el?.focus();
    this.selectEl(el?.firstChild);
  }

  componentDidUpdate(prevProps, prevState) {
    const { selectedUser } = this.state;

    if (selectedUser) {
      const { firstChild } = selectedUser;
      if (!firstChild.isEqualNode(document.activeElement)) {
        this.selectEl(selectedUser);
      }
    }
  }

  componentWillUnmount() {
    this.refScrollContainer.removeEventListener('keydown', this.rove);
    this.refScrollContainer.removeEventListener('click', this.handleClickSelectedUser);
  }

  getScrollContainerRef() {
    return this.refScrollContainer;
  }

  rowRenderer({
    index,
    parent,
    style,
    key,
  }) {
    const {
      compact,
      setEmojiStatus,
      users,
      requestUserInformation,
      currentUser,
      meetingIsBreakout,
    } = this.props;
    const { scrollArea } = this.state;
    const user = users[index];
    const isRTL = Settings.application.isRTL;

    return (
      <CellMeasurer
        key={key}
        cache={this.cache}
        columnIndex={0}
        parent={parent}
        rowIndex={index}
      >
        <span
          style={style}
          key={key}
          id={`user-${user.userId}`}
        >
          <UserListItemContainer
            {...{
              compact,
              setEmojiStatus,
              requestUserInformation,
              currentUser,
              meetingIsBreakout,
              scrollArea,
              isRTL,
            }}
            user={user}
            getScrollContainerRef={this.getScrollContainerRef}
          />
        </span>
      </CellMeasurer>
    );
  }

  handleClickSelectedUser(event) {
    let selectedUser = null;
    if (event.path) {
      selectedUser = event.path.find(p => p.className && p.className.includes('participantsList'));
    }
    this.setState({ selectedUser });
  }

  rove(event) {
    const { roving } = this.props;
    const { selectedUser, scrollArea } = this.state;
    const usersItemsRef = findDOMNode(scrollArea.firstChild);
    roving(event, this.changeState, usersItemsRef, selectedUser);
  }

  changeState(ref) {
    this.setState({ selectedUser: ref });
  }


  renderMenuItems() {
    const {
      intl,
      isMeetingMuted,
      mountModal,
      toggleStatus,
      toggleMuteAllUsers,
      toggleMuteAllUsersExceptPresenter,
      meetingIsBreakout,
      hasBreakoutRoom,
      isBreakoutEnabled,
      getUsersNotAssigned,
      activityReportAccessToken,
      openActivityReportUrl,
      amIModerator,
      users,
      isMeteorConnected,
      dynamicGuestPolicy,
    } = this.props;

    const canCreateBreakout = amIModerator
      && !meetingIsBreakout
      && !hasBreakoutRoom
      && isBreakoutEnabled;

    const canInviteUsers = amIModerator
      && !meetingIsBreakout
      && hasBreakoutRoom
      && getUsersNotAssigned(users).length;

    const { locale } = intl;

    this.menuItems = [];
    
    if (isMeteorConnected) {
      if (!meetingIsBreakout) {
        this.menuItems.push({
          key: this.muteAllId,
          label: intl.formatMessage(intlMessages[isMeetingMuted ? 'unmuteAllLabel' : 'muteAllLabel']),
          // description: intl.formatMessage(intlMessages[isMeetingMuted ? 'unmuteAllDesc' : 'muteAllDesc']),
          onClick: toggleMuteAllUsers,
          icon: isMeetingMuted ? 'unmute' : 'mute',
        });

        if (!isMeetingMuted) {
          this.menuItems.push({
            key: this.muteId,
            label: intl.formatMessage(intlMessages.muteAllExceptPresenterLabel),
            // description: intl.formatMessage(intlMessages.muteAllExceptPresenterDesc),
            onClick: toggleMuteAllUsersExceptPresenter,
            icon: 'mute',
          });
        }

        this.menuItems.push({
          key: this.lockId,
          label: intl.formatMessage(intlMessages.lockViewersLabel),
          // description: intl.formatMessage(intlMessages.lockViewersDesc),
          onClick: () => mountModal(<LockViewersContainer />),
          icon: 'lock'
        });



        if (dynamicGuestPolicy) {
          this.menuItems.push({
            key: this.guestPolicyId,
            icon: "user",
            label: intl.formatMessage(intlMessages.guestPolicyLabel),
            // description: intl.formatMessage(intlMessages.guestPolicyDesc),
            onClick: () => mountModal(<GuestPolicyContainer />),
            dataTest: "guestPolicyLabel",
          })
        }
      }

      if (amIModerator) {
        this.menuItems.push({
          key: this.saveUsersNameId,
          label: intl.formatMessage(intlMessages.saveUserNames),
          // description: ,
          onClick: this.onSaveUserNames,
          icon: 'download',
        });

        if (activityReportAccessToken != null) {
          this.menuItems.push({
            icon: "multi_whiteboard",
            iconRight: "popout_window",
            label: intl.formatMessage(intlMessages.activityReportLabel),
            description: intl.formatMessage(intlMessages.activityReportDesc),
            key: this.activityReportId,
            onClick: () => openActivityReportUrl(locale),
          })
        }
      }

      this.menuItems.push({
        key: this.clearStatusId,
        label: intl.formatMessage(intlMessages.clearAllLabel),
        // description: intl.formatMessage(intlMessages.clearAllDesc),
        onClick: toggleStatus,
        icon: 'clear_status',
        divider: true,
      });

      if (canCreateBreakout) {
        this.menuItems.push({
          key: this.createBreakoutId,
          icon: "rooms",
          label: intl.formatMessage(intlMessages.createBreakoutRoom),
          // description: intl.formatMessage(intlMessages.createBreakoutRoomDesc),
          onClick: this.onCreateBreakouts,
          dataTest: "createBreakoutRooms",
        })
      }

      if (canInviteUsers) {
        this.menuItems.push({
          icon: "rooms",
          label: intl.formatMessage(intlMessages.invitationItem),
          key: this.createBreakoutId,
          onClick: this.onInvitationUsers,
        })
      }

      if (amIModerator && CaptionsService.isCaptionsEnabled()) {
        this.menuItems.push({
          icon: "closed_caption",
          label: intl.formatMessage(intlMessages.captionsLabel),
          // description: intl.formatMessage(intlMessages.captionsDesc),
          key: this.captionsId,
          onClick: this.handleCaptionsClick,
          dataTest: "inviteBreakoutRooms",
        })
      }
    }

    return this.menuItems;
  }


  render() {
    const {
      compact,
      clearAllEmojiStatus,
      currentUser,
      pendingUsers,
      intl,
      isMeetingMuted,
      mountModal,
      toggleStatus,
      toggleMuteAllUsers,
      toggleMuteAllUsersExceptPresenter,
      meetingIsBreakout,
      hasBreakoutRoom,
      isBreakoutEnabled,
      getUsersNotAssigned,
      activityReportAccessToken,
      openActivityReportUrl,
      amIModerator,
      users,
      isMeteorConnected,
      dynamicGuestPolicy,
    } = this.props;
    const { isOpen, scrollArea } = this.state;

    return (
      <div className={styles.userListColumn}>
        {pendingUsers.length > 0 && currentUser.role === ROLE_MODERATOR
          ? (
            <WaitingUsersPanel />
            // <WaitingUsers
            //   {...{
            //     intl,
            //     pendingUsers,
            //     sidebarContentPanel,
            //     layoutContextDispatch,
            //   }}
            // />
          ) : null}

        {
          !compact
            ? (
              <div className={styles.container}>
                <h2 className={styles.smallTitle}>
                  {intl.formatMessage(intlMessages.usersTitle)}
                  &nbsp;(
                  {users.length}
                  )
                </h2>
                {currentUser.role === ROLE_MODERATOR
                  ? (
                    <UserOptionsContainer {...{
                      users,
                      clearAllEmojiStatus,
                      meetingIsBreakout,
                    }}
                    />
                  ) : null
                }

              </div>
            )
            : <hr className={styles.separator} />
        }

          
        <div
          id={'user-list-virtualized-scroll'}
          className={styles.virtulizedScrollableList}
          tabIndex={0}
          ref={(ref) => {
            this.refScrollContainer = ref;
          }}
        >
          <span id="participants-destination" />
          <AutoSizer>
            {({ height, width }) => (
              <List
                {...{
                  isOpen,
                  users,
                }}
                ref={(ref) => {
                  if (ref !== null) {
                    this.listRef = ref;
                  }

                  if (ref !== null && !scrollArea) {
                    this.setState({ scrollArea: findDOMNode(ref) });
                  }
                }}
                rowHeight={this.cache.rowHeight}
                rowRenderer={this.rowRenderer}
                rowCount={users.length}
                height={height - 1}
                width={width - 1}
                className={styles.scrollStyle}
                overscanRowCount={30}
                deferredMeasurementCache={this.cache}
                tabIndex={-1}
              />
            )}
          </AutoSizer>
        </div>
        {amIModerator &&  isMeteorConnected && false ?
          <div className={styles.btmoptn}>
            <Dropdown>
              <Dropdown.DropdownTrigger>
                {/* <Button
                  aria-label={intl.formatMessage(intlMessages.leaveAudio)}
                  label={intl.formatMessage(intlMessages.leaveAudio)}
                  accessKey={shortcuts.leaveaudio}
                  hideLabel
                  color="primary"
                  icon={isListenOnly ? 'listen' : 'audio_on'}
                  size="lg"
                  circle
                  onClick={() => handleLeaveAudio()}
                >
                  <ButtonEmoji
                    emoji="device_list_selector"
                    label={intl.formatMessage(intlMessages.changeAudioDevice)}
                  />
                </Button> */}
                <span>Invite</span>
              </Dropdown.DropdownTrigger>
              <Dropdown.DropdownContent className={styles.dropdownContent}>
                <Dropdown.DropdownList
                  className={cx(styles.scrollableList,styles.scrollableList200,  styles.dropdownListContainer)}
                >
                  <Dropdown.DropdownListItem
                    key="copyinvite"
                    label="Copy Invite Link"
                    // onClick={() => this.onDeviceListClick(device.deviceId, deviceKind,callback)}
                    // className={(device.deviceId === currentDeviceId)? styles.selectedDevice : ''}
                  />
                </Dropdown.DropdownList>
              </Dropdown.DropdownContent>
            </Dropdown>
            

            {!meetingIsBreakout ?
            <Dropdown>
              <Dropdown.DropdownTrigger>
                <span>Mute</span>
              </Dropdown.DropdownTrigger>
              <Dropdown.DropdownContent className={styles.dropdownContent}>
                <Dropdown.DropdownList
                  className={cx(styles.scrollableList, styles.scrollableList300, styles.dropdownListContainer)}
                >
                  <Dropdown.DropdownListItem
                    key="invite"
                    label= {intl.formatMessage(intlMessages[isMeetingMuted ? 'unmuteAllLabel' : 'muteAllLabel'])}
                    onClick={()=> toggleMuteAllUsers()}
                    icon={ isMeetingMuted ? 'unmute' : 'mute'}
                    // onClick={() => this.onDeviceListClick(device.deviceId, deviceKind,callback)}
                    // className={(device.deviceId === currentDeviceId)? styles.selectedDevice : ''}
                  />
                  <Dropdown.DropdownListItem
                    key="invite"
                    label= {intl.formatMessage(intlMessages.muteAllExceptPresenterLabel)}
                    onClick={()=> toggleMuteAllUsersExceptPresenter()}
                    icon={ 'mute'}
                    // onClick={() => this.onDeviceListClick(device.deviceId, deviceKind,callback)}
                    // className={(device.deviceId === currentDeviceId)? styles.selectedDevice : ''}
                  />
                </Dropdown.DropdownList>
              </Dropdown.DropdownContent>
            </Dropdown>
            : null }

              <BBBMenu 
                trigger={
                    <Button
                      label={intl.formatMessage(intlMessages.optionsLabel)}
                      data-test="manageUsers"
                      icon="settings"
                      ghost
                      color="primary"
                      hideLabel
                      className={styles.optionsButton}
                      size="sm"
                      onClick={() => null}
                    />
                }
                actions={this.renderMenuItems()}
              />

          </div>
        : null}
      </div>
    );
  }
}


{/* <Dropdown>
        <Dropdown.DropdownTrigger>
          <Button
            aria-label={intl.formatMessage(intlMessages.leaveAudio)}
            label={intl.formatMessage(intlMessages.leaveAudio)}
            accessKey={shortcuts.leaveaudio}
            hideLabel
            color="primary"
            icon={isListenOnly ? 'listen' : 'audio_on'}
            size="lg"
            circle
            onClick={() => handleLeaveAudio()}
          >
            <ButtonEmoji
              emoji="device_list_selector"
              label={intl.formatMessage(intlMessages.changeAudioDevice)}
            />
          </Button>
        </Dropdown.DropdownTrigger>
        <Dropdown.DropdownContent className={styles.dropdownContent}>
          <Dropdown.DropdownList
            className={cx(styles.scrollableList, styles.dropdownListContainer)}
          >
            {dropdownListComplete}
          </Dropdown.DropdownList>
        </Dropdown.DropdownContent>
      </Dropdown> */}

UserParticipants.propTypes = propTypes;
UserParticipants.defaultProps = defaultProps;

export default UserParticipants;
