module.exports = {
    user: function (req, res, next) {
        if (!req.session.loggedin) {
            console.log("not logged in");
            return res.redirect('/login');
        }
        next();
    },
    admin: function (req, res, next) {
        if (!req.session.loggedin) {
            console.log("not logged in");
            return res.redirect('/login');
        } else if (!req.session.admin){
            console.log("not an admin");
            return res.redirect('/login');
        }
        next();
    },
}