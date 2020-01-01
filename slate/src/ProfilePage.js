import React from 'react';
import './PPc.css';
import "./SettingsStyles.css";
import img2 from "./RightTopimg.svg";
import history from "./history.js";
import {NavLink} from "react-router-dom";

class ProfilePage extends React.Component{

     constructor(props){
         super(props);
         this.state = {
             active: false,
             activemail: false,
             friendname: '',
             added: '-1',
             removed: '-1'
         };
         this.togglePopup = this.togglePopup.bind(this);
         this.togglePopupe = this.togglePopupe.bind(this);
         this.togglePopupf = this.togglePopupf.bind(this);
         this.togglePopupu = this.togglePopupu.bind(this);
         this.handleChange=this.handleChange.bind(this);
         this.handleSubmit = this.handleSubmit.bind(this);
         this.handleUnfriend = this.handleUnfriend.bind(this);
         this.getAdded = this.getAdded.bind(this);
         this.getRemoved = this.getRemoved.bind(this);
     }

     getAdded(){
        return this.state.added;
     }

     getRemoved(){
         return this.state.removed;
     }

     handleChange(event){
         this.setState({[event.target.id]: event.target.value});
     }

     togglePopup() {
         this.setState({
             active: !this.state.active
         });
     }

     togglePopupe() {
         this.setState({
             activemail: !this.state.activemail
         });
     }

     togglePopupf() {
         this.setState({
             added: '-1'
         })
     }

     togglePopupu() {
         this.setState({
             removed: '-1'
         })
     }

     logout() {
         fetch('/logout', {
             method: 'POST'
         }).then(response => {
             if (response.ok) {
                 localStorage.setItem('auth', 'false');
                 history.push('/');
             } else {
                 history.push('/pp');
             }
         })
     }

     handleSubmit(event) {
         fetch('/find', {
             method: 'POST',
             headers: {
               'Accept': 'application/json',
               'Content-Type': 'application/json'
             },
             body: JSON.stringify({
                 fn: this.state.friendname
             })
         }).then(response => {
             return response.json();
         }).then(data=>{
             if (data===''){
                 this.setState({
                     added: "No users found"
                 })
                 //this.state.added = "No users found";
             }
             else if (data==='added'){
                 this.setState({
                     added: "Friend already added"
                 })
                 //this.state.added = "Friend already added";
             }
             else {
                 this.setState({
                     added: "Added " + data
                 })
                 //this.state.added = "Added " + data;
             }
         })
         event.preventDefault();
     }

     handleUnfriend(event) {
         fetch('/unfriend', {
             method: 'POST',
             headers: {
               'Accept': 'application/json',
               'Content-Type': 'application/json'
             },
             body: JSON.stringify({
                 fn: this.state.friendname
             })
         }).then(response => {
             return response.json();
         }).then(data=>{
             if (data===''){
                 this.setState({
                     removed: "You are not friends"
                 })
                 //this.state.added = "No users found";
             }
             else {
                 this.setState({
                     removed: "Unfriended " + data
                 })
                 //this.state.added = "Added " + data;
             }
         })
         event.preventDefault();
     }

     render(){
         return(
             <div>
                 <div className = "container">
                     <div className = "container2">
                         <img className="img2p" src={img2} width="400" height="400"/>
                         <NavLink to = "/pp"><h1 className="titlepp">Slate</h1></NavLink>
                         <div className = "main2">
                             <div class = "profile">
                                 <h1>Profile</h1>
                                 <div className="settingsBox">
                                     <button className="settingButton" onClick = {this.togglePopup}>Change Password</button>
                                     <button className="settingButton" onClick = {this.togglePopupe}>Change Email</button>
                                     <NavLink to = "/schedule"><button className = "settingButton2">Change Schedule</button></NavLink>
                                     <button className="settingButton" onClick={this.logout}>Log Out</button>
                                 </div>
                                 <form className = "ppform" onSubmit = {this.handleSubmit}>
                                     <div className = "search">
                                         <h6 className = "searchfrt">Search for Friends</h6>
                                         <input className ="searchBar" id="friendname" type = "text" value={this.state.friendname} onChange={this.handleChange} placeholder = "Search..."/>
                                     </div>
                                     <div className = "friendbuttons">
                                         <div>
                                             <input type = "submit"  className = "settingButton3" value = "Search"/>
                                         </div>
                                         <div>
                                             <button className = "settingButton4" onClick={this.handleUnfriend}>Unfriend</button>
                                         </div>
                                     </div>
                                 </form>
                             </div>
                             <div class = "feed">
                                 <h1>Feed</h1>
                             </div>
                         </div>
                     </div>
                 </div>
                 {this.state.active ? <Popup toggle = {this.togglePopup}></Popup>: null}
                 {this.state.activemail ? <PopupEmail toggle = {this.togglePopupe}></PopupEmail>: null}
                 {this.state.added!=="-1" ?  <PopupFriend string = {this.getAdded} toggle = {this.togglePopupf}></PopupFriend>: null}
                 {this.state.removed!=="-1" ? <PopupUnfriend string = {this.getRemoved} toggle = {this.togglePopupu}></PopupUnfriend>: null}
             </div>
         );
     }

}

