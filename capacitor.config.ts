import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.apexfit.app',
  appName: 'ApexFit',
  webDir: 'out',
  server: {
    // Point to your live Vercel deployment URL.
    // Replace this with your actual Vercel URL.
    url: 'https://apexfit-web-a6fp.vercel.app',
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#000000',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#000000',
    },
  },
};

export default config;
