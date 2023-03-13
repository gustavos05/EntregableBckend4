const catchError = require('../utils/catchError');
const Users = require('../models/Users');
const bcrypt=require('bcrypt');
const sendEmail = require('../utils/sendEmail');
const EmailCode = require('../models/EmailCode');
const jwt=require('jsonwebtoken');

const getAll = catchError(async(req, res) => {
    const results = await Users.findAll();
    return res.json(results);
});

const create = catchError(async(req, res) => {
    const {email,password,firstName,lastName,country,image,frontBaseUrl}=req.body
    const encripted=await bcrypt.hash(password,10)
    const result = await Users.create({email,password:encripted,firstName,lastName,country,image});
    const code = require('crypto').randomBytes(32).toString('hex')
    const link = `${frontBaseUrl}/verify_email/${code}`
    await sendEmail({
        to:email,
        subject:"UserApp email Verification",
        html:
            `<h1> hello ${firstName}!</h1>
            <p> we're almost done</p> 
            <p> please go to the following link, to verify your email </p>
            <a href="${link}">${link}</a>
            `
    })
    await EmailCode.create({code:code,userId:result.id});
    return res.status(201).json(result);
});

const getOne = catchError(async(req, res) => {
    const { id } = req.params;
    const result = await Users.findByPk(id);
    if(!result) return res.sendStatus(404);
    return res.json(result);
});

const remove = catchError(async(req, res) => {
    const { id } = req.params;
    await Users.destroy({ where: {id} });
    return res.sendStatus(204);
});

const update = catchError(async(req, res) => {
    const { id } = req.params;
    const {firstName,lastName,country,image}=req.body
    const result = await Users.update(
        {firstName,lastName,country,image},
        { where: {id}, returning: true }
    );
    if(result[0] === 0) return res.sendStatus(404);
    return res.json(result[1][0]);
});

const verifyEmail =catchError(async(req, res) =>{
    const {code}=req.params;
    const emailCode=await EmailCode.findOne({where:{code}});
    if(!emailCode) return res.status(401).json({message:'invalid code'})
    await Users.update({itsVerified:true},{where:{id:emailCode.userId}})
    await emailCode.destroy();
    return res.json(emailCode)
})

const login =catchError(async(req, res) =>{
    const {email,password}=req.body
    const user= await Users.findOne({where:{email}})
    if(!user) return res.status(401).json({message:'invalid user'})
    if(!user.itsVerified) return res.status(401).json({message:'invalid user'})
    const isValid= await bcrypt.compare(password,user.password);
    if(!isValid)  return res.status(401).json({message:'invalid user'})
    const token= jwt.sign({user},process.env.TOKEN_SECRET,{expireIn:'1d'})
    return res.json({user,token})
})

const getLoggedUser= catchError(async(req,res)=>{
    return res.json(req.user)
})

module.exports = {
    getAll,
    create,
    getOne,
    remove,
    update,
    verifyEmail,
    login,
    getLoggedUser
}