class Popup extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            password: '',
            retype: '',
            wrong: false
        }
        this.handleClick = this.handleClick.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleClick() {
        this.props.toggle();
    }

    handleChange(event){
        this.setState({[event.target.id]: event.target.value});
    }

    handleSubmit(event){
        if (this.state.retype===this.state.password) {
            fetch('/password', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    password: this.state.password
                })
            }).then(response => {
                if (response.ok) {
                    this.props.toggle();
                }
            })
        }
        else {
            this.setState({
                wrong: true
            });
        }
        event.preventDefault();
    }

    render() {
        return (
            <div className = "modal">
                <div className = "content">
                    <span className = "close" onClick = {this.handleClick}>&times;</span>
                    <p className = "bigtext">Change Password</p>
                    <form onSubmit = {this.handleSubmit}>
                        <div className = "search2">
                            <h6 className = "searchfrt">New Password</h6>
                            <input id = "password" className = "searchBar2" type = "password" value={this.state.password} onChange={this.handleChange} required/>
                        </div>
                        <div className = "search2">
                            <h6 className = "searchfrt">Retype Password</h6>
                            <input id = "retype" className = "searchBar2" type = "password" value={this.state.retype} onChange = {this.handleChange} required/>
                        </div>
                        <input type = "submit" className = "textpop" value = "Update"/>
                    </form>
                    {this.state.wrong ? <h1 className = "match">Your passwords do not match</h1> : null}
                </div>
            </div>
        );
    }
}

class PopupEmail extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            email: '',
            retype: '',
            wrong: false
        }
        this.handleClick = this.handleClick.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleClick() {
        this.props.toggle();
    }

    handleChange(event){
        this.setState({[event.target.id]: event.target.value});
    }

    handleSubmit(event){
        if (this.state.retype===this.state.email) {
            fetch('/email', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: this.state.email
                })
            }).then(response => {
                if (response.ok) {
                    this.props.toggle();
                }
            })
        }
        else {
            this.setState({
                wrong: true
            });
        }
        event.preventDefault();
    }

    render() {
        return (
            <div className = "modal">
                <div className = "content">
                    <span className = "close" onClick = {this.handleClick}>&times;</span>
                    <p className = "bigtext">Change Email</p>
                    <form onSubmit = {this.handleSubmit}>
                        <div className = "search2">
                            <h6 className = "searchfrt">New Email</h6>
                            <input id = "email" className = "searchBar2" type = "email" value={this.state.email} onChange={this.handleChange} required/>
                        </div>
                        <div className = "search2">
                            <h6 className = "searchfrt">Retype Email</h6>
                            <input id = "retype" className = "searchBar2" type = "email" value={this.state.retype} onChange = {this.handleChange} required/>
                        </div>
                        <input type = "submit" className = "textpop" value = "Update"/>
                    </form>
                    {this.state.wrong ? <h1 className = "match">Your emails do not match</h1> : null}
                </div>
            </div>
        );
    }
}

class PopupFriend extends React.Component {

    constructor(props){
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        this.props.toggle();
    }

    render() {
        return (
            <div className = "modal">
                <div className = "content2">
                    <span className = "close" onClick = {this.handleClick}>&times;</span>
                    <p className = "bigtext">Add Friend</p>
                    <p className = "smalltext">{this.props.string()}</p>
                </div>
            </div>
        );
    }
}

class PopupUnfriend extends React.Component {

    constructor(props){
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        this.props.toggle();
    }

    render() {
        return (
            <div className = "modal">
                <div className = "content2">
                    <span className = "close" onClick = {this.handleClick}>&times;</span>
                    <p className = "bigtext">Remove Friend</p>
                    <p className = "smalltext">{this.props.string()}</p>
                </div>
            </div>
        );
    }
}

export default ProfilePage;
