const User = require('../model/user');
const Category = require('../model/category');
const { StatusCodes } = require('http-status-codes');
const bcrypt = require('bcrypt');
const { deleteImage } = require('../services/image-services');

exports.getMyUserInfor = async (req, res) => {
    const userId = req.user.userId;
    try {
        const user = await User
            .findById(userId)
            .select(' -password')
            .populate('role', 'name')
            .populate('preferenceCategoryId')
            .lean()
            .exec();
        const preference = user.preferenceCategoryId.map(c => {
            return {
                value: c._id,
                label: c.name
            };
        });
        user.preferenceCategoryId = preference;
        res.status(StatusCodes.OK).json({
            user: user
        });
    } catch (err) {
        console.log(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: "Internal Server Error."
        });
    }
};

exports.getUserInfor = async (req, res) => {
    const userId = req.params.userId;
    try {
        const user = await User
            .findById(userId)
            .select(' -password')
            .populate('role', 'name')
            .exec();
        res.status(StatusCodes.OK).json({
            user: user
        });
    } catch (err) {
        console.log(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: "Internal Server Error."
        });
    }
};

exports.updateMyUserInfor = async (req, res) => {
    const userId = req.user.userId;

    const body = {
        email: req.body.email,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        affiliation: req.body.affiliation,
        biography: req.body.biography,
        preferenceCategoryId: req.body.preferenceCategoryId
    }

    try {
        const updatedUser = await User.findByIdAndUpdate(userId, body, { new: true });
        res.status(StatusCodes.OK).json({
            message: 'Cập nhật thông tin cá nhân thành công!',
            user: updatedUser
        });
    } catch (err) {
        console.log(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: "Internal Server Error."
        });
    }
};

exports.changePassword = async (req, res) => {
    const userId = req.user.userId;
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;
    let user;
    try {
        const u = await User.findById(userId);
        if (!u) {
            res.status(StatusCodes.UNAUTHORIZED).json({
                error: 'Tài khoản không tồn tại!'
            });
        } else {
            user = u;
            const isEqualPw = await bcrypt.compare(oldPassword, user.password);
            if (!isEqualPw) {
                res.status(StatusCodes.UNAUTHORIZED).json({
                    error: 'Mật khẩu cũ không chính xác!'
                });
            } else {
                res.status(StatusCodes.OK).json({
                    message: 'Thay đổi mật khẩu thành công!'
                });
                const hashedPassword = await bcrypt.hash(newPassword, 12);
                user.password = hashedPassword;
                await user.save();
            }
        }
    } catch (err) {
        console.log(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: "Internal Server Error."
        });
    }
};

exports.changeAvatar = async (req, res) => {
    const userId = req.user.userId;
    try {
        if (req.error) { // in image-service upload error.
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                error: req.error
            });
        } else {
            if (req.file) {
                res.status(StatusCodes.OK).json({
                    message: 'Cập nhật ảnh đại diện thành công!',
                    avatar: req.file.location
                });
                //
                const user = await User.findById(userId);
                deleteImage(user.avatar);
                user.avatar = req.file.location;
                await user.save();
            } else {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                    error: "Không có hình ảnh nào được tải lên"
                });
            }
        }
    } catch (err) {
        console.log(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: "Internal Server Error."
        });
    }
};

exports.getAllPreferenceCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(StatusCodes.OK).json({
            categories: categories.map(c => {
                return {
                    value: c._id,
                    label: c.name
                };
            })
        });
    } catch (err) {
        console.log(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: "Internal Server Error."
        });
    }
};

exports.getAllUserInfor = async (req, res) => {
    const page = +req.query.page || 1;
    const ITEMS_PER_PAGE = +req.query.limit || 8;
    try {
        const total = await User.countDocuments();
        const users = await User
            .find()
            .select(' -password')
            .populate('role', 'name')
            .populate('preferenceCategoryId')
            .sort({ _id: -1 })
            .skip((page - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE)
            .lean()
            .exec();

        res.status(StatusCodes.OK).json({
            users: users,
            total: total,
            currentPage: page
        });
    } catch (err) {
        console.log(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: "Internal Server Error."
        });
    }
};

exports.changeUserRole = async (req, res) => {
    const userId = req.params.userId;
    const roleId = req.body.roleId;
    try {
        const updatedUser = await User.findByIdAndUpdate(userId, { role: roleId }, { new: true });
        res.status(StatusCodes.OK).json({
            message: "Phân quyền người dùng thành công!",
            updatedUser: updatedUser
        });
    } catch (err) {
        console.log(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: "Internal Server Error."
        });
    }
};
