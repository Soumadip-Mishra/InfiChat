import jwt from "jsonwebtoken";

export const generateToken =(id,res)=>{
    const token = jwt.sign({id},process.env.JWT_SECRET,{expiresIn : "7D"});
    
    res.cookie("jwt", token , {
        maxAge: 15*24*60*60*1000,
        httpOnly : true,
        sameSite:process.env.NODE_ENV !== "development"?"none": "lax",
        secure: process.env.NODE_ENV !== "development"
    })
    return token;
}

export const getPublicID = (folder , URL)=>{
    const splittedURL = URL.split('/');
    let resURL = folder;
    const idx = splittedURL.length-1;
    for (let i = 0 ;splittedURL[idx][i]!='.';i++){
        resURL+=splittedURL[idx][i];
    }
    
    return resURL;
}