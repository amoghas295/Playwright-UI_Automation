import { ENV } from '../config/env';

export class LoginPage {
  constructor(page) {
    this.page = page;
    this.googleBtn = page.getByRole('button', { name: /google/i });
  }

  async navigate() {
    await this.page.goto('/user/login', {
      waitUntil: 'domcontentloaded'
    });

    // Wait for Google button iframe (real signal page is usable)
    await this.page.frameLocator('iframe')
      .getByRole('button', { name: /google/i })
      .waitFor({ state: 'visible', timeout: 15000 });
  }

  async loginWithGoogle(context) {
    const googleBtn = this.page.frameLocator('iframe').getByRole('button', { name: /google/i });
    await googleBtn.waitFor({ state: 'visible' });

    const [popup] = await Promise.all([
      context.waitForEvent('page'),
      googleBtn.click()
    ]);

    await popup.waitForLoadState();

    // Email
    await popup.getByLabel(/email|phone/i).fill(ENV.EMAIL);
    await popup.getByRole('button', { name: /next/i }).click();

    // Password (FIXED)
    const passwordInput = popup.getByLabel(/enter your password/i);

    await passwordInput.waitFor({ state: 'visible' });
    await passwordInput.click();
    await passwordInput.fill(ENV.PASSWORD);
    
    await popup.getByRole('button', { name: /next/i }).click();

    await popup.waitForEvent('close');

    // Wait until NOT on login page anymore
    await this.page.waitForURL(/dashboard|timeline/);
  }
}