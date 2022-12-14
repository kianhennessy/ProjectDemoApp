import logo from './logo.svg';
import React, {useRef, useState} from 'react';
import './App.css';

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';


// Connect app to firebase, App SDK config
firebase.initializeApp({
  apiKey: "AIzaSyCxKo6uQS37dj5wXkJ-UVmTai64d7F7_9E",
  authDomain: "messageappdemo-cd24a.firebaseapp.com",
  projectId: "messageappdemo-cd24a",
  storageBucket: "messageappdemo-cd24a.appspot.com",
  messagingSenderId: "737910771326",
  appId: "1:737910771326:web:b91aaf09db923a0cad522f",
  measurementId: "G-DR81J2XCXD"
})

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  // Check if user is signed in
  const [user] = useAuthState(auth);
  return (
      <div className="App">
        <header>
          <h1>Demo app</h1>
          <SignOut />
        </header>

        <section>
          // If user is signed in, show chatroom, if not show sign in button
          {user ? <MessageArea /> : <SignIn />}
        </section>

      </div>
  );
}


function SignIn() {
  const signInWithGoogle = () => {

    // Use google sign in auth provider
    const provider = new firebase.auth.GoogleAuthProvider();

    // Sign in with popup
    auth.signInWithPopup(provider);
  }
  return(
      <>
        <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
      </>
  )
}

function SignOut() {
  return auth.currentUser && (
      <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function MessageArea() {
  const dummy = useRef();

  // Reference to message in firestore DB
  const messageRef = firestore.collection('messages');

  // Ordered by date created
  const query = messageRef.orderBy('createdAt').limit(25);

  // Listen to changes in firestore DB in real time (returns array of objects, each object is a chat message in DB)
  const [messages] = useCollectionData(query, {idField: 'id'});

  // Start message with empty string
  const [formValue, setFormValue] = useState('');

  const sendMessage = async(e) => {

    // Prevent page from refreshing after form is submitted
    e.preventDefault();

    // Grab user ID from currently signed in user
    const { uid, photoURL } = auth.currentUser;

    // Add document to firestore DB
    // Values written to DB are the form value, user ID, and date created
    await messageRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    // Reset form value to empty string
    setFormValue('');

    // Scroll to bottom of chat
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (
      <>
        <main>

          {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

          <span ref={dummy}></span>

        </main>


        <form onSubmit={sendMessage}>

          <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Message body" />

          <button type="submit" disabled={!formValue}>Send</button>

        </form>
      </>
  )
}

// Distinguish between messages sent by user and messages sent by other users
function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  // Compare user id on firestore document to the currently signed in user
  // If they match, show message on right side of screen
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return ( <>
      <div className={`message ${messageClass}`}>
        <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} />
        <p>{text}</p>
      </div>
  </>)
}

export default App;