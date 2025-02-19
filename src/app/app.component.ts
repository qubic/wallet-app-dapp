import { FormsModule } from '@angular/forms';

import { Component } from '@angular/core';

import { RouterOutlet } from '@angular/router';
import { SignClient } from '@walletconnect/sign-client';
import QRCode from 'qrcode';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})

export class AppComponent {
  NO_ADDRESS = '000000000000000000000000000000000000000000000000000000000000';

  title = 'wconnectclient';
  myConsole = '';

  connectionURL = '';
  connectionDeepLink = '';
  sessionTopic = '';

  method = 'qubic_requestAccounts';
  public chainId = 'qubic:main';

  public sendFrom: string | null = null;
  public sendAmount: number | null = null;
  public sendTo: string | null = null;
  public tick: number | null = null;
  public inputType: number | null = null;
  public payload: string | null = null;
  public sendAssetName: string | null = null;
  public sendAssetIssuer: string | null = null;
  public signFrom: string | null = null;
  public signMessageString: string | null = null;

  private signClient: any;
  private approval: any;
  private logConsole(string = '') {
    this.myConsole += string + '\n';
  }

  private clearConsole() {
    this.myConsole = '';
  }

  // Function to generate the QR code and update the img tag's src
  generateQRCode = async (text: string) => {
    try {
      // Generate QR code as a data URL (base64 image)
      const qrCodeDataURL = await QRCode.toDataURL(text);

      // Update the img tag src attribute with the generated QR code
      const imgElement = document.getElementById(
        'qrCodeImage'
      ) as HTMLImageElement;
      if (imgElement) {
        imgElement.src = qrCodeDataURL; // Set the src attribute to the base64 QR code data
      }

      console.log('QR code generated and applied to img tag.');
    } catch (err) {
      console.error('Failed to generate QR code', err);
    }
  };

  public copyToClipboard(content: string) {
    navigator.clipboard
      .writeText(content)
      .then(() => {
        console.log('Content copied to clipboard');
      })
      .catch((err) => {
        console.error('Failed to copy content: ', err);
      });
  }

  public copyUrl() {
    this.copyToClipboard(this.connectionURL);
  }

  public copyDeepLinkUrl() {
    this.copyToClipboard(this.connectionDeepLink);
  }

  public async genUrl() {
    const { uri, approval } = await this.signClient.connect({
      // Provide the namespaces
      requiredNamespaces: {
        qubic: {
          chains: [this.chainId],
          methods: [
            // Provide the methods that you wish to call
            'qubic_requestAccounts',
            'qubic_sendQubic',
            'qubic_sendAsset',
            'qubic_signTransaction',
            'qubic_sendTransaction',
            'qubic_sign',
          ],
          // Provide the session events that you wish to listen
          events: ['amountChanged', 'assetAmountChanged', 'accountsChanged'],
        },
      },
    });
    this.logConsole('Generated URL: ' + uri);
    this.connectionURL = uri;
    this.connectionDeepLink = "qubic-wallet://pairwc/" + this.connectionURL;
    this.generateQRCode(uri);

    this.logConsole('Awaiting for approval (click once)');
    try {
      const info = await approval();
      console.log(info);
      this.logConsole('Got approval');
      this.handleSessionConnected(info);
      this.logConsole(JSON.stringify(info));
    } catch (e) {
      this.logConsole('Approval was rejected:');
      this.logConsole(JSON.stringify(e));
    }
  }

  public async approve() {
    this.logConsole('Awaiting for approval (click once)');
    const session = await this.approval();

    this.logConsole('Got approval');
    this.logConsole(JSON.stringify(session));
    this.handleSessionConnected(session);
  }

  public handleSessionConnected(sessionInfo: any) {
    this.logConsole('Connected. Topic is ' + sessionInfo.topic);
    this.sessionTopic = sessionInfo.topic;
    localStorage.setItem('sessionTopic', this.sessionTopic);
    console.log('Session connected', sessionInfo);
  }

