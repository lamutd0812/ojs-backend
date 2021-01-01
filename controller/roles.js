const UserRole = require('../model/user_role');
const { StatusCodes } = require('http-status-codes');

exports.getAllUserRoles = async (req, res) => {
    try {
        const roles = await UserRole.find();
        res.status(StatusCodes.OK).json({ roles: roles });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: "Internal Server Error."
        });
        console.log(err);
    }
}

exports.getUserRoleById = async (req, res) => {
    const roleId = req.params.roleId;
    try {
        const role = await UserRole.findById(roleId);
        res.status(StatusCodes.OK).json({
            role: role
        })
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: "Internal Server Error."
        });
        console.log(err);
    }
}

exports.addUserRole = async (req, res) => {
    try {
        const role = new UserRole(req.body);
        const newRole = await role.save();
        res.status(StatusCodes.CREATED).json({ role: newRole });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: "Internal Server Error."
        });
        console.log(err);
    }
}

exports.updateUserRole = async (req, res) => {
    const roleId = req.params.roleId;
    try {
        const updatedRole = await UserRole.findByIdAndUpdate(roleId, req.body, { new: true });
        res.status(StatusCodes.OK).json({ role: updatedRole });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: "Internal Server Error."
        });
        console.log(err);
    }
};

exports.deleteUserRole = async (req, res) => {
    const roleId = req.params.roleId;
    try {
        const deletedRole = await UserRole.findByIdAndDelete(roleId);
        res.status(StatusCodes.OK).json({
            message: 'Deleted Role',
            roleId: deletedRole._id
        });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: "Internal Server Error."
        });
        console.log(err);
    }
};

