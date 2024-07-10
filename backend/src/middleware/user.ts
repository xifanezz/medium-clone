import { Next } from "hono";
import {Jwt} from 'hono/utils/jwt';

export async function authMiddleware(c:any, next : Next){
        

        const authHeader: string = c.req.header('authorization') || '';
        const token : string = authHeader.split(' ')[1];

       
        
        if(!authHeader || !authHeader.startsWith('Bearer ')){
            c.body('Please Signin' ,403);
        }
        try{
            const decoded = await Jwt.verify(token ,c.env.JWT_SECRET); 
            c.set("userId", decoded); 

            await next();
    
        } catch(error){
            return c.body('Unauthorised user',403);
        } 
}