import { UserModel, IUser } from '../models/user.model';

export const createUser = async (query: Object) => {
    return UserModel.create(query);
};

export const findUserByMobile = async (mobile: string) => {
    return UserModel.findOne({ mobile });
};
