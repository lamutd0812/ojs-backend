const UserRole = require('../model/user_role');

exports.getAllUserRoles = async (req, res) => {
    try {
        const roles = await UserRole.find();
        res.status(200).json({ roles: roles });
    } catch (err) {
        res.status(500).json({
            error: err
        });
        console.log(err);
    }
}

exports.getUserRoleById = async (req, res) => {
    const roleId = req.params.roleId;
    try {
        const role = await UserRole.findById(roleId);
        res.status(200).json({
            role: role
        })
    } catch (err) {
        res.status(500).json({
            error: err
        });
        console.log(err);
    }
}

exports.addUserRole = async (req, res) => {
    try {
        const role = new UserRole(req.body);
        const newRole = await role.save();
        res.status(200).json({ role: newRole });
    } catch (err) {
        res.status(500).json({
            error: err
        });
        console.log(err);
    }
}

exports.updateUserRole = async (req, res) => {
    const roleId = req.params.roleId;
    try {
        const updatedRole = await UserRole.findByIdAndUpdate(roleId, req.body, { new: true });
        res.status(200).json({ role: updatedRole });
    } catch (err) {
        res.status(500).json({
            error: err
        });
        console.log(err);
    }
};

exports.deleteUserRole = async (req, res) => {
    const roleId = req.params.roleId;
    try {
        const deletedRole = await UserRole.findByIdAndDelete(roleId);
        res.status(200).json({
            message: 'Deleted Role',
            roleId: deletedRole._id
        });
    } catch (err) {
        res.status(500).json({
            error: err
        });
        console.log(err);
    }
};

