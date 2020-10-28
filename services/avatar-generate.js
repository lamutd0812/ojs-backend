const avatarGenerate = (firstname, lastname) => {
    const fullname = lastname + ' ' + firstname;
    return `https://ui-avatars.com/api/?rounded=true&bold=true&size=128&name=${fullname}&background=187bcd&color=fffff`
}

module.exports = avatarGenerate;