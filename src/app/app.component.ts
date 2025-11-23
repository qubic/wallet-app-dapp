import { FormsModule } from '@angular/forms';

import { Component, ViewChild, ElementRef } from '@angular/core';

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
  @ViewChild('consoleTextarea') consoleTextarea?: ElementRef<HTMLTextAreaElement>;

  NO_ADDRESS = '000000000000000000000000000000000000000000000000000000000000';

  title = 'wconnectclient';
  myConsole = '';

  connectionURL = '';
  connectionDeepLink = '';
  sessionTopic = '';
  sessionExpiry: number | null = null;
  relayConnected = false;
  isGeneratingUri = false;
  isDisconnecting = false;

  method = 'qubic_requestAccounts';
  public chainId = 'qubic:mainnet';

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

  private getTimestamp(): string {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    return `[${hours}:${minutes}:${seconds}]`;
  }

  private logConsole(string = '') {
    const timestamp = this.getTimestamp();
    this.myConsole += `${timestamp} ${string}\n\n`;
    // Scroll to bottom after Angular updates the view
    setTimeout(() => {
      if (this.consoleTextarea?.nativeElement) {
        const textarea = this.consoleTextarea.nativeElement;
        textarea.scrollTop = textarea.scrollHeight;
      }
    }, 0);
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
        this.logConsole('QR code generated successfully');
      } else {
        this.logConsole('⚠️ QR code image element not found in DOM');
        console.error('QR code image element not found');
      }
    } catch (err) {
      this.logConsole('❌ Failed to generate QR code');
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
    this.isGeneratingUri = true;
    try {
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

      // Wait for Angular to render the DOM before generating QR code
      setTimeout(async () => {
        await this.generateQRCode(uri);
        // After QR code is generated, show waiting message
        this.logConsole('⏳ Waiting for wallet to approve connection...');
      }, 0);

      // URI generation is complete, hide loading state
      this.isGeneratingUri = false;
      try {
        const info = await approval();
        console.log(info);
        this.logConsole('✓ Connection approved');
        this.handleSessionConnected(info);
        this.logConsole(JSON.stringify(info));
      } catch (e) {
        this.logConsole('❌ Approval was rejected:');
        this.logConsole(JSON.stringify(e));
        // Clear QR code and connection URLs to allow generating a new URI
        this.clearQRCode();
      }
    } catch (error) {
      this.isGeneratingUri = false;
      this.logConsole('Failed to generate URI:');
      this.logConsole(JSON.stringify(error));
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
    this.sessionExpiry = sessionInfo.expiry;
    localStorage.setItem('sessionTopic', this.sessionTopic);
    console.log('Session connected', sessionInfo);
  }

  public getSessionExpiryTime(): string {
    if (!this.sessionExpiry) return 'N/A';
    const expiryDate = new Date(this.sessionExpiry * 1000);
    return expiryDate.toLocaleString();
  }

  public getSessionTimeRemaining(): string {
    if (!this.sessionExpiry) return 'N/A';
    const now = Date.now();
    const expiryMs = this.sessionExpiry * 1000;
    const remainingMs = expiryMs - now;

    if (remainingMs <= 0) return 'Expired';

    const hours = Math.floor(remainingMs / (1000 * 60 * 60));
    const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
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
    if (!this.sessionIsActive()) {
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

  public sessionIsActive(): boolean {
    if (!this.sessionTopic) {
      return false;
    }

    const session = this.signClient.session.get(this.sessionTopic);
    if (session) {
      const expiryTimeMs = session.expiry * 1000;
      if (expiryTimeMs > Date.now()) {
        // Session is valid
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

  private clearQRCode() {
    // Clear the QR code image
    const imgElement = document.getElementById('qrCodeImage') as HTMLImageElement;
    if (imgElement) {
      imgElement.src = '';
    }
    // Clear the connection URLs
    this.connectionURL = '';
    this.connectionDeepLink = '';
    this.sessionExpiry = null;
  }

  public async logout() {
    this.isDisconnecting = true;
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

      // Clear session data immediately
      this.sessionTopic = '';
      localStorage.removeItem('sessionTopic');
      localStorage.removeItem('walletconnect');
      this.clearQRCode();
      this.logConsole('Successfully logged out');
    } catch (error: any) {
      this.logConsole('Failed to log out:');
      this.logConsole(error);
    } finally {
      this.isDisconnecting = false;
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
        const session = sessions.find((s: { topic: string; }) => s.topic === storedSessionTopic);
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
        this.clearQRCode();
      });
      this.signClient.on('session_expire', async (payload) => {
        this.logConsole('\nSession expire received');
        this.logConsole(JSON.stringify(payload));
        console.log('Session expire', payload);
        this.sessionTopic = '';
        localStorage.removeItem('sessionTopic');
        this.clearQRCode();
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

      // Listen for relay connection events
      this.signClient.core.relayer.on('relayer_connect', () => {
        this.relayConnected = true;
        this.logConsole('\n✓ Relay connected');
        console.log('Relay connected');
      });

      this.signClient.core.relayer.on('relayer_disconnect', () => {
        this.relayConnected = false;
        this.logConsole('\n✗ Relay disconnected');
        console.log('Relay disconnected');
      });

      // Check initial relay connection state
      if (this.signClient.core.relayer.connected) {
        this.relayConnected = true;
        this.logConsole('Relay already connected');
      }
    });
  }
}
