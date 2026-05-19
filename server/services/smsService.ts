export const sendBillingSMS = async (phoneNumber: string, message: string) => {
  console.log(`[SMS MOCK] To: ${phoneNumber}, Message: ${message}`);
  // In production, integrate with a real gateway like Sparrow SMS or Aakash SMS
  return true;
};
