import { FormsModule } from '@angular/forms';

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SignClient } from '@walletconnect/sign-client';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  NO_ADDRESS = '000000000000000000000000000000000000000000000000000000000000';

  title = 'wconnectclient';
  myConsole = '';

  connectionURL = '';
  sessionTopic = '';

  method = 'wallet_requestAccounts';
  chainId = 'qubic:main';

  public sendFrom = '';
  public sendAmount = '';
  public sendTo = '';
  public tick = 0;

  public signFrom = '';
  public signMessageString = '';

  private signClient: any;
  private approval: any;
  private logConsole(string = '') {
    this.myConsole += string + '\n';
  }

  public async genUrl() {
    const { uri, approval } = await this.signClient.connect({
      // Provide the namespaces
      requiredNamespaces: {
        'qubic:main': {
          methods: [
            'wallet_requestAccounts',
            'qubic_sendQubic',
            'qubic_sendAsset',
            'qubic_signTransaction',
            'qubic_sign',
          ],
          // Provide the session events that you wish to listen
          events: ['amountChanged', 'tokenAmountChanged', 'accountsChanged'],
        },
      },
    });
    this.logConsole('Generated URL: ' + uri);
    this.connectionURL = uri;

    this.logConsole('Awaiting for approval (click once)');
    try {
      const info = await approval();
      console.log(info);
      this.logConsole('Got approval');
      this.handleSessionConnected(info);
    } catch (e) {
      console.log(e);
      this.logConsole('Approval was rejected (get console)');
    }
  }

  public async approve() {
    this.logConsole('Awaiting for approval (click once)');
    const session = await this.approval();

    this.logConsole('Got approval');
    this.handleSessionConnected(session);
  }

  public handleSessionConnected(sessionInfo: any) {
    this.logConsole('Connected. Topic is ' + sessionInfo.topic);
    this.sessionTopic = sessionInfo.topic;
    console.log('Session connected', sessionInfo);
  }

  //Requests accounts from wallet
  public async reqAccounts() {
    const result = await this.signClient.request({
      topic: this.sessionTopic,
      chainId: this.chainId,
      request: {
        method: 'wallet_requestAccounts',
        params: [],
      },
    });
    this.logConsole('Requested accounts:');
    this.logConsole(JSON.stringify(result));
  }

  public async reqTick() {
    const result = await this.signClient.request({
      topic: this.sessionTopic,
      chainId: this.chainId,
      request: {
        method: 'wallet_requestTick',
        params: [],
      },
    });
  }

  //Requests accounts from wallet
  public async sendQubic() {
    try {
      const result = await this.signClient.request({
        topic: this.sessionTopic,
        chainId: this.chainId,
        request: {
          method: 'qubic_sendQubic',
          params: {
            fromID: this.sendFrom,
            toID: this.sendTo,
            amount: this.sendAmount,
            nonce: new Date().getTime() + '',
          },
        },
      });
      this.logConsole('Result:');
      this.logConsole(JSON.stringify(result));
    } catch (e) {
      this.logConsole('Error: ' + e);
    }
    //this.logConsole('SendQubic result:');
    //this.logConsole(JSON.stringify(result));
  }

  //Requests accounts from wallet
  public async signTransaction() {
    try {
      const result = await this.signClient.request({
        topic: this.sessionTopic,
        chainId: this.chainId,
        request: {
          method: 'qubic_signTransaction',
          params: {
            fromID: this.sendFrom,
            toID: this.sendTo,
            amount: this.sendAmount,
            nonce: new Date().getTime() + '',
          },
        },
      });
      this.logConsole('Result:');
      this.logConsole(JSON.stringify(result));
    } catch (e) {
      this.logConsole('Error: ' + e);
    }
    //this.logConsole('SendQubic result:');
    //this.logConsole(JSON.stringify(result));
  }

  //Requests accounts from wallet
  public async signMessage() {
    try {
      const result = await this.signClient.request({
        topic: this.sessionTopic,
        chainId: this.chainId,
        request: {
          method: 'qubic_sign',
          params: {
            fromID: this.signFrom,
            message: this.signMessageString,
          },
        },
      });
      this.logConsole('Result:');
      this.logConsole(JSON.stringify(result));
    } catch (e) {
      this.logConsole('Error: ' + e);
    }
    //this.logConsole('SendQubic result:');
    //this.logConsole(JSON.stringify(result));
  }

  constructor() {
    this.logConsole('Initializing Wallet Connect Client');

    SignClient.init({
      projectId: 'b2ace378845f0e4806ef23d2732f77a4',
      metadata: {
        name: 'TEST QUBIC DAPP',
        description: 'A short and sweet description for your project',
        url: 'https://yourdappurl.com',
        icons: ['https://walletconnect.com/walletconnect-logo.png'],
      },
    }).then((value) => {
      this.signClient = value;
      this.logConsole('Initialized');

      this.signClient.on('session_proposal', async (payload) => {
        this.logConsole('Session proposal received');
        console.log('Proposal received', payload);
      });
      this.signClient.on('session_update', async (payload) => {
        this.logConsole('Session update received');
        console.log('Session update', payload);
      });
      this.signClient.on('session_extend', async (payload) => {
        this.logConsole('Session extend received');
        console.log('Session extend', payload);
      });
      this.signClient.on('session_ping', async (payload) => {
        this.logConsole('Session ping received');
        console.log('Session ping', payload);
      });
      this.signClient.on('session_delete', async (payload) => {
        this.logConsole('Session delete received');
        console.log('Session delete', payload);
      });
      this.signClient.on('session_expire', async (payload) => {
        this.logConsole('Session expire received');
        console.log('Session expire', payload);
      });
      this.signClient.on('session_request', async (payload) => {
        this.logConsole('Session request received');
        console.log('Session request', payload);
      });
      this.signClient.on('session_request_sent', async (payload) => {
        this.logConsole('Session request sent');
        console.log('Session request sent', payload);
      });
      this.signClient.on('session_event', async (payload) => {
        this.logConsole('Session event received');
        try {
          let name = payload.params.event.name;
          let data = payload.params.event.data;
          this.logConsole(
            'Seesion event received: ' + name + ' data ' + JSON.stringify(data)
          );
        } catch (e) {
          this.logConsole('Session event received');
        }

        console.log('Session event', payload);
      });
      this.signClient.on('session_authenticate', async (payload) => {
        this.logConsole('Session authenticate received');
        console.log('Session authenticate', payload);
      });
      this.signClient.on('proposal_expire', async (payload) => {
        this.logConsole('Proposal expire received');
        console.log('Proposal expire', payload);
      });
      this.signClient.on('session_request_expire', async (payload) => {
        this.logConsole('Session request expire received');
        console.log('Session request expire', payload);
      });
    });
  }
}
