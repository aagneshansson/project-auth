import React, { useState } from 'react';
import { Heading, FormContainer, UserForm, FormLabel, FormInput, Button } from 'styling/styling';
import { user } from '../reducers/user';

import { useDispatch, useSelector } from 'react-redux';
const LOGIN_URL = 'http://localhost:8080/sessions';

export const LoginForm = () => {
    const dispatch = useDispatch();
    const accessToken = useSelector((store) => store.user.login.accessToken);
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    
    const handleLoginSuccess = (loginResponse) => {
        dispatch(
          user.actions.setAccessToken({ accessToken: loginResponse.accessToken })
        );
        dispatch(user.actions.setUserId({ userId: loginResponse.userId }));
        dispatch(user.actions.setStatusMessage({ statusMessage: 'Login Success' }));
      };
    
      const handleLoginFailed = (loginError) => {
        dispatch(user.actions.setAccessToken({ accessToken: null }));
        dispatch(user.actions.setStatusMessage({ statusMessage: loginError }));
      };

    // Login the user
    const handleLogin = (event) => {
        event.preventDefault();
    
        fetch(LOGIN_URL, {
          method: 'POST',
          body: JSON.stringify({ name, password }),
          headers: { 'Content-Type': 'application/json' },
        })
          .then((res) => {
            if (!res.ok) {
              throw 'Login Failed';
            }
            return res.json();
          })
          .then((json) => handleLoginSuccess(json))
          .catch((err) => handleLoginFailed(err));
      };

      if (accessToken) {
          return <></>;
      }
    return (
        <FormContainer>
            <UserForm>
                <Heading> LOG IN </Heading>
                
                <FormLabel>
                USERNAME
                <FormInput
                    type="text"
                    placeholder="Enter your username"
                    required
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                />
                </FormLabel>
                
                <FormLabel>
                PASSWORD
                <FormInput  
                    type="text"
                    placeholder="Enter your password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                />
                </FormLabel>
                <Button
                type="submit"
                onClick={handleLogin}>LOG IN</Button>
            </UserForm>
        </FormContainer>
    )
}
export default LoginForm;