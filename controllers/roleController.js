const Role = require('../model/roleModel');

exports.getAllRole = async (req, res) => {

    try {
        const allRole = await Role.find({}).select('-__v -_id');

        res.status(200).json({
            count: allRole.length,
            data: allRole
        });

    } catch (err) {
        console.log(err);
        res.status(500).send(err.message);
    }
}

exports.addRole = async (req, res) => {
    const {title} = req.body;

    if (!title) return res.status(400).send('Role title must enter!');

    try {
        const newRole = await Role.create({title});

        res.status(201).json({
            status: 'success',
            Role: Role
        });
    } catch (err) {
        console.log(err);
        res.status(500).send(err.message);
    }
}


exports.updateRole = async (req, res) => {
    const roleId = req.params.roleId;
    if (!roleId) return res.status(400).send('Select role that you want to update or enter its ID!');

    const {newTitle} = req.body
    if (!newTitle) return res.status(400).send('Yu must enter new title to update the role!');

    try {
        const updatedRole = await Role.findByIdAndUpdate(roleId, {title: newTitle}, {new: true});
        if (!updatedRole) return res.status(404).send('There is no  role with this id');

        res.status(200).json({
            updateStatus: 'success',
            updatedRole: updatedRole
        });

    } catch (err) {
        console.log(err)
        res.status(500).send(err.message);
    }
}

exports.deleteRole = async (req, res) => {
    const roleId = req.params.roleId;
    if (!roleId) return res.status(400).send('Select role that you want to update or enter its ID!');

    const deletedRole = await Role.findByIdAndDelete(roleId);
    if (!deletedRole) return res.status(404).send('There is no role with this id');

    res.status(200).send('Delete successful');
}