const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator');

//bring in user model. double dots takes you couple of levels up to the right folder 
const User = require('../../models/User'); 

//@route    POST api/users
//@desc     Register user
//@access   Public

router.post('/', 
[
    check('name', 'Name is required')
        .not()
        .notEmpty(),
    check('email', 'Please include valid email')
        .isEmail(),
    check('password', 'Please enter password with 6 or more characters')
        .isLength({ min:6})
], 
async (req,res)=> {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array()}); //send the validation from above to the front end which can be more meaningful for the user
    }

    //Pull info from the req.body so that we don't keep repeating req.body.name...
    const { name, email, password} = req.body;
    


    try {
        //check if user exists
        let user = await User.findOne({ email });

        if(user){
            res.status(400).json({ errors: [{msg:"User already exists"}]});
        }



        res.send('User route');
    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }




    

} );

module.exports = router;
