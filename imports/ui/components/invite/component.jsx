import React, { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import {addContact, getContacts, getGuests, inviteGuests} from "./service";
import injectWbResizeEvent from '/imports/ui/components/presentation/resize-wrapper/component';
import Button from '/imports/ui/components/button/component';
// import {connect} from "react-redux";
// import {setPanelOpened} from "/imports/redux/actions";
import {styles} from './styles'

const intlMessages = defineMessages({
    hideNoteLabel: {
      id: 'app.note.hideNoteLabel',
      description: 'Label for hiding note button',
    },
    title: {
      id: 'app.note.title',
      description: 'Title for the shared notes',
    },
    tipLabel: {
      id: 'app.note.tipLabel',
      description: 'Label for tip on how to escape iframe',
    },
  });

class Invite extends Component {
    // state = {
    //     keyword: '',
    //     contacts: [],
    //     invited: false
    // }

    constructor(props) {
        super(props);

        this.state = {
            keyword: '',
            contacts: [],
            invited: false
          };
    
        // this.noteURL = NoteService.getNoteURL();
        // this.readOnlyURL = NoteService.getReadOnlyURL();
    }

    async componentDidMount() {
        await this.getContacts()
    }

    getContacts = async () => {
        const contacts = await getContacts(this.props.currentUser.extId, this.state.keyword)
        const guests = await getGuests(this.props.meetingProp.extId)
        guests.forEach(guest => {
            let index = contacts.findIndex(c => c.id === guest.id)
            if (index > -1) {
                contacts[index]['invited'] = true
            }
        })
        this.setState({
            contacts,
        })
    }

    async componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevState.keyword !== this.state.keyword) {
            await this.getContacts()
        }
    }

    handleClose = () => {
        Session.set('openPanel', 'userlist');
        // this.props.setPanelOpened(false)
    }

    toggleInvite = async (contact) => {
        contact.invited = !contact.invited;
        let index = this.state.contacts.findIndex(c => c.id === contact.id)
        let contacts = [...this.state.contacts]
        contacts[index] = contact
        this.setState({contacts, invited: false})
    }

    handleKeyDown = async (event) => {
        const email = this.state.keyword
        if (event.keyCode === 13) {
            if (email) {
                const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                if (re.test(String(email).toLowerCase())) {
                    try {
                        await addContact(this.props.currentUser.extId, email)
                        await this.getContacts()
                    } catch (e) {
                        console.error(e)
                    }

                }
            }
        }
    }

    handleSendInvite = async () => {
        let contacts = this.state.contacts.filter(c => c.invited === true);
        let contactIds = contacts.map(c => c.id)
        try {
            const data = await inviteGuests(this.props.meetingProp.extId, contactIds)
            const {invited} = data
            this.setState({invited})
        } catch (e) {
            console.error(e)
        }
    }

    render() {
        const {
            intl,
            isRTL,
            layoutContextDispatch,
          } = this.props;
        return (

            <div
            data-test="note"
            className={styles.note}
            >
                <header className={styles.header}>
                <div
                    data-test="noteTitle"
                    className={styles.title}
                >
                    <Button
                    onClick={() => {
                        layoutContextDispatch({
                        type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
                        value: false,
                        });
                        layoutContextDispatch({
                        type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
                        value: PANELS.NONE,
                        });
                    }}
                    data-test="hideNoteLabel"
                    aria-label={'Hide'}
                    label={'Hide'}
                    icon={isRTL ? 'right_arrow' : 'left_arrow'}
                    className={styles.hideBtn}
                    />
                </div>
                </header>
                <div style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
                    <div className="p-4">
                        <div className="is-flex is-align-items-center is-justify-content-space-between mb-4">
                            <h3 style={{fontSize: '24px'}}>Invite people</h3>
                            <div>
                                <span onClick={this.handleClose}><i className="fa fa-times"/></span>
                            </div>
                        </div>
                        <div className="field">
                            <div className="control has-icons-left">
                                <input
                                    className="input" type="text"
                                    value={this.state.keyword}
                                    onChange={(event) => this.setState({keyword: event.target.value})}
                                    onKeyDown={this.handleKeyDown}
                                />
                                <span className="icon is-small is-left"><i className="fa fa-search"/></span>
                                {
                                    this.state.keyword && (
                                        <span className="icon is-right is-small" onClick={() => this.setState({keyword: ''})}><i
                                            className="fa fa-times"/></span>
                                    )
                                }
                            </div>
                        </div>
                    </div>
                    <div style={{flex: 1, overflowY: 'auto'}}>
                        <div className="contact-list p-4">
                            {this.state.contacts.map(contact => (
                                <div className={styles.contactItem} key={contact.id}>
                                    <div className="media">
                                        <div className="media-left">
                                            <figure className="image is-48x48">
                                                {contact.image ? (<img style={{borderRadius: '100%'}} src={contact.image}/>) : (<img
                                                    src="https://res.cloudinary.com/mhmd/image/upload/v1564960395/avatar_usae7z.svg"/>)}
                                                {/*<img src="https://res.cloudinary.com/mhmd/image/upload/v1564960395/avatar_usae7z.svg"/>*/}
                                            </figure>
                                        </div>
                                        <div className="media-content">
                                            <div className="content">
                                                <h5>{contact.first_name} {contact.last_name}</h5>
                                                <div className="columns">
                                                    <div className="column is-three-quarters">
                                                        {contact.email}
                                                    </div>
                                                    <div className="column">
                                                        <label className="checkbox">
                                                            <input type="checkbox" checked={contact.invited} onChange={() => this.toggleInvite(contact)}/>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="p-4 has-text-right">
                        <button className="button is-info" onClick={this.handleSendInvite}>Send Invite</button>
                        {this.state.invited && (<p>Invite sent</p>)}
                    </div>
                </div>
                {/* <span id="sharedNotesEscapeHint" className={styles.hint} aria-hidden>
                {'Hide Invite List'}
                </span> */}
            </div>
        )
    }
}

// export default connect(null, {
//     setPanelOpened,
// })(Invite)

// Invite.propTypes = propTypes;

export default injectWbResizeEvent(injectIntl(Invite));