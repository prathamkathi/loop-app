// Replace with actual Vercel URL once deployed
export const VERCEL_URL = 'http://localhost:3000/api'; 

export function httpsCallable(functionName: string) {
  return async (data: any = {}) => {
    try {
      const response = await fetch(`${VERCEL_URL}/${functionName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data }), // wrap in data to match how Vercel extracts it
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
      
      const json = await response.json();
      return { data: json.data };
    } catch (error) {
      console.error(`Error calling ${functionName}:`, error);
      throw error;
    }
  };
}
