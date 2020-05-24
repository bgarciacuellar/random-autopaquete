import React, { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useHistory } from 'react-router-dom';
import { Input } from 'react-rainbow-components';
import { useFirebaseApp, useUser } from 'reactfire';
import { StyledLoginPage, StyledLoginSection } from './styled';
import 'firebase/auth';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [name, setName] = useState('');
    const [lastname, setLastName] = useState('');
    const firebase = useFirebaseApp();
    const user = useUser();
    const history = useHistory();

    useEffect(() => {
        if (user !== null) {
            history.push('/mi-cuenta');
        }
    }, [user]);

    // Crear usuario con correo y contraseña
    const register = e => {
        e.preventDefault();
        firebase
            .auth()
            .createUserWithEmailAndPassword(newEmail, newPassword)
            .then(({ user }) => {
                user.sendEmailVerification();
                history.push('/mi-cuenta');
            });
    };

    // Iniciar sesión
    const login = async e => {
        e.preventDefault();
        await firebase.auth().signInWithEmailAndPassword(email, password);
        history.push('/mi-cuenta');
    };

    // Cerrar sesión
    const logout = async e => {
        e.preventDefault();
        await firebase.auth().signOut();
    };

    return (
        <StyledLoginPage>
            <StyledLoginSection>
                <h1>Iniciar sesión</h1>
                {// Cuando el usuario no esta logeado
                !user && (
                    <Form>
                        <Form.Group controlId="formGroupEmail">
                            <Form.Label>Email o nombre de ususario</Form.Label>
                            <Form.Control
                                type="email"
                                controlid="email"
                                onChange={ev => setEmail(ev.target.value)}
                            />
                        </Form.Group>
                        <Form.Group controlId="formGroupPassword">
                            <Form.Label>Contraseña</Form.Label>
                            <Form.Control
                                type="password"
                                controlid="password"
                                onChange={ev => setPassword(ev.target.value)}
                            />
                        </Form.Group>
                        <Button className="boton" type="submit" onClick={login}>
                            Iniciar sesión
                        </Button>
                    </Form>
                )}

                {// Cuando el usuario esta logeado
                user && (
                    <Form>
                        <Button className="boton" type="submit" onClick={logout}>
                            Cerrar sesión
                        </Button>
                    </Form>
                )}
            </StyledLoginSection>
            <StyledLoginSection>
                <h1>Regístrate</h1>
                <div>
                    <form>
                        <div className="rainbow-align-content_center rainbow-flex_wrap">
                            <Input
                                id="name"
                                label="Nombre(s)"
                                name="name"
                                className="rainbow-p-around_medium"
                                onChange={ev => setName(ev.target.value)}
                            />
                            <Input
                                id="lastname"
                                label="Apellido(s)"
                                name="lastname"
                                className="rainbow-p-around_medium"
                                onChange={ev => setLastName(ev.target.value)}
                            />
                        </div>
                        <div className="rainbow-align-content_center rainbow-flex_wrap">
                            <Input
                                id="email"
                                label="Correo"
                                name="email"
                                type="email"
                                className="rainbow-p-around_medium"
                                style={{ width: '97%' }}
                                onChange={ev => setNewEmail(ev.target.value)}
                            />
                        </div>
                        <div className="rainbow-align-content_center rainbow-flex_wrap">
                            <Input
                                id="password"
                                label="Contraseña"
                                name="password"
                                type="password"
                                className="rainbow-p-around_medium"
                                style={{ width: '97%' }}
                                onChange={ev => setNewPassword(ev.target.value)}
                            />
                        </div>
                        <div className="rainbow-align-content_center rainbow-flex_wrap">
                            <p style={{ fontSize: '0.6rem' }}>
                                Al darle Unirse estás aceptando nuestro{' '}
                                <a href="/aviso-de-privacidad">Aviso de privacidad</a> y nuestros{' '}
                                <a href="/terminos-y-condiciones">Términos y condiciones.</a>
                            </p>
                            <Button
                                className="boton rainbow-m-around_medium"
                                type="submit"
                                onClick={register}
                            >
                                Unirse
                            </Button>
                        </div>
                    </form>
                </div>
            </StyledLoginSection>
        </StyledLoginPage>
    );
};

export default LoginPage;
