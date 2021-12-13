import axios from "axios";

export const glDomain = 'https://vdo.quadridge.com'

export const getGuests = async (meetingId) => {
    const response = await axios.get(`${glDomain}/api/guests?uid=${meetingId}`)
    return response.data
}

export const getContacts = async (uid, keyword) => {
    const response = await axios.get(`${glDomain}/api/contacts?uid=${uid}&keyword=${keyword}`)
    return response.data
}

export const inviteGuest = async (uid, contactId) => {
    const response = await axios.get(`${glDomain}/api/invite?uid=${uid}&contact_id=${contactId}`)
    return response.data
}

export const inviteGuests = async (uid, contactIds) => {
    const response = await axios.get(`${glDomain}/api/invite?uid=${uid}&contact_ids=${JSON.stringify(contactIds)}`)
    return response.data
}

export const addContact = async (uid, email) => {
    const response = await axios.get(`${glDomain}/api/add_contact?uid=${uid}&email=${email}`)
    return response.data
}

// export const toggleInvitePanel = (sidebarContentPanel, layoutContextDispatch) => {
//     layoutContextDispatch({
//       type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
//       value: sidebarContentPanel !== PANELS.INVITE,
//     });
//     layoutContextDispatch({
//       type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
//       value: sidebarContentPanel === PANELS.INVITE
//         ? PANELS.NONE
//         : PANELS.INVITE,
//     });
//   };