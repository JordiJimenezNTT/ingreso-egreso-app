export class Usuario {

  static fromFirebase( { uid, nombre, email }:any ) {
    return new Usuario(uid, nombre, email);
  }

  constructor(
    public uid: string,
    public nombre: string,
    public email: string
  ){

  }

}
