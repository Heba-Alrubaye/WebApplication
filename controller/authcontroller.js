// lecture: NWEN304 on 9/11/2020 (Fri)

exports.getLogin = (req, res, next) => {
    // let loggedin = req.get('Cookie')

    res.render('login', {pageTitle: 'Login', loggedin: req.session.loggedin})
}

exports.postLogin = (req, res, next) => {
    console.log(req.body.email)
    req.session.loggedin = true
    console.log("within post", req.session.loggedin)
    res.redirect('/')
}