  private handleError(context: string, error: unknown): void {
    this.logConsole(`❌ Failed to ${context}`);

    if (error instanceof Error) {
      this.logConsole(error.message);
    } else {
      try {
        this.logConsole(JSON.stringify(error, null, 2));
      } catch {
        this.logConsole(String(error));
      }
    }
  }

  //Requests accounts from wallet
  public async requestAccounts() {
    if (!this.checkSessionStatus()) {
      this.logConsole('Cannot request accounts. No active session.');
      return;
    }
    try {
      const result = await this.signClient.request({
        topic: this.sessionTopic,
        chainId: this.chainId,
        request: {
          method: 'qubic_requestAccounts',
          params: {
            from: this.sendFrom,
            to: this.sendTo,
            amount: this.sendAmount,
            nonce: new Date().getTime() + '',
          },
        },
      });
      this.logConsole('qubic_requestAccounts response:');
      this.logConsole(JSON.stringify(result));
      console.log(result);
    } catch (e) {
      this.handleError('request accounts', e);
    }
  }

  //Requests accounts from wallet
  public async sendQubic() {
    try {
      const result = await this.signClient.request({
        topic: this.sessionTopic,
        chainId: this.chainId,
        request: {
          method: 'qubic_sendQubics',
          params: {
            from: this.sendFrom,
            to: this.sendTo,
            amount: this.sendAmount,
            nonce: new Date().getTime() + '',
          },
        },
      });
      this.logConsole('Result:');
      this.logConsole(JSON.stringify(result));
    } catch (e) {
      this.handleError('send qubic', e);
    }
  }

