import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { map } from 'rxjs/operators';
import { Usuario } from '../models/usuario.model';
import { AngularFirestore } from '@angular/fire/firestore';
import { Store } from '@ngrx/store';
import { AppState } from '../app.reducer';
import * as authActions from '../auth/auth.actions';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  userSubscription!: Subscription;

  constructor(
    public auth: AngularFireAuth,
    private firestore: AngularFirestore,
    private store: Store<AppState>
  ) { }

  initAuthListener() {
    this.auth.authState.subscribe( firebaseUser => {
      if(firebaseUser) {
        this.userSubscription = this.firestore.doc(`${firebaseUser.uid}/usuario`).valueChanges()
          .subscribe( (firestoreUser:any) => {
            const user:Usuario = Usuario.fromFirebase(firestoreUser);
            this.store.dispatch( authActions.setUser({ user }) );
          });
      } else {
        this.userSubscription?.unsubscribe();
        this.store.dispatch(authActions.unSetUser());
      }
    });
  }

  crearUsuario(nombre: string, email: string, password: string) {
    console.log(nombre, email, password);
    return this.auth.createUserWithEmailAndPassword(email, password)
      .then( ({user}) => {
        const newUser = new Usuario(user!.uid, nombre, email);
        return this.firestore.doc(`${ user!.uid }/usuario`).set({...newUser});
      });
  }

  loginUsuario(email: string, password: string) {
    return this.auth.signInWithEmailAndPassword(email, password);
  }

  logout() {
    return this.auth.signOut();
  }

  isAuth() {
    return this.auth.authState.pipe(
      map( firebaseUser => firebaseUser != null )
    );
  }

}
