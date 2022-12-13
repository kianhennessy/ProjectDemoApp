import logo from './logo.svg';
import React, {useRef, useState} from 'react';
import './App.css';

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

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
  const [user] = useAuthState(auth);
  return (
      <div className="App">
        <header>
          <h1>Demo app</h1>
          <SignOut />
        </header>

        <section>
          {user ? <ChatRoom /> : <SignIn />}
        </section>

      </div>
  );
}



function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
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

function ChatRoom() {
  const dummy = useRef();
  const messageRef = firestore.collection('messages');
  const query = messageRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, {idField: 'id'});
  const [formValue, setFormValue] = useState('');

  const sendMessage = async(e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messageRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('');
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

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return ( <>
      <div className={`message ${messageClass}`}>
        <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} />
        <p>{text}</p>
      </div>
  </>)
}



export default App;