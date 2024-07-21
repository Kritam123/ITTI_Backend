import nodmailer from "nodemailer"

const sendEmail = async (options)=>{
    const transpoter = nodmailer.createTransport({
        host:process.env.SMTP,
        service:process.env.SERVICE,
        port:process.env.SMTP_PORT,
        auth:{
            user:process.env.EMAIL,
            pass:process.env.APP_PASSWORD
        }
    })
    
   const {email,subject,html} = options;
   const emailOptions= {
    from :process.env.EMAIL,
    to:email,
    subject,
    html,
    
   }
    await transpoter.sendMail(emailOptions);
}
export default sendEmail;