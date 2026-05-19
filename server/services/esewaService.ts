import crypto from 'crypto';

interface EsewaConfig {
  merchantCode: string;
  secretKey: string;
}

export const generateEsewaQRData = (config: EsewaConfig, invoiceId: string, amount: number) => {
  // Mocking eSewa dynamic QR payload format
  // In real implementation, you'd follow eSewa's specific SDK for transaction QR
  const payload = {
    amount: amount.toFixed(2),
    tax_amount: '0',
    service_charge: '0',
    delivery_charge: '0',
    total_amount: amount.toFixed(2),
    transaction_uuid: invoiceId,
    product_code: config.merchantCode,
    success_url: '#',
    failure_url: '#',
    signed_field_names: 'total_amount,transaction_uuid,product_code',
  };

  const signatureString = `total_amount=${payload.total_amount},transaction_uuid=${payload.transaction_uuid},product_code=${payload.product_code}`;
  const hmac = crypto.createHmac('sha256', config.secretKey);
  hmac.update(signatureString);
  const signature = hmac.digest('base64');

  return {
    ...payload,
    signature
  };
};
