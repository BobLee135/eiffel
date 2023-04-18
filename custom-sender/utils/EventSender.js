import Axios from 'axios';

export class EventSender {

  EASY_EVENT_RABBIT_IP_ADDRESS = "";

  constructor(ip_address) {
    this.EASY_EVENT_RABBIT_IP_ADDRESS = ip_address;
  }

  /*
  *   Axios functions used to send post requests to the SimpleEventSender
  */
  async login() {
    let auth_token;

    await Axios.post(`${this.EASY_EVENT_RABBIT_IP_ADDRESS}/login`, {
      name: "Albin",
      password: "password123"
    }).then(response => {
      auth_token = response.headers["auth-token"];
      console.log("authenticated: " + auth_token);
    }).catch(error => {
      console.log("could not authenticate: " + error);
    });

    return auth_token;
  }

  async submitEvent(eiffelDataObj) {
    const auth_token = await this.login();

    const parameterObj = {
      sendToMessageBus: true,
      edition: "agen-1"
    };

    let config = {
      headers: { "auth-token": auth_token }
    };

    await Axios.post(
      `${this.EASY_EVENT_RABBIT_IP_ADDRESS}/submitevent`,
      { eiffelDataObj, parameterObj },
      config
    ).then(function(response) {
      console.log(response + "-message sent");
    }).catch(function(error) {
      if (error.response) {
        console.error('Error status:', error.response.status);
        console.error('Error details:', error.response.data);
      } else {
        console.error('Error:', error.message);
      }
    });
  }

}
