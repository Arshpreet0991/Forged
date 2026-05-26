type ApiResponse<T = null> = {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
};
export default ApiResponse;
