// Standard success response
export const successResponse = (data: any, message = 'Success') => ({
    success: true,
    message,
    data,
  });
  
  // Standard error response
  export const errorResponse = (message = 'Something went wrong', data = null) => ({
    success: false,
    message,
    data,
  });
  