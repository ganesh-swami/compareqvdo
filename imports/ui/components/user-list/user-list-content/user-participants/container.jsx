import React , { useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import UserListService from '/imports/ui/components/user-list/service';
import ActionsBarService from '/imports/ui/components/actions-bar/service';
import ActivityReportService from '/imports/ui/components/activity-report/service';
// import UserListService from '/imports/ui/components/user-list/service';
import WaitingUsersService from '/imports/ui/components/waiting-users/service';
import UserParticipants from './component';
import { meetingIsBreakout } from '/imports/ui/components/app/service';
import ChatService from '/imports/ui/components/chat/service';
import { UsersContext } from '/imports/ui/components/components-data/users-context/context';
import Auth from '/imports/ui/services/auth';
import Meetings from '/imports/api/meetings';
import { injectIntl } from 'react-intl';
import GuestUsers from '/imports/api/guest-users/';


const UserParticipantsContainer = (props) => {
  const usingUsersContext = useContext(UsersContext);
  const { users } = usingUsersContext;
  const currentUser = {
    userId: Auth.userID,
    presenter: users[Auth.meetingID][Auth.userID].presenter,
    locked: users[Auth.meetingID][Auth.userID].locked,
    role: users[Auth.meetingID][Auth.userID].role,
  };
  return (
    <UserParticipants {...{
      currentUser:currentUser,
      ...props,
    }} />
  )
};
const dynamicGuestPolicy = Meteor.settings.public.app.dynamicGuestPolicy;

const toggleStatus = () => {
  clearAllEmojiStatus(users);

  notify(
    intl.formatMessage(intlMessages.clearStatusMessage), 'info', 'clear_status',
  );
};

const isMeetingMuteOnStart = () => {
  const { voiceProp } = Meetings.findOne({ meetingId: Auth.meetingID },
    { fields: { 'voiceProp.muteOnStart': 1 } });
  const { muteOnStart } = voiceProp;
  return muteOnStart;
};

const getMeetingName = () => {
  const { meetingProp } = Meetings.findOne({ meetingId: Auth.meetingID },
    { fields: { 'meetingProp.name': 1 } });
  const { name } = meetingProp;
  return name;
};

export default injectIntl(withTracker(({intl,compact}) => {
  ChatService.removePackagedClassAttribute(
    ['ReactVirtualized__Grid', 'ReactVirtualized__Grid__innerScrollContainer'],
    'role',
  );

  return ({
    intl,

    toggleMuteAllUsers: () => {
      UserListService.muteAllUsers(Auth.userID);
      if (isMeetingMuteOnStart()) {
        return meetingMuteDisabledLog();
      }
      return logger.info({
        logCode: 'useroptions_mute_all',
        extraInfo: { logType: 'moderator_action' },
      }, 'moderator enabled meeting mute, all users muted');
    },
    toggleMuteAllUsersExceptPresenter: () => {
      UserListService.muteAllExceptPresenter(Auth.userID);
      if (isMeetingMuteOnStart()) {
        return meetingMuteDisabledLog();
      }
      return logger.info({
        logCode: 'useroptions_mute_all_except_presenter',
        extraInfo: { logType: 'moderator_action' },
      }, 'moderator enabled meeting mute, all users muted except presenter');
    },
    toggleStatus,
    isMeetingMuted: isMeetingMuteOnStart(),
    amIModerator: ActionsBarService.amIModerator(),
    getUsersNotAssigned: ActionsBarService.getUsersNotAssigned,
    hasBreakoutRoom: UserListService.hasBreakoutRoom(),
    isBreakoutEnabled: ActionsBarService.isBreakoutEnabled(),
    isBreakoutRecordable: ActionsBarService.isBreakoutRecordable(),
    //users: ActionsBarService.users(),
    guestPolicy: WaitingUsersService.getGuestPolicy(),
    isMeteorConnected: Meteor.status().connected,
    meetingName: getMeetingName(),
    activityReportAccessToken: ActivityReportService.getActivityReportAccessToken(),
    openActivityReportUrl: ActivityReportService.openActivityReportUrl,
    dynamicGuestPolicy,
    
    users: UserListService.getUsers(),
    meetingIsBreakout: meetingIsBreakout(),
    setEmojiStatus:UserListService.setEmojiStatus,
    clearAllEmojiStatus:UserListService.clearAllEmojiStatus,
    roving: UserListService.roving,
    requestUserInformation: UserListService.requestUserInformation,
    compact,
    pendingUsers: GuestUsers.find({
      meetingId: Auth.meetingID,
      approved: false,
      denied: false,
    }).fetch(),



  });
})(UserParticipantsContainer));
