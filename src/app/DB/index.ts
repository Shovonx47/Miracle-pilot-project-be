import { StatusCodes } from "http-status-codes";
import config from "../config";
import AppError from "../errors/AppError";
import { USER_ROLE } from "../modules/Auth/auth.const";
import { Auth } from "../modules/Auth/auth.model";
import { sendEmailForRegistrationId } from "../modules/Auth/auth.utils";

const superUser = {
    userId: config.super_admin_userId as string,
    firstName: "Syed A",
    lastName: "Kashem",
    name: "Syed A. Kashem",
    email: config.super_admin_email as string,
    password: config.super_admin_password,
    role: USER_ROLE.super_admin,
    status: "active",
    isDeleted: false,
    isCompleted: false,
};

const seedSuperAdmin = async () => {
    try {
        const existingSuperAdmin = await Auth.findOne({ role: USER_ROLE.super_admin});

        if (!existingSuperAdmin) {
            const createdSuperAdmin = await Auth.create(superUser);

            if (!createdSuperAdmin) {
                throw new AppError(StatusCodes.BAD_REQUEST, "Failed to create Super Admin");
            }

            await sendEmailForRegistrationId(
                superUser.email,
                superUser.name,
                superUser.userId
            );

        }
    } catch (error) {
        throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, "Super Admin creation failed");
    }
};

export default seedSuperAdmin;
