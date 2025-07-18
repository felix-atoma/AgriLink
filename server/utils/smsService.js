import dotenv from 'dotenv';
import twilio from 'twilio';
import { Vonage } from '@vonage/server-sdk';
import axios from 'axios';

dotenv.config();

class SMSService {
  constructor() {
    this.providers = {
      twilio: {
        client: twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN),
        enabled: process.env.SMS_PROVIDER === 'twilio',
        priority: 1,
        name: 'Twilio'
      },
      vonage: {
        client: new Vonage({
          apiKey: process.env.VONAGE_API_KEY,
          apiSecret: process.env.VONAGE_API_SECRET,
        }),
        enabled: process.env.SMS_PROVIDER === 'vonage',
        priority: 2,
        name: 'Vonage'
      },
      termii: {
        enabled: process.env.SMS_PROVIDER === 'termii',
        apiKey: process.env.TERMII_API_KEY,
        priority: 3,
        name: 'Termii'
      }
    };

    this.activeProviders = this.getActiveProviders();
    this.verifyProviders();
  }

  getActiveProviders() {
    return Object.entries(this.providers)
      .filter(([_, provider]) => provider.enabled)
      .sort((a, b) => a[1].priority - b[1].priority)
      .map(([name, _]) => name);
  }

  async verifyProviders() {
    for (const providerName of this.activeProviders) {
      try {
        switch (providerName) {
          case 'twilio':
            await this.providers.twilio.client.messages.list({ limit: 1 });
            console.log('Twilio SMS provider verified');
            break;
          case 'vonage':
            const balance = await this.providers.vonage.client.account.getBalance();
            console.log(`Vonage SMS provider verified. Balance: ${balance.value}`);
            break;
          case 'termii':
            const response = await axios.get(
              `https://api.ng.termii.com/api/get-balance?api_key=${this.providers.termii.apiKey}`
            );
            console.log(`Termii SMS provider verified. Balance: ${response.data.balance}`);
            break;
        }
      } catch (error) {
        console.error(`${providerName} verification failed:`, error.message);
        this.providers[providerName].enabled = false;
        this.activeProviders = this.getActiveProviders();
      }
    }
  }

  formatPhoneNumber(number) {
    // Remove all non-digit characters except +
    const cleaned = number.replace(/[^\d+]/g, '');
    
    // Add country code if missing (assuming default is NG +234)
    if (!cleaned.startsWith('+') && !cleaned.startsWith('234')) {
      return `+234${cleaned.replace(/^0/, '')}`;
    }
    
    return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
  }

  async sendSMS({ to, message }) {
    const formattedNumber = this.formatPhoneNumber(to);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV SMS] To: ${formattedNumber}\nMessage: ${message}`);
      return { status: 'dev_mode', provider: 'none', message: 'SMS logged in development mode' };
    }

    for (const providerName of this.activeProviders) {
      try {
        let result;
        switch (providerName) {
          case 'twilio':
            result = await this.sendViaTwilio(formattedNumber, message);
            break;
          case 'vonage':
            result = await this.sendViaVonage(formattedNumber, message);
            break;
          case 'termii':
            result = await this.sendViaTermii(formattedNumber, message);
            break;
        }
        
        if (result) {
          console.log(`SMS sent via ${providerName} to ${formattedNumber}`);
          return result;
        }
      } catch (error) {
        console.error(`${providerName} failed to send SMS:`, error.message);
        continue;
      }
    }

    throw new Error('All SMS providers failed to send message');
  }

  async sendViaTwilio(to, message) {
    const response = await this.providers.twilio.client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
    
    return { 
      success: true,
      status: 'sent', 
      provider: 'twilio', 
      id: response.sid,
      timestamp: new Date().toISOString()
    };
  }

  async sendViaVonage(to, message) {
    const response = await this.providers.vonage.client.sms.send({
      from: process.env.VONAGE_PHONE_NUMBER,
      to,
      text: message,
    });
    
    if (response.messages[0].status !== '0') {
      throw new Error(response.messages[0]['error-text']);
    }
    
    return { 
      success: true,
      status: 'sent', 
      provider: 'vonage', 
      id: response.messages[0]['message-id'],
      timestamp: new Date().toISOString()
    };
  }

  async sendViaTermii(to, message) {
    const response = await axios.post(
      'https://api.ng.termii.com/api/sms/send',
      {
        to,
        from: process.env.TERMII_SENDER_ID,
        sms: message,
        type: 'plain',
        channel: 'generic',
        api_key: this.providers.termii.apiKey,
      }
    );
    
    return { 
      success: true,
      status: 'sent', 
      provider: 'termii', 
      id: response.data.message_id,
      timestamp: new Date().toISOString()
    };
  }

  async sendBulkSMS(messages) {
    const results = [];
    for (const msg of messages) {
      try {
        const result = await this.sendSMS(msg);
        results.push({ success: true, ...result });
      } catch (error) {
        results.push({ 
          success: false, 
          error: error.message,
          phoneNumber: msg.to,
          timestamp: new Date().toISOString()
        });
      }
    }
    return results;
  }
}

export default new SMSService();