  public async sendAsset() {
    try {
      const result = await this.signClient.request({
        topic: this.sessionTopic,
        chainId: this.chainId,
        request: {
          method: 'qubic_sendAsset',
          params: {
            from: this.sendFrom,
            to: this.sendTo,
            assetName: this.sendAssetName,
            amount: this.sendAmount,
            issuer: this.sendAssetIssuer,
            nonce: new Date().getTime() + '',
          },
        },
      });
      this.logConsole('Result:');
      this.logConsole(JSON.stringify(result));
    } catch (e) {
      this.handleError('send asset', e);
    }
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
            from: this.sendFrom,
            to: this.sendTo,
            amount: this.sendAmount,
            tick: this.tick,
            inputType: this.inputType,
            payload: this.payload,
            nonce: new Date().getTime() + '',
          },
        },
      });
      this.logConsole('Result:');
      this.logConsole(JSON.stringify(result));
    } catch (e) {
      this.handleError('sign transaction', e);
    }
  }

  public async sendTransaction() {
    try {
      const result = await this.signClient.request({
        topic: this.sessionTopic,
        chainId: this.chainId,
        request: {
          method: 'qubic_sendTransaction',
          params: {
            from: this.sendFrom,
            to: this.sendTo,
            amount: this.sendAmount,
            tick: this.tick,
            inputType: this.inputType,
            payload: this.payload ? this.payload : null,
            nonce: new Date().getTime() + '',
          },
        },
      });
      this.logConsole('Result:');
      this.logConsole(JSON.stringify(result));
    } catch (e) {
      this.handleError('send transaction', e);
    }
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
            from: this.sendFrom,
            message: this.signMessageString,
          },
        },
      });
      this.logConsole('Result:');
      this.logConsole(JSON.stringify(result));
    } catch (e) {
      this.handleError('sign message', e);
    }
  }

  public checkSessionStatus(): boolean {
    if (!this.sessionTopic) {
      this.logConsole('No session topic is set.');
      return false;
    }

    const session = this.signClient.session.get(this.sessionTopic);
    if (session) {
      const expiryTimeMs = session.expiry * 1000;
      if (expiryTimeMs > Date.now()) {
        // Session is valid
        this.logConsole('Session is still connected and valid.');
        return true;
      } else {
        // Session has expired
        this.logConsole('Session has expired.');
        this.sessionTopic = '';
        localStorage.removeItem('sessionTopic');
        return false;
      }
    } else {
      // Session does not exist
      this.logConsole('Session is not connected.');
      // Clean up session data
      this.sessionTopic = '';
      localStorage.removeItem('sessionTopic');
      // Optionally, prompt the user to reconnect
      return false;
    }
  }

  public async clear() {
    this.clearConsole();
  }

  public async logout() {
    try {
      if (!this.sessionTopic) {
        this.logConsole('sessionTopic is empty');
        return;
      }

      this.logConsole('App will call disconnect');

      await this.signClient.disconnect({
        topic: this.sessionTopic,
        reason: { code: 6000, message: 'User logged out' },
      });

      // Optionally clear local storage or session data
      localStorage.removeItem('walletconnect');
      this.logConsole('Successfully logged out');
    } catch (error: any) {
      this.logConsole('Failed to log out:');
      this.logConsole(error);
    }
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
      this.logConsole('Initialized ' + this.signClient);

      const storedSessionTopic = localStorage.getItem('sessionTopic');
      const sessions = this.signClient.session.getAll();

      if (storedSessionTopic && sessions.length > 0) {
        // find the session with the stored topic
        const session = sessions.find((s) => s.topic === storedSessionTopic);
        if (session) {
          this.logConsole('Restored session from local storage');
          this.handleSessionConnected(session);
        } else {
          // if the session is not found, remove the invalid topic
          localStorage.removeItem('sessionTopic');
        }
      }

      this.signClient.on('session_proposal', async (payload) => {
        this.logConsole('\nSession proposal received');
        this.logConsole(JSON.stringify(payload));
        console.log('Proposal received', payload);
      });
      this.signClient.on('session_update', async (payload) => {
        this.logConsole('\nSession update received');
        this.logConsole(JSON.stringify(payload));
        console.log('Session update', payload);
      });
      this.signClient.on('session_extend', async (payload) => {
        this.logConsole('\nSession extend received');
        this.logConsole(JSON.stringify(payload));
        console.log('Session extend', payload);
      });
      this.signClient.on('session_ping', async (payload) => {
        this.logConsole('\nSession ping received');
        this.logConsole(JSON.stringify(payload));
        console.log('Session ping', payload);
      });
      this.signClient.on('session_delete', async (payload) => {
        this.logConsole('\nSession delete received');
        this.logConsole(JSON.stringify(payload));
        console.log('Session delete', payload);
        this.sessionTopic = '';
        localStorage.removeItem('sessionTopic');
      });
      this.signClient.on('session_expire', async (payload) => {
        this.logConsole('\nSession expire received');
        this.logConsole(JSON.stringify(payload));
        console.log('Session expire', payload);
        this.sessionTopic = '';
        localStorage.removeItem('sessionTopic');
      });
      this.signClient.on('session_request', async (payload) => {
        this.logConsole('\nSession request received');
        this.logConsole(JSON.stringify(payload));
        console.log('Session request', payload);
      });
      this.signClient.on('session_request_sent', async (payload) => {
        this.logConsole('\nSession request sent');
        this.logConsole(JSON.stringify(payload));
        console.log('Session request sent', payload);
      });
      this.signClient.on('session_event', async (payload) => {
        this.logConsole('\nSession event received');
        this.logConsole(JSON.stringify(payload));
        console.log('Session event', payload);
      });
      this.signClient.on('session_authenticate', async (payload) => {
        this.logConsole('\nSession authenticate received');
        this.logConsole(JSON.stringify(payload));
        console.log('Session authenticate', payload);
      });
      this.signClient.on('proposal_expire', async (payload) => {
        this.logConsole('\nProposal expire received');
        this.logConsole(JSON.stringify(payload));
        console.log('Proposal expire', payload);
      });
      this.signClient.on('session_request_expire', async (payload) => {
        this.logConsole('\nSession request expire received');
        this.logConsole(JSON.stringify(payload));
        console.log('Session request expire', payload);
      });
    });
  }
}
