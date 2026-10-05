import QRCode from 'qrcode';

export async function generateQrDataUrl(text: string, width = 300): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(text, {
      width,
      margin: 1,
      color: {
        dark: '#14532d', // deep forest green
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    });
    return dataUrl;
  } catch (err) {
    console.error('Error generating QR code:', err);
    return '';
  }
}
