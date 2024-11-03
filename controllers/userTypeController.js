exports.getCurrentUserUserType = async (req, res) => {
    const currentUserType = req.cookies.useAs;
    if (!currentUserType) return res.json({
        useAs: 'user'
    })

    try {
        res.status(200).json({
            useAs: currentUserType
        });


    } catch (e) {
        console.log(e)
        res.status(500).send(e.message)
    }
}


exports.useAppAs = async (req, res) => {
    const useAs = await req.body.useAs;

    await res.cookie('useAs', useAs ? useAs : 'user', {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        maxAge: 90 * 24 * 60 * 60 * 1000,
        secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
        httpOnly: true
    });
    res.json(req.cookies.useAs);
}