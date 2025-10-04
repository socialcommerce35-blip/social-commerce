export const successResponse = (data: any, message = 'Success') => ({
    success: true,
    data: {
        data: data,
        message: message
    },
    error: null
  });
  
export const errorResponse = (error: any, message = 'Error') => ({
    success: false,
    data: {
        message: message
    },
    error
});
  