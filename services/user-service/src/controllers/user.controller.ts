import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { getUserProfile, updateOrCreateUserProfile } from '../services/user.service';
import { successResponse, errorResponse } from '../utils/responseHandler';

export const getUserProfileController = async (req: AuthRequest, res: Response) => {
  try {
    const user = await getUserProfile(req.user!.user_id);
    if (!user) return res.status(404).json(errorResponse('User not found', 'Not Found'));
    res.json(successResponse(user, 'User profile fetched successfully'));
  } catch (err) {
    res.status(500).json(errorResponse(err));
  }
};

export const updateUserProfileController = async (req: AuthRequest, res: Response) => {
  try {
    const user = await updateOrCreateUserProfile(req.user!.user_id, req.user!.mobile, req.user!.role, req.body);
    res.json(successResponse(user, 'User Profile updated successfully'));
  } catch (err: unknown) {
    if (err instanceof Error) {
      return res.status(400).json(errorResponse(err.message));
    }
    return res.status(500).json(errorResponse('An unknown error occurred'));
  }
};
