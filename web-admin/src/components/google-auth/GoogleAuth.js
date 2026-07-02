import React, { Component } from "react";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { loginGoogle } from "../../redux/auth/action";
import axios, { AxiosResponse } from "axios";

export default class Dashboard extends Component {
	constructor(props) {
		super();
	}

    render() {
        return (
        <GoogleOAuthProvider clientId="517576869306-gil52bbfpopkorqhvk3845dmh758b1h4.apps.googleusercontent.com">
            <GoogleLogin
                onSuccess= {credentialResponse => {
                    console.log(credentialResponse);
                    axios.post("http://localhost:4549/auth/google-auth", credentialResponse);
                }}

                onError={() => {
                console.log("Login Failed");
                }}
            />
        </GoogleOAuthProvider>
        );
    }
}