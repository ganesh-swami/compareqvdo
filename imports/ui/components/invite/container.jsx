// import React from 'react'
// import Invite from './component';
// import { withTracker } from 'meteor/react-meteor-data';
// import { injectIntl } from 'react-intl';
// import Users from '/imports/api/users';
// import Auth from '/imports/ui/services/auth';
// import Meetings from "/imports/api/meetings";

// const InviteContainer = props => <Invite {...props} />;

// export default withTracker(() => {
//   const currentUser = Users.findOne({ userId: Auth.userID }, { fields: {} });
//   const currentMeeting = Meetings.findOne({ meetingId: Auth.meetingID },
//       { fields: {meetingProp: 1} });
//   const {meetingProp} = currentMeeting
//   return {
//     currentUser,
//     currentMeeting,
//     meetingProp
//   }
// })(injectIntl(InviteContainer))


// const layoutContext = useContext(LayoutContext);
//   const { layoutContextDispatch, layoutContextState } = layoutContext;



  import React, { useContext } from 'react';
  import { withTracker } from 'meteor/react-meteor-data';
  import Invite from './component';
  //import NoteService from './service';
  import LayoutContext from '../layout/context';
  import Users from '/imports/api/users';
  import Auth from '/imports/ui/services/auth';
  import Meetings from "/imports/api/meetings";
  
  const InviteContainer = ({ children, ...props }) => {
    const layoutContext = useContext(LayoutContext);
    const { layoutContextDispatch, layoutContextState } = layoutContext;
    const { input } = layoutContextState;
    const { cameraDock } = input;
    const { isResizing } = cameraDock;
    return (
      <Invite {...{ layoutContextDispatch, isResizing, ...props }}>
        {children}
      </Invite>
    );
  };
  
  export default withTracker(() => {
    //const isLocked = NoteService.isLocked();
    const isRTL = document.documentElement.getAttribute('dir') === 'rtl';
    const currentUser = Users.findOne({ userId: Auth.userID }, { fields: {} });
    const currentMeeting = Meetings.findOne({ meetingId: Auth.meetingID },
        { fields: {meetingProp: 1} });
    const {meetingProp} = currentMeeting
    return {
      //isLocked,
      currentUser,
    currentMeeting,
    meetingProp,
      isRTL,
    };
  })(InviteContainer);
  