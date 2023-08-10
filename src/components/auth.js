import { auth, googleProvider } from "../config/firebase";
import {createUserWithEmailAndPassword, signInWithPopup, signOut} from "firebase/auth";
import {useState} from "react"

export const Auth = ()=>{
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("");

    console.log(auth?.currentUser?.email);
    // funcion para signIn
    const signIn = async()=>{
        try {
            await createUserWithEmailAndPassword(auth, email, password);      
        } catch (error) {
            console.log(error)
        }
    };
    const signInGoogle = async()=>{
        try {
            await signInWithPopup(auth, googleProvider)
        } catch (error) {
            console.log(error)
        }
    };
    const logOut = async()=>{
        try {
            await signOut(auth)
        } catch (error) {
            console.log(error)
        }
    }
    return(
        <div>
            <input placeholder="Email..." onChange={(e)=> setEmail(e.target.value)}></input>
            <input placeholder="password" onChange={(e)=> setPassword(e.target.value)} type="password"></input>
            <button onClick={signIn}>Sign In</button>
            <button onClick={signInGoogle}> Google </button>
            <button onClick={logOut}> LogOut</button>
        </div>
    )
}