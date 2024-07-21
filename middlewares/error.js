import {ApiError as ErrorHandler} from "../utils/ApiError.js"
export default    ( error, req, res, next ) =>
{
    error.statuscode = error.statuscode || 500
    error.message = error.message || "Internal error";

    // wrong mongodb Id error
    if ( error.name === "CastError" )
    {
        const message = `Resource not found.Invalid ${ error.path }`
        error = new ErrorHandler( message, 400 )
    }
    // mongoose duplicate key error

    if ( error.code === 11000 )
    {
        const message = `Duplicate ${ Object.keys( error.keyvalue ) } Entered`
        error = new ErrorHandler( message, 400 );
    }
    //  worng Jwt token
    if ( error.code === "JsonWebTokenError" )
    {
        const message = `Json Web Token is invalid. Try again`
        error = new ErrorHandler( message, 400 );
    }
    //  Jwt Expire error
    if ( error.code === "TokenExpiredError" )
    {
        const message = `Json Web Token is Expired. Try again`
        error = new ErrorHandler( message, 400 );
    }

    res.status( error.statuscode, error.message ).json( {
        success: true,
        error: error,
        message: error.message,
        
    } )
}   