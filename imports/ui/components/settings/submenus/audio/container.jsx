import React, { PureComponent } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import SettingInputStreamLiveSelector from './component';
import Service from '/imports/ui/components/audio/service.js';
import {
    setUserSelectedMicrophone,
    setUserSelectedListenOnly,
  } from '/imports/ui/components/audio/audio-modal/service';
import AppService from '/imports/ui/components/app/service';

class InputStreamLiveSelectorSettingContainer extends PureComponent {
  render() {
    return (
      <SettingInputStreamLiveSelector {...this.props} />
    );
  }
}

const handleLeaveAudio = () => {
    const meetingIsBreakout = AppService.meetingIsBreakout();
  
    if (!meetingIsBreakout) {
      setUserSelectedMicrophone(false);
      setUserSelectedListenOnly(false);
    }
  
    const skipOnFistJoin = getFromUserSettings('bbb_skip_check_audio_on_first_join', APP_CONFIG.skipCheckOnJoin);
    if (skipOnFistJoin && !Storage.getItem('getEchoTest')) {
      Storage.setItem('getEchoTest', true);
    }
  
    Service.exitAudio();
    logger.info({
      logCode: 'audiocontrols_leave_audio',
      extraInfo: { logType: 'user_action' },
    }, 'audio connection closed by user');
  };

export default withTracker(({  }) => ({
  isAudioConnected: Service.isConnected(),
  isListenOnly: Service.isListenOnly(),
  currentInputDeviceId: Service.inputDeviceId(),
  currentOutputDeviceId: Service.outputDeviceId(),
  liveChangeInputDevice: Service.liveChangeInputDevice,
  liveChangeOutputDevice: Service.changeOutputDevice,
  handleLeaveAudio,
}))(InputStreamLiveSelectorSettingContainer);
