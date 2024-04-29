const router=require('express').Router();
const multer = require('multer');
const path = require('path');
const File = require('../models/file');
const { request } = require('http');

const uuid ={v4: uuidv4}= require('uuid');

let storage = multer.diskStorage({
    destination: (req,file, cb)=> cb(null,'uploads/'),
    filename: (req,file,cb) => {
        const uniqueName =`${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;

        cb(null, uniqueName);
    } 
})

let upload =multer({
    storage,
    limit :{
        fileSize : 100000* 100 
    }

}).single('myfile');

router.post('/',(req,res)=>{
    

    // store file
     upload(req,res, async (err)=>{

         //validate req
         if(!req.file){
             return res.json({error : 'Alll fields are required '});
         
         }

        if(err) {
            return res.status(500).send({error: err.message});
        }

        // store data on databse 
        const file = new File({
            filename: req.file.filename,
            uuid: uuidv4(),
            path: req.file.path,
            size: req.file.size
        });
        const response = await file.save();
        return res.json({ file: `${process.env.APP_BASE_URL}/files/${response.uuid}`
        });
        //http:localhost:3000/files/234234



     });


    

    // Response -> link 

});

router.post('/send', async (req,res)=>{
    // Validate request 
    const{uuid,emailTo,emailFrom} = req.body;
    

    if(!uuid ||!emailTo || !emailFrom){
        return res.status(422).send({error:'All Field are required '});

    }


    // Get Data from Database

    const file=await File.findOne({uuid: uuid});
    if(file.sender){
        return res.status(422).send({error:'Email Already send '});
    }
    file.sender = emailFrom;

    file.receiver= emailTo;
    const response=await file.save();

    //Send Email
    const sendMail = require('../services/emailService'); 

    sendMail({
        from: emailFrom,
        to: emailTo,
        subject: 'ProjectX',
        text: `${emailFrom} shared file with you `,
        html: require('../services/emailTemplate')({
            emailFrom ,
            downloadLink: `${process.env.APP_BASE_URL}/files/${file.uuid}?source=email`,
            size: parseInt(file.size/1000)+ 'KB',
            expires: '24 Hours'

        })
    }).then(() => {
        return res.send({success: true});
    }).catch(err => {
        console.log(err);
        return res.status(500).json({
            error: 'Error in email sending '
        });
    }).catch(err => {
        console.log(err);
        return res.status(500).send({error : "Something went wrong "});
        
    });    

});
module.exports=router;