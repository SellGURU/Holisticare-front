/* eslint-disable @typescript-eslint/no-explicit-any */
import Api from './api';
interface AuthResponse {
  data: {
    access_token: string;
    permission: any;
  };
}
// const mockUser = {
//   username: "codie",
//   password: "codie#123",
//   accessToken: "mockAccessToken123"
// };
class Auth extends Api {
  static login(username: string, password: string): Promise<AuthResponse> {
    // return new Promise((resolve, reject) => {
    //   setTimeout(() => {
    //     if (username === mockUser.username && password === mockUser.password) {
    //       resolve({ data: { access_token: mockUser.accessToken } });
    //     } else {
    //       reject(new Error("Invalid credentials"));
    //     }
    //   }, 500);
    // });
    const data = {
      username: username,
      password: password,
    };

    return this.post('/auth/token', data, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }
  static signup(
    username?: string,
    email?: string,
    password?: string,
    google_json?: any,
  ) {
    const data = {
      user_name: username,
      user_mail: email,
      password: password,
      google_json: google_json,
      // clinic_membership_id: ""
    };

    return this.post('/auth/', data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  static logOut() {
    return this.post('/auth/log_out');
  }
}

export default Auth;
